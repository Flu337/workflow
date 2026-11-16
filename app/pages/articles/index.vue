<script setup lang="ts">
import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_ARTICLES,
  filterKnowledgeArticles
} from '../../../shared/utils/publicContent'
import { usePublicSeo } from '~/composables/usePublicSeo'

definePageMeta({
  layout: 'public'
})

usePublicSeo({
  title: 'Статьи и инструкции — WorkFlow',
  description:
    'База знаний WorkFlow: статьи и пошаговые инструкции по началу работы, созданию первой заявки, отслеживанию статусов, комментариям и подтверждению решения.',
  path: '/articles',
  type: 'website'
})

const router = useRouter()
const searchQuery = ref('')

const displayedArticles = computed(() => filterKnowledgeArticles(searchQuery.value))

const openArticle = (slug: string) => {
  router.push(`/articles/${slug}`)
}
</script>

<template>
  <div class="layer-6-03-stat-i">
    <WFGPTPublicNav />

    <main class="soderzhanie-stranitsy">
      <h1 class="stat-i-i-instruktsii">Статьи и инструкции</h1>
      <p class="naidite-otvet-ili-otprav-te-obrashchenie">
        Найдите ответ или отправьте обращение
      </p>

      <div class="wf-gpt-field">
        <WFGPTField
          v-model="searchQuery"
          label23270="Поиск"
          placeholder="Поиск по базе знаний"
          value="Поиск по базе знаний"
        />
      </div>

      <section class="kategorii-pomoshchi" aria-label="Категории базы знаний">
        <div
          v-for="cat in KNOWLEDGE_CATEGORIES"
          :key="cat.id"
          class="articles-category-card"
        >
          <h2 class="articles-category-title">{{ cat.title }}</h2>
          <p class="articles-category-subtitle">{{ cat.subtitle }}</p>
          <OctagonButton
            variant="ghost"
            label23251="Открыть"
            @click="openArticle(cat.defaultArticleSlug)"
          />
        </div>
      </section>

      <h2 class="vse-stat-i">Все статьи</h2>

      <NuxtLink
        v-for="article in (displayedArticles.length ? displayedArticles : KNOWLEDGE_ARTICLES)"
        :key="article.slug"
        :to="`/articles/${article.slug}`"
        class="article-list-card"
      >
        <p class="article-list-title">{{ article.title }}</p>
        <p class="article-list-meta">
          {{ article.category }} · {{ article.readingTime }}
        </p>
      </NuxtLink>
    </main>
  </div>
</template>

<style scoped src="~/assets/css/pages/articles/index.css"></style>
