<template>
  <nav class="navbar">
    <div class="logo-nav">RELANT</div>

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
        style="cursor: pointer; font-size: 14px; font-weight: 900; color: white"
        title="Asistente AI"
      >
        ✨ AI
      </div>

      <div class="cart-icon" @click="uiStore.toggleCart">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
          width="28"
          style="filter: invert(1)"
        />
        <span class="cart-badge">{{ cartStore.totalItems }}</span>
      </div>

      <div class="icon-hamburguesa" @click="uiStore.toggleMenu">
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
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 5%;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  position: sticky;
  top: 0;
  z-index: 2000;
}
.logo-nav {
  font-size: 26px;
  font-weight: 900;
  color: #ff0000;
  cursor: pointer;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.search-container {
  display: flex;
  flex-grow: 1;
  max-width: 550px;
  margin: 0 20px;
  background: #0d1117;
  border: 1px solid #30363d;
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
  color: #ffffff;
  padding: 12px 15px;
  outline: none;
  font-size: 14px;
  width: 100%;
  border-radius: 0 25px 25px 0;
}
.dropdown-content {
  display: none;
  position: absolute;
  background: #161b22;
  min-width: 220px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
  z-index: 3000;
  border: 1px solid #30363d;
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
  color: #fff;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid #30363d;
}
.dropdown-content a:hover {
  background: #ff0000;
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}
.cart-icon {
  position: relative;
  cursor: pointer;
}
.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: red;
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
  width: 30px;
  height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  margin-left: 15px;
}
.icon-hamburguesa span {
  display: block;
  width: 100%;
  height: 3px;
  background: #ffffff;
  border-radius: 2px;
  transition: 0.3s;
}

/* Estilos Autenticación */
.login-trigger {
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: white;
  background: #30363d;
  padding: 6px 12px;
  border-radius: 20px;
  transition: 0.2s;
}
.login-trigger:hover {
  background: #ff0000;
}
.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-email {
  font-size: 13px;
  color: #8b949e;
  font-weight: bold;
}
.btn-logout {
  background: transparent;
  color: #ff4444;
  border: 1px solid #ff4444;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 11px;
}
</style>
