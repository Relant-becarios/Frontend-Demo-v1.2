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
  background: var(--bg-panel);
  z-index: 10000;
  transition: 0.4s ease;
  border-left: 2px solid var(--accent);
  padding: 25px;
  box-sizing: border-box;
  color: var(--text-main); /* usar variable para que cambie con el tema */
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
  color: var(--accent); /* usar variable de acento */
  margin-bottom: 25px;
  letter-spacing: 2px;
  font-weight: bold;
}
.menu-link {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px 10px;
  color: var(--text-main); /* usar variable para respetar tema */
  text-decoration: none;
  font-size: 17px;
  font-weight: bold;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: 0.3s;
}
.menu-link:hover {
  background: rgba(255, 0, 0, 0.1);
  color: var(--accent);
  padding-left: 20px;
}
</style>
