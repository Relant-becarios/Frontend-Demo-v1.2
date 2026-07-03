<template>
  <div id="app-layout">
    <div
      v-if="
        uiStore.isCartOpen || uiStore.isMenuOpen || uiStore.isAuthModalOpen || uiStore.isChatOpen
      "
      class="overlay"
      @click="uiStore.closeAll"
    ></div>

    <MenuPanel />
    <CartPanel />
    <AuthModal />
    <ChatPanel />

    <ThemeToggleFloating />

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import CartPanel from '@/components/CartPanel.vue'
import MenuPanel from '@/components/MenuPanel.vue'
import AuthModal from '@/components/AuthModal.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import ThemeToggleFloating from '@/components/ThemeToggleFloating.vue' // Importamos

const uiStore = useUiStore()
</script>

<style>
/* --- VARIABLES GLOBALES DE CSS --- */

/* MODO OSCURO (Por defecto) */
:root {
  --bg-main: #0f1215;
  --bg-panel: #161b22;
  --bg-input: #0d1117;
  --text-main: #ffffff;
  --text-muted: #8b949e;
  --border: #30363d;
  --accent: #ff0000;
}

/* MODO CLARO */
[data-theme='light'] {
  --bg-main: #f4f6f8;
  --bg-panel: #ffffff;
  --bg-input: #e9ecef;
  --text-main: #1c1e21;
  --text-muted: #6a737d;
  --border: #d1d5da;
  --accent: #d32f2f;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Arial, sans-serif;
  background: var(--bg-main);
  color: var(--text-main);
  overflow-x: hidden;
  /* Transición suave para todos los colores */
  transition:
    background 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 20000; /* keep below the menu-panel */
}
</style>
