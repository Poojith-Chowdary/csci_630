import { ProcessorOptions, Track } from 'livekit-client'
import posthog from 'posthog-js'
import {
  FilesetResolver,
  ImageSegmenter,
  ImageSegmenterResult,
} from '@mediapipe/tasks-vision'
import {
  CLEAR_TIMEOUT,
  SET_TIMEOUT,
  TIMEOUT_TICK,
  timerWorkerScript,
} from './TimerWorker'
import {
  BackgroundProcessorInterface,
  BackgroundOptions,
  ProcessorType,
} from '.'

const PROCESSING_WIDTH = 256
const PROCESSING_HEIGHT = 144

const SEGMENTATION_MASK_CANVAS_ID = 'background-blur-local-segmentation'
const BLUR_CANVAS_ID = 'background-blur-local'

const DEFAULT_BLUR = '10'

const OPACITY_MASK_BLUR_FILTER = 'blur(8px)'
const FPS = 30
const FRAME_DELAY_MS = 1000 / FPS

type RequiredState = {
  source: MediaStreamTrack
  sourceSettings: MediaTrackSettings
  videoElement: HTMLVideoElement

  outputCanvas: HTMLCanvasElement
  outputCanvasCtx: CanvasRenderingContext2D

  segmentationMaskCanvas: HTMLCanvasElement
  segmentationMaskCanvasCtx: CanvasRenderingContext2D

  segmentationMask: ImageData
  imageSegmenter: ImageSegmenter
  timerWorker: Worker
}

export class BackgroundCustomProcessor implements BackgroundProcessorInterface {
  options: BackgroundOptions
  name: string
  processedTrack?: MediaStreamTrack | undefined

  source?: MediaStreamTrack
  sourceSettings?: MediaTrackSettings
  videoElement?: HTMLVideoElement
  videoElementLoaded?: boolean

  // Canvas containg the video processing result, of which we extract as stream.
  outputCanvas?: HTMLCanvasElement
  outputCanvasCtx?: CanvasRenderingContext2D

  imageSegmenter?: ImageSegmenter
  imageSegmenterResult?: ImageSegmenterResult

  // Canvas used for resizing video source and projecting mask.
  segmentationMaskCanvas?: HTMLCanvasElement
  segmentationMaskCanvasCtx?: CanvasRenderingContext2D

  // Mask containg the inference result.
  segmentationMask?: ImageData

  // The resized image of the video source.
  sourceImageData?: ImageData

  timerWorker?: Worker

  type: ProcessorType
  virtualBackgroundImage?: HTMLImageElement

  constructor(opts: BackgroundOptions) {
    this.name = 'blur'
    this.options = opts

    if (this.options.blurRadius) {
      this.type = ProcessorType.BLUR
    } else {
      this.type = ProcessorType.VIRTUAL
    }
  }

  static get isSupported() {
    return navigator.userAgent.toLowerCase().includes('firefox')
  }

  private getRequiredState(): RequiredState {
    if (this.source === undefined) {
      throw new Error('BackgroundCustomProcessor is not initialized: source is missing')
    }
    if (this.sourceSettings === undefined) {
      throw new Error('BackgroundCustomProcessor is not initialized: sourceSettings is missing')
    }
    if (this.videoElement === undefined) {
      throw new Error('BackgroundCustomProcessor is not initialized: videoElement is missing')
    }
    if (this.outputCanvas === undefined || this.outputCanvasCtx === undefined) {
      throw new Error('BackgroundCustomProcessor is not initialized: output canvas is missing')
    }
    if (
      this.segmentationMaskCanvas === undefined ||
      this.segmentationMaskCanvasCtx === undefined
    ) {
      throw new Error('BackgroundCustomProcessor is not initialized: mask canvas is missing')
    }
    if (this.segmentationMask === undefined) {
      throw new Error('BackgroundCustomProcessor is not initialized: segmentationMask is missing')
    }
    if (this.imageSegmenter === undefined) {
      throw new Error('BackgroundCustomProcessor is not initialized: imageSegmenter is missing')
    }
    if (this.timerWorker === undefined) {
      throw new Error('BackgroundCustomProcessor is not initialized: timerWorker is missing')
    }

    return {
      source: this.source,
      sourceSettings: this.sourceSettings,
      videoElement: this.videoElement,
      outputCanvas: this.outputCanvas,
      outputCanvasCtx: this.outputCanvasCtx,
      segmentationMaskCanvas: this.segmentationMaskCanvas,
      segmentationMaskCanvasCtx: this.segmentationMaskCanvasCtx,
      segmentationMask: this.segmentationMask,
      imageSegmenter: this.imageSegmenter,
      timerWorker: this.timerWorker,
    }
  }

  async init(opts: ProcessorOptions<Track.Kind>) {
    if (!opts.element) {
      throw new Error('Element is required for processing')
    }

    const source = opts.track as MediaStreamTrack
    const sourceSettings = source.getSettings()
    const videoElement = opts.element as HTMLVideoElement

    this.source = source
    this.sourceSettings = sourceSettings
    this.videoElement = videoElement

    this._initVirtualBackgroundImage()
    this._createMainCanvas()
    this._createMaskCanvas()

    if (this.outputCanvas === undefined) {
      throw new Error('Output canvas is missing after initialization')
    }

    const stream = this.outputCanvas.captureStream()
    const tracks = stream.getVideoTracks()
    if (tracks.length === 0) {
      throw new Error('No tracks found for processing')
    }
    this.processedTrack = tracks[0]

    this.segmentationMask = new ImageData(PROCESSING_WIDTH, PROCESSING_HEIGHT)
    await this.initSegmenter()
    this._initWorker()

    posthog.capture('firefox-blurring-init')
  }

  _initVirtualBackgroundImage() {
    const needsUpdate =
      this.options.imagePath &&
      this.virtualBackgroundImage &&
      this.virtualBackgroundImage.src !== this.options.imagePath
    if (this.options.imagePath || needsUpdate) {
      this.virtualBackgroundImage = document.createElement('img')
      this.virtualBackgroundImage.crossOrigin = 'anonymous'
      this.virtualBackgroundImage.src = this.options.imagePath as string
    }
  }

  async update(opts: BackgroundOptions): Promise<void> {
    this.options = opts
    this._initVirtualBackgroundImage()
  }

  private scheduleNextFrame() {
    const { timerWorker } = this.getRequiredState()
    timerWorker.postMessage({
      id: SET_TIMEOUT,
      timeMs: FRAME_DELAY_MS,
    })
  }

  _initWorker() {
    this.timerWorker = new Worker(timerWorkerScript, {
      name: 'Blurring',
    })
    this.timerWorker.onmessage = (data) => this.onTimerMessage(data)

    const { timerWorker, videoElement } = this.getRequiredState()

    // When hiding camera then showing it again, the onloadeddata callback is not fired again.
    if (this.videoElementLoaded) {
      timerWorker.postMessage({
        id: SET_TIMEOUT,
        timeMs: FRAME_DELAY_MS,
      })
    } else {
      videoElement.onloadeddata = () => {
        this.videoElementLoaded = true
        timerWorker.postMessage({
          id: SET_TIMEOUT,
          timeMs: FRAME_DELAY_MS,
        })
      }
    }
  }

  onTimerMessage(response: { data: { id: number } }) {
    if (response.data.id === TIMEOUT_TICK) {
      this.process()
    }
  }

  async initSegmenter() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    )
    this.imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite',
        delegate: 'CPU', // Use CPU for Firefox.
      },
      runningMode: 'VIDEO',
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    })
  }

  /**
   * Resize the source video to the processing resolution.
   */
  async sizeSource() {
    const { segmentationMaskCanvasCtx, videoElement } = this.getRequiredState()

    segmentationMaskCanvasCtx.drawImage(
      videoElement,
      0,
      0,
      videoElement.videoWidth,
      videoElement.videoHeight,
      0,
      0,
      PROCESSING_WIDTH,
      PROCESSING_HEIGHT
    )

    // Keep original behavior (note: existing code uses PROCESSING_WIDTH twice)
    this.sourceImageData = segmentationMaskCanvasCtx.getImageData(
      0,
      0,
      PROCESSING_WIDTH,
      PROCESSING_WIDTH
    )
  }

  /**
   * Run the segmentation.
   */
  async segment() {
    const { imageSegmenter } = this.getRequiredState()
    const sourceImageData = this.sourceImageData
    if (sourceImageData === undefined) {
      throw new Error('sourceImageData is missing before segmentation')
    }

    const startTimeMs = performance.now()
    return new Promise<void>((resolve) => {
      imageSegmenter.segmentForVideo(
        sourceImageData,
        startTimeMs,
        (result: ImageSegmenterResult) => {
          this.imageSegmenterResult = result
          resolve()
        }
      )
    })
  }

  /**
   * Shared pipeline:
   * - build alpha mask from categoryMask
   * - write ImageData to segmentation canvas
   * - stamp it so downstream drawImage uses it
   */
  private updateSegmentationMaskCanvas(): void {
    const {
      segmentationMask,
      segmentationMaskCanvas,
      segmentationMaskCanvasCtx,
    } = this.getRequiredState()

    const result = this.imageSegmenterResult
    const categoryMask = result?.categoryMask
    if (categoryMask === undefined) {
      throw new Error('Segmentation result is missing categoryMask')
    }

    const mask = categoryMask.getAsUint8Array()
    for (let i = 0; i < mask.length; i += 1) {
      segmentationMask.data[i * 4 + 3] = 255 - mask[i]
    }

    segmentationMaskCanvasCtx.putImageData(segmentationMask, 0, 0)

    // Keep a consistent stamp step (mirrors the repeated code path intent)
    segmentationMaskCanvasCtx.drawImage(
      segmentationMaskCanvas,
      0,
      0,
      PROCESSING_WIDTH,
      PROCESSING_HEIGHT
    )
  }

  /**
   * Shared opacity mask stage used by both blur + virtual background.
   */
  private drawOpacityMask(): void {
    const {
      outputCanvasCtx,
      segmentationMaskCanvas,
      videoElement,
    } = this.getRequiredState()

    outputCanvasCtx.globalCompositeOperation = 'copy'
    outputCanvasCtx.filter = OPACITY_MASK_BLUR_FILTER

    outputCanvasCtx.drawImage(
      segmentationMaskCanvas,
      0,
      0,
      PROCESSING_WIDTH,
      PROCESSING_HEIGHT,
      0,
      0,
      videoElement.videoWidth,
      videoElement.videoHeight
    )
  }

  /**
   * TODO: future improvement with WebGL.
   */
  async blur() {
    const { outputCanvasCtx, videoElement } = this.getRequiredState()

    this.updateSegmentationMaskCanvas()
    this.drawOpacityMask()

    // Draw clear body.
    outputCanvasCtx.globalCompositeOperation = 'source-in'
    outputCanvasCtx.filter = 'none'
    outputCanvasCtx.drawImage(videoElement, 0, 0)

    // Draw blurry background.
    outputCanvasCtx.globalCompositeOperation = 'destination-over'
    outputCanvasCtx.filter = `blur(${this.options.blurRadius ?? DEFAULT_BLUR}px)`
    outputCanvasCtx.drawImage(videoElement, 0, 0)
  }

  /**
   * TODO: future improvement with WebGL.
   */
  async drawVirtualBackground() {
    const { outputCanvas, outputCanvasCtx, videoElement } = this.getRequiredState()

    const virtualBackgroundImage = this.virtualBackgroundImage
    if (virtualBackgroundImage === undefined) {
      throw new Error('virtualBackgroundImage is missing for virtual background mode')
    }

    this.updateSegmentationMaskCanvas()
    this.drawOpacityMask()

    // Draw clear body.
    outputCanvasCtx.globalCompositeOperation = 'source-in'
    outputCanvasCtx.filter = 'none'
    outputCanvasCtx.drawImage(videoElement, 0, 0)

    // Draw virtual background.
    outputCanvasCtx.globalCompositeOperation = 'destination-over'
    outputCanvasCtx.filter = 'none'
    outputCanvasCtx.drawImage(
      virtualBackgroundImage,
      0,
      0,
      outputCanvas.width,
      outputCanvas.height
    )
  }

  async process() {
    await this.sizeSource()
    await this.segment()

    if (this.options.blurRadius) {
      await this.blur()
    } else {
      await this.drawVirtualBackground()
    }

    this.scheduleNextFrame()
  }

  _createMainCanvas() {
    const existing = document.querySelector<HTMLCanvasElement>(
      `canvas#${BLUR_CANVAS_ID}`
    )
    this.outputCanvas = existing ?? undefined

    const { sourceSettings } = this.getRequiredState()

    if (this.outputCanvas === undefined) {
      const width = sourceSettings.width
      const height = sourceSettings.height
      if (width === undefined || height === undefined) {
        throw new Error('sourceSettings width/height are required to create output canvas')
      }

      this.outputCanvas = this._createCanvas(BLUR_CANVAS_ID, width, height)
    }

    const ctx = this.outputCanvas.getContext('2d')
    if (ctx === null) {
      throw new Error('Failed to create 2D context for output canvas')
    }
    this.outputCanvasCtx = ctx
  }

  _createMaskCanvas() {
    const existing = document.querySelector<HTMLCanvasElement>(
      `#${SEGMENTATION_MASK_CANVAS_ID}`
    )
    this.segmentationMaskCanvas = existing ?? undefined

    if (this.segmentationMaskCanvas === undefined) {
      this.segmentationMaskCanvas = this._createCanvas(
        SEGMENTATION_MASK_CANVAS_ID,
        PROCESSING_WIDTH,
        PROCESSING_HEIGHT
      )
    }

    const ctx = this.segmentationMaskCanvas.getContext('2d')
    if (ctx === null) {
      throw new Error('Failed to create 2D context for segmentation mask canvas')
    }
    this.segmentationMaskCanvasCtx = ctx
  }

  _createCanvas(id: string, width: number, height: number) {
    const element = document.createElement('canvas')
    element.setAttribute('id', id)
    element.setAttribute('width', '' + width)
    element.setAttribute('height', '' + height)
    return element
  }

  async restart(opts: ProcessorOptions<Track.Kind>) {
    await this.destroy()
    return this.init(opts)
  }

  async destroy() {
    this.timerWorker?.postMessage({
      id: CLEAR_TIMEOUT,
    })

    this.timerWorker?.terminate()
    this.imageSegmenter?.close()
  }

  clone() {
    return new BackgroundCustomProcessor(this.options)
  }

  serialize() {
    return {
      type: this.type,
      options: this.options,
    }
  }
}
