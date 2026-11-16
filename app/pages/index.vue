<script setup lang="ts">
import { usePublicSeo } from '~/composables/usePublicSeo'

definePageMeta({
  layout: 'public'
})

usePublicSeo({
  title: 'WorkFlow — система управления сервисными заявками',
  description:
    'От первого обращения до решения — управляйте заявками, назначайте исполнителей и держите сроки SLA под контролем в единой системе WorkFlow.',
  path: '/',
  type: 'website'
})

const router = useRouter()

const goToStart = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="layer-1-01-glavnaia">
    <WFGPTPublicNav />

    <section id="hero" class="pervyi-ekran">
      <div class="pervyi-ekran-tekst-i-grafika">
        <div class="tekst-i-deistvie">
          <p class="zaiavki-komanda-rezul-tat">ЗАЯВКИ · КОМАНДА · РЕЗУЛЬТАТ</p>
          <h1 class="podderzhka-v-kotoroi-nichego-ne">
            Поддержка, в которой<br />ничего не теряется
          </h1>
          <p class="ot-pervogo-obrashcheniia-do-resheniia">
            От первого обращения до решения — управляйте заявками, назначайте исполнителей и держите сроки под контролем.
          </p>
          <div class="hero-cta-wrap">
            <OctagonButton
              label23251="Начать работу"
              @click="goToStart"
            />
          </div>
        </div>
        <!-- оптимизированное изображение первого экрана с фиксированными размерами без сдвига макета cls -->
        <picture class="grafika-s-octagon-students-ru">
          <source media="(max-width: 639px)" srcset="/images/hero-360.png" />
          <source media="(max-width: 1023px)" srcset="/images/hero-768.png" />
          <img
            src="/images/hero-1280.png"
            alt="Иллюстрация рабочего процесса WorkFlow"
            width="460"
            height="460"
            fetchpriority="high"
            decoding="async"
            class="hero-responsive-img"
          />
        </picture>
      </div>

      <div id="workflow-steps" class="primer-rabochego-protsessa">
        <div class="layer-01-sozdaite-zaiavku">
          <p class="layer-01-sozdaite-zaiavku-2">01  Создайте заявку</p>
        </div>
        <div class="layer-02-naznach-te-ispolnitelia">
          <p class="layer-02-naznach-te-ispolnitelia-2">02  Назначьте исполнителя</p>
        </div>
        <div class="layer-03-podtverdite-reshenie">
          <p class="layer-03-podtverdite-reshenie-2">03  Подтвердите решение</p>
        </div>
      </div>
    </section>

    <section id="features" class="vozmozhnosti">
      <h2 class="odna-sistema-dlia-vsei-komandy">Одна система для всей команды</h2>
      <div class="preimushchestva">
        <div class="vse-obrashcheniia-riadom">
          <p class="vse-obrashcheniia-riadom-2">Все обращения рядом</p>
          <p class="statusy-prioritety-i-istoriia">Статусы, приоритеты и история общения.</p>
        </div>
        <div class="poniatnaia-otvetstvennost">
          <p class="poniatnaia-otvetstvennost-2">Понятная ответственность</p>
          <p class="u-kazhdoi-zaiavki-est-ispolnitel">У каждой заявки есть исполнитель.</p>
        </div>
        <div class="kontrol-srokov">
          <p class="kontrol-srokov-2">Контроль сроков</p>
          <p class="sroki-reaktsii-i-resheniia-vsegda-vidny">Сроки реакции и решения всегда видны.</p>
        </div>
      </div>
    </section>

    <footer id="footer" class="podval">
      <p class="workflow-c-2026">WorkFlow © 2026</p>
      <p class="pomoshch-faq">
        <NuxtLink to="/help" class="footer-inline-link">Помощь</NuxtLink>
        ·
        <NuxtLink to="/faq" class="footer-inline-link">FAQ</NuxtLink>
      </p>
    </footer>
  </div>
</template>

<style scoped src="~/assets/css/pages/index.css"></style>
