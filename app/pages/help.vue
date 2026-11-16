<script setup lang="ts">
import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_ARTICLES,
  filterKnowledgeArticles
} from '../../shared/utils/publicContent'
import { usePublicSeo } from '~/composables/usePublicSeo'

definePageMeta({
  layout: 'public'
})

usePublicSeo({
  title: 'Центр помощи — WorkFlow',
  description:
    'Центр помощи и база знаний WorkFlow: найдите инструкции по началу работы, управлению заявками и контролю сроков SLA или отправьте обращение.',
  path: '/help',
  type: 'website'
})

const router = useRouter()
const searchQuery = ref('')

const displayedArticles = computed(() => filterKnowledgeArticles(searchQuery.value))

const openArticle = (slug: string) => {
  router.push(`/articles/${slug}`)
}

const handleCreateRequestFromHelp = () => {
  router.push('/requests')
}
</script>

<template>
  <div class="layer-6-02-tsentr-pomoshchi">
    <WFGPTPublicNav />

    <main class="soderzhanie-stranitsy">
      <h1 class="tsentr-pomoshchi">Центр помощи</h1>
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

      <section class="kategorii-pomoshchi" aria-label="Категории помощи">
        <div
          v-for="cat in KNOWLEDGE_CATEGORIES"
          :key="cat.id"
          class="help-category-card"
        >
          <h2 class="help-category-title">{{ cat.title }}</h2>
          <p class="help-category-subtitle">{{ cat.subtitle }}</p>
          <OctagonButton
            variant="ghost"
            label23251="Открыть"
            @click="openArticle(cat.defaultArticleSlug)"
          />
        </div>
      </section>

      <h2 class="populiarnye-instruktsii">Популярные инструкции</h2>

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

      <div class="octagon-button-5">
        <OctagonButton
          label23251="Создать заявку"
          @click="handleCreateRequestFromHelp"
        />
      </div>
    </main>
  </div>
</template>

<style scoped src="~/assets/css/pages/help.css"></style>
