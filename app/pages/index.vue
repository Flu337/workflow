<script setup lang="ts">
definePageMeta({
  layout: 'public'
})

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const goToStart = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="layer-1-01-glavnaia">
    <header class="shapka">
      <NuxtLink to="/" class="workflow">WorkFlow</NuxtLink>
      <a href="#hero" class="glavnaia ui-nav-link">Главная</a>
      <a href="#workflow-steps" class="stat-i ui-nav-link">Статьи</a>
      <a href="#features" class="pomoshch ui-nav-link">Помощь</a>
      <a href="#footer" class="faq ui-nav-link">FAQ</a>
      <OctagonButton
        variant="secondary"
        label23251="Войти"
        @click="goToLogin"
      />
    </header>

    <section id="hero" class="pervyi-ekran">
      <div class="pervyi-ekran-tekst-i-grafika">
        <div class="tekst-i-deistvie">
          <p class="zaiavki-komanda-rezul-tat">ЗАЯВКИ · КОМАНДА · РЕЗУЛЬТАТ</p>
          <p class="podderzhka-v-kotoroi-nichego-ne">
            Поддержка, в которой<br />ничего не теряется
          </p>
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
        <div
          class="grafika-s-octagon-students-ru"
          role="img"
          aria-label="Иллюстрация рабочего процесса WorkFlow"
        ></div>
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
      <p class="odna-sistema-dlia-vsei-komandy">Одна система для всей команды</p>
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
      <p class="pomoshch-faq">Помощь · FAQ</p>
    </footer>
  </div>
</template>

<style scoped src="~/assets/css/pages/index.css"></style>
