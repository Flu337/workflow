import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_ARTICLES,
  FAQ_ITEMS,
  findKnowledgeArticleBySlug,
  filterKnowledgeArticles,
  filterFaqItems
} from '../../shared/utils/publicContent.ts'
import { buildPublicSeoDescriptor } from '../../app/composables/usePublicSeo.ts'

describe('Stage 6 Unit & Integration: SSR Public Content, SEO Metadata, 404 & Sitemaps', () => {
  it('содержит полный набор SSR-данных для FAQ, Центра помощи и Статей без гидратационных расхождений', () => {
    assert.equal(KNOWLEDGE_CATEGORIES.length, 3)
    assert.equal(KNOWLEDGE_ARTICLES.length, 4)
    assert.equal(FAQ_ITEMS.length, 5)

    const firstArticle = findKnowledgeArticleBySlug('kak-sozdat-pervuiu-zaiavku')
    assert.ok(firstArticle)
    assert.equal(firstArticle.title, 'Как создать первую заявку')
    assert.equal(firstArticle.updatedLabel, 'Начало работы · Обновлено 5 октября 2026')
    assert.equal(firstArticle.sections.length, 5)

    assert.equal(filterKnowledgeArticles('комментарий').length, 1)
    assert.equal(filterFaqItems('SLA').length, 1)
  })

  it('возвращает null для несуществующего slug статьи (триггер для 404 Статья не найдена)', () => {
    const missing = findKnowledgeArticleBySlug('nesushchestvuiushchaia-statia-999')
    assert.equal(missing, null)
  })

  it('формирует уникальные title, description, canonical и Open Graph метаданные для каждой публичной страницы', () => {
    const landingSeo = buildPublicSeoDescriptor({
      title: 'WorkFlow — система управления сервисными заявками',
      description: 'От первого обращения до решения.',
      path: '/',
      type: 'website'
    })
    const faqSeo = buildPublicSeoDescriptor({
      title: 'Частые вопросы (FAQ)',
      description: 'Ответы о работе с сервисными заявками.',
      path: '/faq',
      type: 'website'
    })
    const helpSeo = buildPublicSeoDescriptor({
      title: 'Центр помощи',
      description: 'Найдите ответ или отправьте обращение.',
      path: '/help',
      type: 'website'
    })
    const articleSeo = buildPublicSeoDescriptor({
      title: 'Как создать первую заявку',
      description: 'Пошаговая инструкция по созданию первого обращения.',
      path: '/articles/kak-sozdat-pervuiu-zaiavku',
      type: 'article'
    })

    const titles = new Set([
      landingSeo.fullTitle,
      faqSeo.fullTitle,
      helpSeo.fullTitle,
      articleSeo.fullTitle
    ])
    const canonicals = new Set([
      landingSeo.canonicalUrl,
      faqSeo.canonicalUrl,
      helpSeo.canonicalUrl,
      articleSeo.canonicalUrl
    ])

    assert.equal(titles.size, 4)
    assert.equal(canonicals.size, 4)
    assert.equal(articleSeo.ogType, 'article')
    assert.equal(
      articleSeo.canonicalUrl,
      'https://workflow.octagon-students.ru/articles/kak-sozdat-pervuiu-zaiavku'
    )
  })

  it('проверяет наличие и корректность public/robots.txt, public/sitemap.xml и docs/PERFORMANCE.md', () => {
    const rootDir = process.cwd()
    const robotsTxt = fs.readFileSync(path.join(rootDir, 'public/robots.txt'), 'utf-8')
    const sitemapXml = fs.readFileSync(path.join(rootDir, 'public/sitemap.xml'), 'utf-8')
    const perfMd = fs.readFileSync(path.join(rootDir, 'docs/PERFORMANCE.md'), 'utf-8')

    assert.equal(robotsTxt.includes('Allow: /faq'), true)
    assert.equal(robotsTxt.includes('Allow: /help'), true)
    assert.equal(robotsTxt.includes('Allow: /articles'), true)
    assert.equal(robotsTxt.includes('Disallow: /requests'), true)
    assert.equal(robotsTxt.includes('Sitemap: https://workflow.octagon-students.ru/sitemap.xml'), true)

    for (const article of KNOWLEDGE_ARTICLES) {
      assert.equal(
        sitemapXml.includes(`https://workflow.octagon-students.ru/articles/${article.slug}`),
        true
      )
    }

    assert.equal(perfMd.includes('Hydration Mismatch'), true)
    assert.equal(perfMd.includes('Performance Budget'), true)
  })
})
