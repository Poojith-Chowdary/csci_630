import { authUrl } from '@/features/auth'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { storageRepository } from '@/utils/StorageRepository'

const isRetryAllowed = () => {
  const lastRetryDate = storageRepository.load<string | null>(
    STORAGE_KEYS.SILENT_LOGIN_RETRY,
    null
  )
  if (!lastRetryDate) {
    return true
  }
  const now = new Date()
  return now.getTime() > Number(lastRetryDate)
}

const setNextRetryTime = (retryIntervalInSeconds: number) => {
  const now = new Date()
  const nextRetryTime = now.getTime() + retryIntervalInSeconds * 1000
  storageRepository.save(STORAGE_KEYS.SILENT_LOGIN_RETRY, String(nextRetryTime))
}

const initiateSilentLogin = () => {
  window.location.href = authUrl({ silent: true })
}

export const canAttemptSilentLogin = () => {
  return isRetryAllowed()
}

export const attemptSilentLogin = (retryIntervalInSeconds: number) => {
  if (!isRetryAllowed()) {
    return
  }
  setNextRetryTime(retryIntervalInSeconds)
  initiateSilentLogin()
}
