<template>
  <nav class="navbar">
    <router-link to="/" @click="limpiarInicio" style="text-decoration: none">
      <h1 class="logo-nav">RELANT</h1>
    </router-link>

    <div class="search-container">
      <div class="dropdown">
        <button class="btn-cat" @click="showCats = !showCats">
          <span>{{ marketStore.selectedCategory }}</span> ▼
        </button>
        <div class="dropdown-content" :class="{ show: showCats }">
          <a @click="seleccionarCat('Todas')">Todas</a>
          <a v-for="cat in marketStore.availableCategories" :key="cat" @click="seleccionarCat(cat)">
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

    <div class="nav-actions">
      <div v-if="authStore.usuarioActual" class="user-menu">
        <span class="user-email">{{ authStore.usuarioActual.email?.split('@')[0] }}</span>
        <button class="btn-logout" @click="authStore.cerrarSesion">Salir</button>
      </div>
      <div v-else class="login-trigger" @click="uiStore.toggleAuthModal">Ingresar</div>

      <div
        @click="uiStore.toggleChat"
        class="ai-trigger"
        title="Asistente AI"
      >
        ✨ AI
      </div>

      <div class="cart-icon" @click="uiStore.toggleCart" aria-label="Abrir carrito" role="button">
        <!-- Inline SVG para el carrito, usa currentColor para respetar tema -->
        <svg class="img-carrito-svg" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14l.84-2h7.45c.75 0 1.41-.41 1.75-1.03l2.98-6.04L20.1 4H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.45C5.08 15.37 5.6 16 6.3 16h12.14v-2H7.16z"/>
        </svg>
        <span class="cart-badge" aria-live="polite">{{ cartStore.totalItems }}</span>
      </div>

      <div class="icon-hamburguesa" @click="uiStore.toggleMenu" aria-label="Abrir menú" role="button">
        <span></span><span></span><span></span>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useMarketStore } from '@/stores/market'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const cartStore = useCartStore()
const marketStore = useMarketStore()
const uiStore = useUiStore()
const authStore = useAuthStore()

const showCats = ref(false)
const emit = defineEmits(['buscar'])

const seleccionarCat = (cat: string) => {
  marketStore.selectedCategory = cat
  showCats.value = false
  emit('buscar')
}

const ejecutarBusqueda = () => {
  showCats.value = false
  emit('buscar')
}

// 3. Función que hace el "Borrón y cuenta nueva"
const limpiarInicio = () => {
  marketStore.searchQuery = ''
  marketStore.selectedCategory = 'Todas'
  emit('buscar')
}
</script>

<style scoped>
/* Ensure we have sensible fallbacks in case different variable names are used across the project */
:root {
  --comp-text: var(--text-main, var(--color-texto, #ffffff));
  --comp-bg-panel: var(--bg-panel, var(--fondo-tarjeta, #161b22));
  --comp-accent: var(--accent, var(--color-acento, #ff0000));
  --comp-border: var(--border, var(--borde, #30363d));
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 5%;
  background: var(--comp-bg-panel);
  border-bottom: 1px solid var(--comp-border);
  position: sticky;
  top: 0;
  z-index: 16000; /* keep below the menu-panel when it opens */
  color: var(--comp-text);
}
.logo-nav {
  font-size: 26px;
  font-weight: 900;
  color: var(--comp-accent);
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
  background: var(--bg-input, #0d1117);
  border: 1px solid var(--comp-border);
  border-radius: 25px;
  position: relative;
  align-items: center;
}
.dropdown { position: relative; }
.btn-cat {
  background: var(--comp-accent);
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
  color: var(--comp-text);
  padding: 12px 15px;
  outline: none;
  font-size: 14px;
  width: 100%;
  border-radius: 0 25px 25px 0;
}
.dropdown-content {
  display: none;
  position: absolute;
  background: var(--comp-bg-panel);
  min-width: 220px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
  z-index: 3000;
  border: 1px solid var(--comp-border);
  border-radius: 8px;
  top: 100%;
  left: 0;
  margin-top: 5px;
  max-height: 300px;
  overflow-y: auto;
}
.dropdown-content.show { display: block; }
.dropdown-content a {
  color: var(--comp-text);
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid var(--comp-border);
}
.dropdown-content a:hover { background: var(--comp-accent); color: white; }

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 16001; /* above navbar content but below menu-panel */
}
.cart-icon {
  position: relative;
  cursor: pointer;
  z-index: 16001;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.img-carrito-svg {
  color: var(--comp-text);
  width: 28px;
  height: 28px;
  display: inline-block;
  vertical-align: middle;
}
.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--comp-accent);
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
  width: 34px;
  height: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  margin-left: 15px;
  z-index: 16002; /* above other navbar controls */
  visibility: visible !important;
}
.icon-hamburguesa span {
  display: block;
  width: 100%;
  height: 3px;
  background: var(--comp-text);
  border-radius: 2px;
  transition: 0.3s;
}

.ai-trigger { cursor: pointer; font-size: 14px; font-weight: 900; color: var(--comp-text); }

.login-trigger { cursor: pointer; font-size: 14px; font-weight: bold; color: var(--comp-text); background: #30363d; padding: 6px 12px; border-radius: 20px; transition: 0.2s; }
.login-trigger:hover { background: var(--comp-accent); color: white; }
.user-menu { display: flex; align-items: center; gap: 10px; }
.user-email { font-size: 13px; color: #8b949e; font-weight: bold; }
.btn-logout { background: transparent; color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 11px; }
</style>
