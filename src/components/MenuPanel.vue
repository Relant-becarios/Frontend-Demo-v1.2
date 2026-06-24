<template>
  <div :class="['menu-panel', { open: uiStore.isMenuOpen }]">
    <div class="close-menu-btn" @click="uiStore.toggleMenu">✕</div>
    <h2 class="menu-title">MENÚ</h2>
    <div class="menu-link" @click="navegarA('/')">🏠 Inicio</div>
    <div class="menu-link" @click="navegarA('/stl')">🧊 Visor STL 3D</div>
    <div class="menu-link" @click="navegarA('/calculadora')">🧮 Calculadora de Dosificación</div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { useRouter } from 'vue-router'

const uiStore = useUiStore()
const router = useRouter()

const navegarA = (ruta: string) => {
  uiStore.closeAll() // Cierra el menú al cambiar de pantalla
  router.push(ruta)
}
</script>

<style scoped>
.menu-panel {
  position: fixed;
  top: 0;
  right: -320px;
  width: 300px;
  height: 100vh;
  background: #161b22;
  z-index: 10000;
  transition: 0.4s ease;
  border-left: 2px solid #ff0000;
  padding: 25px;
  box-sizing: border-box;
  color: #fff;
}
.menu-panel.open {
  right: 0;
}
.close-menu-btn {
  text-align: right;
  cursor: pointer;
  font-size: 28px;
  margin-bottom: 10px;
}
.menu-title {
  color: #ff0000;
  margin-bottom: 25px;
  letter-spacing: 2px;
  font-weight: bold;
}
.menu-link {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px 10px;
  color: #ffffff;
  text-decoration: none;
  font-size: 17px;
  font-weight: bold;
  border-bottom: 1px solid #30363d;
  cursor: pointer;
  transition: 0.3s;
}
.menu-link:hover {
  background: rgba(255, 0, 0, 0.1);
  color: #ff0000;
  padding-left: 20px;
}
</style>
