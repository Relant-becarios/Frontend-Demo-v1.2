<template>
  <div class="refacciones-view">
    <div class="header-refacciones">
      <button class="btn-back" @click="$router.push('/')">← Volver al Catálogo</button>
      <h2 style="margin: 0; color: var(--accent)">Kits y Refacciones del Equipo</h2>
      <p style="color: var(--text-muted); margin-top: 5px">ID Equipo: {{ $route.params.id }}</p>
    </div>

    <div class="layout-refacciones">
      <div class="panel-explosionado">
        <h3 class="panel-title">Vista Explosionada</h3>
        <div class="img-placeholder">
          <span style="font-size: 40px; margin-bottom: 10px">⚙️</span>
          <span>ESPACIO PARA DIAGRAMA<br />EXPLOSIONADO .PNG / .JPG</span>
        </div>
      </div>

      <div class="panel-kits">
        <h3 class="panel-title">Listado de Kits</h3>

        <div class="accordion" v-for="(kit, index) in dummyKits" :key="kit.id">
          <div class="accordion-header" @click="toggleKit(index)">
            <span style="font-weight: bold">{{ kit.nombre }}</span>
            <span>{{ activeKit === index ? '▲' : '▼' }}</span>
          </div>

          <div class="accordion-body" :class="{ open: activeKit === index }">
            <table class="refacciones-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Refacción</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pieza in kit.piezas" :key="pieza.nombre">
                  <td style="text-align: center">
                    <div class="pieza-img-placeholder">IMG</div>
                  </td>
                  <td>{{ pieza.nombre }}</td>
                  <td style="text-align: center">
                    <button class="btn-add-small" @click="añadirPieza(pieza.nombre)">
                      + Agregar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const activeKit = ref<number | null>(null)

const toggleKit = (index: number) => {
  activeKit.value = activeKit.value === index ? null : index
}

const añadirPieza = (nombre: string) => {
  cartStore.agregarProducto(nombre)
  alert(`${nombre} añadido al carrito`)
}

// Datos de relleno dejados listos para conectar después
const dummyKits = ref([
  {
    id: 1,
    nombre: 'KIT DE SELLOS COMPLETOS',
    piezas: [
      { nombre: 'O-Ring Primario', img: '' },
      { nombre: 'Junta Tórica de Teflón', img: '' },
      { nombre: 'Empaque de Tapa', img: '' },
    ],
  },
  {
    id: 2,
    nombre: 'KIT DE MANTENIMIENTO PREVENTIVO',
    piezas: [
      { nombre: 'Resorte de Compresión', img: '' },
      { nombre: 'Vástago Central', img: '' },
      { nombre: 'Lubricante Grado Alimenticio', img: '' },
    ],
  },
])
</script>

<style scoped>
.refacciones-view {
  padding: 30px 5%;
  min-height: calc(100vh - 60px);
  background: var(--bg-main);
  color: var(--text-main);
}
.header-refacciones {
  margin-bottom: 30px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 20px;
}
.btn-back {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 15px;
  transition: 0.2s;
}
.btn-back:hover {
  background: var(--bg-input);
  color: var(--text-main);
}

.layout-refacciones {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}
.panel-explosionado {
  flex: 1;
  min-width: 300px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.panel-kits {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.panel-title {
  margin-top: 0;
  color: var(--text-main);
  border-bottom: 2px solid var(--accent);
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.img-placeholder {
  flex: 1;
  min-height: 400px;
  background: var(--bg-input);
  border: 2px dashed var(--border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
  font-weight: bold;
}

/* Acordeones */
.accordion {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-panel);
}
.accordion-header {
  padding: 15px 20px;
  background: var(--bg-input);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  transition: 0.2s;
  user-select: none;
}
.accordion-header:hover {
  background: var(--border);
}
.accordion-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  background: var(--bg-panel);
}
.accordion-body.open {
  max-height: 500px;
  overflow-y: auto;
}

/* Tablas dentro de los Kits */
.refacciones-table {
  width: 100%;
  border-collapse: collapse;
}
.refacciones-table th {
  background: var(--bg-input);
  padding: 10px;
  text-align: left;
  font-size: 13px;
  color: var(--text-muted);
}
.refacciones-table td {
  padding: 10px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  vertical-align: middle;
}
.pieza-img-placeholder {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 10px;
  font-weight: bold;
}
.btn-add-small {
  background: var(--accent);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}
.btn-add-small:hover {
  background: var(--accent-hover);
}
</style>
