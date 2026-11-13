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

<style scoped>
.layer-1-01-glavnaia {
  position: relative;
  width: 100%;
  max-width: 1280px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 0px;
  padding: 0px;
  justify-content: flex-start;
  align-items: flex-start;
  background: radial-gradient(38.28% 49.47% at 54.55% 50%, #201D47 0%, #17153A 100%);
}

.shapka {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 32px 64px;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.workflow {
  flex: 1 1 0;
  color: var(--color-text-inverse, #FFFFFF);
  font-family: "Montserrat", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.glavnaia,
.stat-i,
.pomoshch,
.faq {
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Nunito Sans", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.pervyi-ekran {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 64px;
  justify-content: flex-start;
  align-items: flex-start;
  background: var(--color-bg-sidebar, #17153A);
}

.pervyi-ekran-tekst-i-grafika {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 0px;
  justify-content: space-between;
  align-items: center;
}

.tekst-i-deistvie {
  width: 600px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0px;
  justify-content: flex-start;
  align-items: flex-start;
}

.zaiavki-komanda-rezul-tat {
  align-self: stretch;
  color: var(--color-text-sidebar, #C8C3DE);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}

.podderzhka-v-kotoroi-nichego-ne {
  align-self: stretch;
  color: var(--color-text-inverse, #FFFFFF);
  font-family: "Montserrat", sans-serif;
  font-size: 52px;
  font-weight: 700;
  line-height: 120%;
}

.ot-pervogo-obrashcheniia-do-resheniia {
  align-self: stretch;
  color: var(--color-text-sidebar, #C8C3DE);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.grafika-s-octagon-students-ru {
  width: 460px;
  height: 460px;
  flex-shrink: 0;
  background: url("/images/hero-1280.png") center / cover no-repeat;
}

.primer-rabochego-protsessa {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 0px;
  justify-content: flex-start;
  align-items: flex-start;
}

.layer-01-sozdaite-zaiavku,
.layer-02-naznach-te-ispolnitelia,
.layer-03-podtverdite-reshenie {
  width: calc((100% - 32px) / 3);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
}

.layer-01-sozdaite-zaiavku-2,
.layer-02-naznach-te-ispolnitelia-2,
.layer-03-podtverdite-reshenie-2 {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  white-space: pre-wrap;
}

.vozmozhnosti {
  align-self: stretch;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 64px;
  justify-content: flex-start;
  align-items: flex-start;
}

.odna-sistema-dlia-vsei-komandy {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
}

.preimushchestva {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 0px;
  justify-content: flex-start;
  align-items: stretch;
}

.vse-obrashcheniia-riadom,
.poniatnaia-otvetstvennost,
.kontrol-srokov {
  width: calc((100% - 32px) / 3);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 4px;
  background: var(--color-bg-surface, #23204D);
  border: 1px solid var(--color-border-default, #413E74);
}

.vse-obrashcheniia-riadom-2,
.poniatnaia-otvetstvennost-2,
.kontrol-srokov-2 {
  align-self: stretch;
  color: var(--color-text-primary, #E8E7EC);
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.statusy-prioritety-i-istoriia,
.u-kazhdoi-zaiavki-est-ispolnitel,
.sroki-reaktsii-i-resheniia-vsegda-vidny {
  align-self: stretch;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.podval {
  align-self: stretch;
  width: 100%;
  margin-top: auto;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  background: #1B1A2E;
}

.workflow-c-2026 {
  width: 880px;
  max-width: 100%;
  color: var(--color-text-secondary, #B9B3D4);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

.pomoshch-faq {
  color: var(--color-text-accent, #79CEE8);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

@media (max-width: 1023px) {
  .layer-1-01-glavnaia {
    max-width: 768px;
    background: radial-gradient(94.18% 20.11% at 54.55% 50%, #201D47 0%, #17153A 100%);
  }

  .shapka {
    padding: 32px;
  }

  .pervyi-ekran {
    padding: 64px 32px;
  }

  .pervyi-ekran-tekst-i-grafika {
    flex-direction: column;
    align-items: flex-start;
  }

  .tekst-i-deistvie {
    width: 100%;
  }

  .podderzhka-v-kotoroi-nichego-ne {
    font-size: 40px;
  }

  .grafika-s-octagon-students-ru {
    width: 460px;
    height: 460px;
    background-image: url("/images/hero-768.png");
  }

  .primer-rabochego-protsessa {
    flex-wrap: wrap;
  }

  .layer-01-sozdaite-zaiavku,
  .layer-02-naznach-te-ispolnitelia,
  .layer-03-podtverdite-reshenie {
    width: calc((100% - 16px) / 2);
  }

  .vozmozhnosti {
    padding: 64px 32px;
  }

  .preimushchestva {
    flex-wrap: wrap;
  }

  .vse-obrashcheniia-riadom,
  .poniatnaia-otvetstvennost,
  .kontrol-srokov {
    width: calc((100% - 16px) / 2);
  }

  .podval {
    flex-direction: column;
  }

  .workflow-c-2026,
  .pomoshch-faq {
    width: 100%;
  }
}

@media (max-width: 639px) {
  .layer-1-01-glavnaia {
    max-width: 360px;
  }

  .shapka {
    padding: 24px 16px;
    gap: 12px;
  }

  .glavnaia,
  .stat-i,
  .pomoshch,
  .faq {
    display: none;
  }

  .pervyi-ekran {
    padding: 40px 16px;
  }

  .podderzhka-v-kotoroi-nichego-ne {
    font-size: 32px;
  }

  .hero-cta-wrap,
  .hero-cta-wrap :deep(.octagon-btn) {
    width: 100%;
  }

  .grafika-s-octagon-students-ru {
    width: 328px;
    height: 328px;
    max-width: 100%;
    background-image: url("/images/hero-360.png");
  }

  .layer-01-sozdaite-zaiavku,
  .layer-02-naznach-te-ispolnitelia,
  .layer-03-podtverdite-reshenie {
    width: 100%;
  }

  .vozmozhnosti {
    padding: 40px 16px;
  }

  .odna-sistema-dlia-vsei-komandy {
    font-size: 24px;
    line-height: 31px;
  }

  .vse-obrashcheniia-riadom,
  .poniatnaia-otvetstvennost,
  .kontrol-srokov {
    width: 100%;
  }

  .podval {
    padding: 24px 16px;
  }
}
</style>
