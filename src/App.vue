<template>
  <div id="app-layout">
    <div
      v-if="uiStore.isCartOpen || uiStore.isMenuOpen"
      class="overlay"
      @click="uiStore.closeAll"
    ></div>

    <MenuPanel />

    <CartPanel />

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import CartPanel from '@/components/CartPanel.vue'
import MenuPanel from '@/components/MenuPanel.vue' // Importamos el Menú

const uiStore = useUiStore()
</script>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #0f1215;
  color: #ffffff;
  overflow-x: hidden;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 7500;
}
</style>
