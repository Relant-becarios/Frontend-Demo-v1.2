<template>
  <div class="welcome-container">
    <header class="welcome-header">
      <h1>Bienvenido a RELANT Marketplace</h1>
      <p>Selecciona una de nuestras herramientas o explora el catálogo para comenzar.</p>
    </header>

    <section class="modules-section">
      <h2 class="section-title">Herramientas Personalizadas</h2>

      <div class="cards-grid">
        <div class="module-card" @click="goTo('/catalogo')">
          <div class="icon">📚</div>
          <h3>Catálogo</h3>
          <p>Explora todos nuestros productos.</p>
        </div>

        <div
          class="module-card"
          :class="{ 'locked-card': !authStore.usuarioActual }"
          @click="authStore.usuarioActual ? goTo('/maquina') : pedirMembresia()"
        >
          <div class="icon" style="position: relative">
            🎰
            <span v-if="!authStore.usuarioActual" class="lock-badge">🔒</span>
          </div>
          <h3>Máquina Expendedora</h3>
          <p v-if="authStore.usuarioActual">Gestión y surtido automatizado.</p>
          <p v-else class="locked-text">Requiere membresía para acceder.</p>
        </div>

        <div class="module-card" @click="goTo('/concepto')">
          <div class="diagram-container">
            <div class="node top">NÚCLEO</div>
            <div class="lines-horizontal">
              <div class="node side">MOD 1</div>
              <div class="center-hub"></div>
              <div class="node side">MOD 2</div>
            </div>
            <div class="node bottom">BASE</div>
          </div>
          <h3>Concepto</h3>
          <p>Arma tu producto a medida.</p>
        </div>

        <div class="module-card" @click="goTo('/ia-foto')">
          <div class="icon">🤖📸</div>
          <h3>I.A. Foto</h3>
          <p>Análisis visual inteligente.</p>
        </div>
      </div>
    </section>

    <section class="news-section">
      <h2 class="section-title">Noticias y Actualizaciones</h2>

      <div class="news-feed">
        <article class="news-item">
          <h4>🔥 Nuevas válvulas en stock</h4>
          <p>
            Hemos actualizado el inventario con las últimas series AXDV para dispensado de
            precisión.
          </p>
        </article>
        <article class="news-item">
          <h4>🚀 Actualización del sistema I.A.</h4>
          <p>
            El reconocimiento visual en "I.A. Foto" ahora detecta componentes con un 30% más de
            precisión. Pruébalo hoy mismo.
          </p>
        </article>
        <article class="news-item">
          <h4>⚙️ Integración de nuevas máquinas</h4>
          <p>
            Los suscriptores ya pueden vincular hasta 5 máquinas expendedoras simultáneas desde su
            panel de control.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const goTo = (ruta: string) => {
  router.push(ruta)
}

const pedirMembresia = () => {
  uiStore.toggleAuthModal()
}
</script>

<style scoped>
/* Contenedor principal */
.welcome-container {
  padding: 40px 5%;
  max-width: 1200px;
  margin: 0 auto;
  color: var(--color-texto);
}

.welcome-header {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: var(--color-texto);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 25px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--borde);
  color: var(--color-texto);
}

/* Grid de los 4 módulos */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
}

.module-card {
  background: var(--fondo-tarjeta);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(255, 0, 0, 0.15);
  border-color: var(--color-acento);
}

.icon {
  font-size: 3.5rem;
  margin-bottom: 15px;
}

.module-card h3 {
  margin: 10px 0;
  font-size: 1.2rem;
  color: var(--color-texto);
}

.module-card p {
  font-size: 0.9rem;
  color: #8b949e;
  margin: 0;
}

/* ── Estilos de la tarjeta bloqueada ── */
.locked-card {
  opacity: 0.8;
  background: rgba(0, 0, 0, 0.05); /* Ligeramente más oscuro o claro según tu fondo */
}
.locked-card:hover {
  border-color: #8b949e; /* No se pone roja al pasar el mouse para indicar que está inactiva */
  box-shadow: none;
  transform: translateY(0);
}
.locked-text {
  color: #ff4444 !important;
  font-weight: bold;
}
.lock-badge {
  position: absolute;
  bottom: 0;
  right: -10px;
  font-size: 1.5rem;
  background: var(--fondo-principal);
  border-radius: 50%;
  padding: 2px;
}

/* ── Magia CSS: Mini Diagrama para Concepto (Ensamblaje PC) ── */
.diagram-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
}

.node {
  background: var(--fondo-principal);
  color: var(--color-texto);
  font-size: 0.7rem;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--color-acento);
  z-index: 2;
}

.lines-horizontal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 10px 0;
  position: relative;
}

.center-hub {
  width: 16px;
  height: 16px;
  background: var(--color-acento);
  border-radius: 50%;
  margin: 0 15px;
  position: relative;
}

.center-hub::before,
.center-hub::after {
  content: '';
  position: absolute;
  background: var(--color-acento);
  z-index: 1;
}

.center-hub::before {
  width: 2px;
  height: 60px;
  top: -22px;
  left: 7px;
}

.center-hub::after {
  width: 80px;
  height: 2px;
  top: 7px;
  left: -32px;
}

/* ── Sección Noticias ── */
.news-section {
  background: var(--fondo-tarjeta);
  border: 1px solid var(--borde);
  border-radius: 12px;
  padding: 30px;
  min-height: 250px;
}

.news-feed {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.news-item {
  padding: 20px;
  border-left: 4px solid var(--color-acento);
  background: var(--fondo-principal);
  border-radius: 0 8px 8px 0;
  transition: transform 0.2s;
}

.news-item:hover {
  transform: translateX(5px);
}

.news-item h4 {
  margin: 0 0 8px 0;
  color: var(--color-texto);
  font-size: 1.1rem;
}

.news-item p {
  margin: 0;
  font-size: 0.95rem;
  color: #8b949e;
}
</style>
