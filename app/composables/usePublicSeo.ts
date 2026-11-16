export interface PublicSeoInput {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
}

export interface ComputedSeoDescriptor {
  fullTitle: string
  description: string
  canonicalUrl: string
  ogType: 'website' | 'article'
  ogImage: string
}

const SITE_ORIGIN = 'https://workflow.octagon-students.ru'

export function buildPublicSeoDescriptor(input: PublicSeoInput): ComputedSeoDescriptor {
  const normalizedPath = input.path.startsWith('/') ? input.path : `/${input.path}`
  const fullTitle = input.title.includes('WorkFlow')
    ? input.title
    : `${input.title} — WorkFlow`

  return {
    fullTitle,
    description: input.description,
    canonicalUrl: `${SITE_ORIGIN}${normalizedPath}`,
    ogType: input.type || 'website',
    ogImage: `${SITE_ORIGIN}/images/hero-1280.png`
  }
}

// установка уникальных title description canonical и open graph метатегов для ssr страниц
export function usePublicSeo(input: PublicSeoInput): ComputedSeoDescriptor {
  const descriptor = buildPublicSeoDescriptor(input)

  useSeoMeta({
    title: descriptor.fullTitle,
    description: descriptor.description,
    ogTitle: descriptor.fullTitle,
    ogDescription: descriptor.description,
    ogType: descriptor.ogType,
    ogUrl: descriptor.canonicalUrl,
    ogImage: descriptor.ogImage,
    twitterCard: 'summary_large_image',
    twitterTitle: descriptor.fullTitle,
    twitterDescription: descriptor.description
  })

  useHead({
    title: descriptor.fullTitle,
    link: [
      {
        rel: 'canonical',
        href: descriptor.canonicalUrl
      }
    ]
  })

  return descriptor
}
