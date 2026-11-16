<script setup lang="ts">
import { FAQ_ITEMS, filterFaqItems } from '../../shared/utils/publicContent'
import { usePublicSeo } from '~/composables/usePublicSeo'

definePageMeta({
  layout: 'public'
})

usePublicSeo({
  title: 'Частые вопросы (FAQ) — WorkFlow',
  description:
    'Ответы на частые вопросы о работе с сервисными заявками в системе WorkFlow: как создать заявку, отслеживать статус, подтвердить решение и контролировать SLA.',
  path: '/faq',
  type: 'website'
})

const searchQuery = ref('')

// серверный рендеринг полного списка вопросов при первом запросе без скачков гидратации
const displayedFaqItems = computed(() => filterFaqItems(searchQuery.value))
</script>

<template>
  <div class="layer-6-01-faq">
    <WFGPTPublicNav />

    <main class="soderzhanie-stranitsy">
      <h1 class="chastye-voprosy">Частые вопросы</h1>
      <p class="otvety-o-rabote-s-servisnymi-zaiavkami">
        Ответы о работе с сервисными заявками
      </p>

      <div class="wf-gpt-field">
        <WFGPTField
          v-model="searchQuery"
          label23270="Поиск по вопросам"
          placeholder="Что вы хотите узнать?"
          value="Что вы хотите узнать?"
        />
      </div>

      <article
        v-for="item in (displayedFaqItems.length ? displayedFaqItems : FAQ_ITEMS)"
        :key="item.id"
        class="faq-card"
      >
        <h2 class="faq-card-question">{{ item.question }}</h2>
        <p class="faq-card-answer">{{ item.answer }}</p>
      </article>
    </main>
  </div>
</template>

<style scoped src="~/assets/css/pages/faq.css"></style>
