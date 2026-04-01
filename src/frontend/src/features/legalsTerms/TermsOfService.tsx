import { Screen } from '@/layout/Screen'
import { A, H, P, Ul } from '@/primitives'
import { HStack } from '@/styled-system/jsx'
import { useTranslation } from 'react-i18next'

const ensureStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string')
}

// Stable, deterministic key generator (no external deps).
const stableKey = (input: string): string => {
  let hash = 5381
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.codePointAt(i) ?? 0
  }
  return (hash >>> 0).toString(16)
}

export const TermsOfServiceRoute = () => {
  const { t } = useTranslation('termsOfService')

  const section75Content = t('articles.article7.sections.section5.content')
  const section75Parts = section75Content.split(
    'https://github.com/suitenumerique/meet'
  )
  const section75Before = section75Parts[0] ?? ''
  const section75After = section75Parts[1] ?? ''

  const s51Capabilities = ensureStringArray(
    t('articles.article5.sections.section1.capabilities', {
      returnObjects: true,
    })
  )

  const s52Capabilities = ensureStringArray(
    t('articles.article5.sections.section2.capabilities', {
      returnObjects: true,
    })
  )

  const a61Paragraphs = ensureStringArray(
    t('articles.article6.sections.section1.paragraphs', { returnObjects: true })
  )

  const a62Paragraphs = ensureStringArray(
    t('articles.article6.sections.section2.paragraphs', { returnObjects: true })
  )

  const a71Paragraphs = ensureStringArray(
    t('articles.article7.sections.section1.paragraphs', { returnObjects: true })
  )

  const a72Paragraphs = ensureStringArray(
    t('articles.article7.sections.section2.paragraphs', { returnObjects: true })
  )

  const a73Paragraphs = ensureStringArray(
    t('articles.article7.sections.section3.paragraphs', { returnObjects: true })
  )

  const a74Paragraphs = ensureStringArray(
    t('articles.article7.sections.section4.paragraphs', { returnObjects: true })
  )

  return (
    <Screen>
      <HStack>
        <H lvl={1}>{t('articles.article1.title')}</H>
      </HStack>
      <P>{t('articles.article1.content')}</P>

      <H lvl={2}>{t('articles.article2.title')}</H>
      <P>{t('articles.article2.content')}</P>
      <P>{t('articles.article2.purposes')}</P>

      <H lvl={2}>{t('articles.article3.title')}</H>
      <P>{t('articles.article3.definition')}</P>

      <H lvl={2}>{t('articles.article4.title')}</H>
      <P>{t('articles.article4.content')}</P>

      <H lvl={2}>{t('articles.article5.title')}</H>

      <H lvl={3}>{t('articles.article5.sections.section1.title')}</H>
      <P>{t('articles.article5.sections.section1.content')}</P>
      <P>{t('articles.article5.sections.section1.paragraph1')}</P>
      <P>{t('articles.article5.sections.section1.paragraph2')}</P>

      <Ul>
        {s51Capabilities.map((capability) => (
          <li key={`tos-a5s1-${stableKey(capability)}`}>{capability}</li>
        ))}
      </Ul>

      <H lvl={3}>{t('articles.article5.sections.section2.title')}</H>
      <P>{t('articles.article5.sections.section2.content')}</P>
      <P>{t('articles.article5.sections.section2.paragraph')}</P>

      <Ul>
        {s52Capabilities.map((capability) => (
          <li key={`tos-a5s2-${stableKey(capability)}`}>{capability}</li>
        ))}
      </Ul>

      <H lvl={2}>{t('articles.article6.title')}</H>

      <H lvl={3}>{t('articles.article6.sections.section1.title')}</H>
      {a61Paragraphs.map((paragraph) => (
        <P key={`tos-a6s1-${stableKey(paragraph)}`}>{paragraph}</P>
      ))}

      <H lvl={3}>{t('articles.article6.sections.section2.title')}</H>
      {a62Paragraphs.map((paragraph) => (
        <P key={`tos-a6s2-${stableKey(paragraph)}`}>{paragraph}</P>
      ))}

      <H lvl={2}>{t('articles.article7.title')}</H>
      <P>{t('articles.article7.content')}</P>

      <H lvl={3}>{t('articles.article7.sections.section1.title')}</H>
      {a71Paragraphs.map((paragraph) => (
        <P key={`tos-a7s1-${stableKey(paragraph)}`}>{paragraph}</P>
      ))}

      <H lvl={3}>{t('articles.article7.sections.section2.title')}</H>
      {a72Paragraphs.map((paragraph) => (
        <P key={`tos-a7s2-${stableKey(paragraph)}`}>{paragraph}</P>
      ))}

      <H lvl={3}>{t('articles.article7.sections.section3.title')}</H>
      {a73Paragraphs.map((paragraph) => (
        <P key={`tos-a7s3-${stableKey(paragraph)}`}>{paragraph}</P>
      ))}

      <H lvl={3}>{t('articles.article7.sections.section4.title')}</H>
      {a74Paragraphs.map((paragraph) => (
        <P key={`tos-a7s4-${stableKey(paragraph)}`}>{paragraph}</P>
      ))}

      <H lvl={3}>{t('articles.article7.sections.section5.title')}</H>
      <P>
        {section75Before}{' '}
        <A href="https://github.com/suitenumerique/meet">
          https://github.com/suitenumerique/meet
        </A>{' '}
        {section75After}
      </P>

      <H lvl={2}>{t('articles.article8.title')}</H>
      <P>{t('articles.article8.content')}</P>
    </Screen>
  )
}
