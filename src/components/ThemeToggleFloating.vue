<template>
  <div
    class="theme-floating-btn"
    @click="uiStore.toggleTema"
    :title="uiStore.temaActual === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
  >
    <span class="icon">{{ uiStore.temaActual === 'dark' ? '☀️' : '🌙' }}</span>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<style scoped>
.theme-floating-btn {
  position: fixed;
  bottom: 25px;
  right: 25px;
  width: 55px;
  height: 55px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 15000; /* Por encima de todo, incluso modales y paneles */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Animación suave y "bounce" */
  user-select: none;
}

/* Efectos al pasar el cursor */
.theme-floating-btn:hover {
  transform: scale(1.1) translateY(-5px);
  background: var(--bg-input);
  box-shadow: 0 15px 35px rgba(255, 0, 0, 0.3); /* Brillo rojo industrial */
  border-color: var(--accent);
}

.icon {
  font-size: 24px;
}
</style>
