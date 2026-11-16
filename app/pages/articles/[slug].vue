<script setup lang="ts">
import { findKnowledgeArticleBySlug } from '../../../shared/utils/publicContent'
import { usePublicSeo } from '~/composables/usePublicSeo'

definePageMeta({
  layout: 'public'
})

const route = useRoute()
const slugParam = computed(() => String(route.params.slug || ''))
const article = computed(() => findKnowledgeArticleBySlug(slugParam.value))

// корректный http 404 для несуществующих статей базы знаний
if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Статья не найдена',
    message: 'Возможно, статья удалена или её адрес изменился.',
    data: {
      entity: 'article'
    }
  })
}

usePublicSeo({
  title: `${article.value.title} — WorkFlow`,
  description: article.value.description,
  path: `/articles/${article.value.slug}`,
  type: 'article'
})

const feedbackChoice = ref<'yes' | 'no' | null>(null)
</script>

<template>
  <div v-if="article" class="layer-6-04-stat-ia">
    <WFGPTPublicNav />

    <main class="soderzhanie-stranitsy">
      <h1 class="kak-sozdat-pervuiu-zaiavku">{{ article.title }}</h1>
      <!-- фиксированная дата статьи для совпадения серверного и клиентского html без hydration mismatch -->
      <p class="nachalo-raboty-obnovleno-5-oktiabria">
        {{ article.updatedLabel }}
      </p>

      <article class="stat-ia">
        <template v-for="(sec, idx) in article.sections" :key="idx">
          <h2 class="article-section-heading">{{ sec.heading }}</h2>
          <p class="article-section-body">{{ sec.body }}</p>
        </template>

        <p class="byla-li-stat-ia-polezna">Была ли статья полезна?</p>
        <div class="otsenka-stat-i">
          <OctagonButton
            variant="secondary"
            :label23251="feedbackChoice === 'yes' ? 'Да ✓' : 'Да'"
            @click="feedbackChoice = 'yes'"
          />
          <OctagonButton
            variant="secondary"
            :label23251="feedbackChoice === 'no' ? 'Нет ✓' : 'Нет'"
            @click="feedbackChoice = 'no'"
          />
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped src="~/assets/css/pages/articles/slug.css"></style>
