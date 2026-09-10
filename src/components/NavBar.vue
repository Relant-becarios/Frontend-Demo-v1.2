<template>
  <nav class="navbar">
    <router-link to="/" @click="limpiarInicio" style="text-decoration: none">
      <h1 class="logo-nav">RELANT</h1>
    </router-link>

    <!-- Barra de búsqueda: SOLO SE MUESTRA EN EL CATÁLOGO -->
    <div class="search-container" v-if="mostrarFunciones">
      <div class="dropdown">
        <button class="btn-cat" @click.stop="showCats = !showCats">
          <span>{{ marketStore.selectedCategory }}</span> ▼
        </button>
        <div class="dropdown-content" :class="{ show: showCats }">
          <a @click.stop="seleccionarCat('Todas')">Todas</a>
          <a
            v-for="cat in marketStore.availableCategories"
            :key="cat"
            @click.stop="seleccionarCat(cat)"
          >
            {{ cat }}
          </a>
        </div>
      </div>

      <input
        type="text"
        class="search-input"
        placeholder="Escribe y presiona Enter para buscar..."
        v-model="marketStore.searchQuery"
        @keyup.enter="ejecutarBusqueda"
      />
    </div>

    <!-- Espaciador invisible cuando no hay barra de búsqueda -->
    <div v-else style="flex-grow: 1"></div>

    <div class="nav-actions">
      <!-- Usuario autenticado / Botón de ingreso -->
      <span v-if="authStore.usuarioActual" class="user-email">
        {{ authStore.usuarioActual.email?.split('@')[0] }}
      </span>
      <div v-else class="login-trigger" @click.stop="uiStore.toggleAuthModal">Ingresar</div>

      <!-- ACCIONES EXCLUSIVAS DEL CATÁLOGO -->
      <div class="catalog-only-actions" v-if="mostrarFunciones">
        <!-- Botón AI -->
        <div class="btn-ai" @click.stop="uiStore.toggleChat" title="Asistente AI">✨ AI</div>

        <!-- Botón Carrito -->
        <div class="cart-icon" @click.stop="uiStore.toggleCart" title="Carrito de Compras">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span class="cart-badge">{{ cartStore.totalItems }}</span>
        </div>

        <!-- Menú Hamburguesa -->
        <div class="icon-hamburguesa" @click.stop="uiStore.toggleMenu" title="Menú">
          <span></span><span></span><span></span>
        </div>
      </div>

      <!-- BOTÓN DE APAGADO (UBICADO AL EXTREMO DERECHO) -->
      <button
        v-if="authStore.usuarioActual"
        class="btn-logout"
        @click.stop="authStore.cerrarSesion"
        title="Cerrar sesión"
      >
        <svg
          class="power-icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          stroke="currentColor"
          stroke-width="2.5"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
          <line x1="12" y1="2" x2="12" y2="12"></line>
        </svg>
        <span class="logout-text">Salir</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useMarketStore } from '@/stores/market'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const cartStore = useCartStore()
const marketStore = useMarketStore()
const uiStore = useUiStore()
const authStore = useAuthStore()

const showCats = ref(false)
const emit = defineEmits(['buscar'])

const mostrarFunciones = computed(() => route.path === '/catalogo')

const seleccionarCat = (cat: string) => {
  marketStore.selectedCategory = cat
  showCats.value = false
  emit('buscar')
}

const ejecutarBusqueda = () => {
  showCats.value = false
  emit('buscar')
}

const limpiarInicio = () => {
  marketStore.searchQuery = ''
  marketStore.selectedCategory = 'Todas'
  emit('buscar')
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 5%;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  color: var(--text-main);
}
.logo-nav {
  font-size: 26px;
  font-weight: 900;
  color: #ff0000;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
}
.search-container {
  display: flex;
  flex-grow: 1;
  max-width: 550px;
  margin: 0 20px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 25px;
  position: relative;
  align-items: center;
}
.dropdown {
  position: relative;
}
.btn-cat {
  background: #ff0000;
  color: white;
  border: none;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  font-size: 13px;
  border-radius: 25px 0 0 25px;
  min-width: 120px;
  outline: none;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.search-input {
  flex-grow: 1;
  border: none;
  background: transparent;
  color: var(--text-main);
  padding: 12px 15px;
  outline: none;
  font-size: 14px;
  width: 100%;
  border-radius: 0 25px 25px 0;
}
.dropdown-content {
  display: none;
  position: absolute;
  background: var(--bg-panel);
  min-width: 220px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 20000;
  border: 1px solid var(--border);
  border-radius: 8px;
  top: 100%;
  left: 0;
  margin-top: 5px;
  max-height: 300px;
  overflow-y: auto;
}
.dropdown-content.show {
  display: block;
}
.dropdown-content a {
  color: var(--text-main);
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid var(--border);
}
.dropdown-content a:hover {
  background: #ff0000;
  color: white;
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}
.catalog-only-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  color: var(--text-main);
}
.btn-ai {
  cursor: pointer;
  font-size: 14px;
  font-weight: 900;
  color: var(--text-main);
  transition: opacity 0.2s;
}
.btn-ai:hover {
  opacity: 0.8;
}
.cart-icon {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--text-main);
}
.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff0000;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.icon-hamburguesa {
  width: 26px;
  height: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  color: var(--text-main);
}
.icon-hamburguesa span {
  display: block;
  width: 100%;
  height: 3px;
  background-color: currentColor;
  border-radius: 2px;
  transition: 0.3s;
}
.login-trigger {
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: var(--text-main);
  background: var(--bg-input);
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: 20px;
  transition: all 0.2s ease;
}
.login-trigger:hover {
  background: #ff0000;
  color: white;
  border-color: #ff0000;
}
.user-email {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: bold;
}

/* BOTÓN DE SALIR (EXTREMO DERECHO) */
.btn-logout {
  background: transparent;
  border: none;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 2px;
  gap: 2px;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.btn-logout:hover {
  transform: scale(1.1);
  opacity: 0.85;
}
.power-icon {
  stroke: #ff0000;
}
.logout-text {
  color: #ff0000;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
}
</style>
