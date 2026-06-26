<template>
  <div class="refacciones-view">
    <div class="ref-header">
      <button class="btn-back" @click="$router.push('/')">← Volver al Catálogo</button>
      <h2 v-if="producto" style="margin: 0; color: var(--accent); text-transform: uppercase">
        Kits y Refacciones: {{ producto.Producto }}
      </h2>
      <p style="color: var(--text-muted); margin-top: 5px">
        Código de Equipo: <strong>{{ $route.params.id }}</strong>
      </p>
    </div>

    <div v-if="cargando" class="loading-state">
      <div class="spinner"></div>
      <p>Consultando planos técnicos en la base de datos...</p>
    </div>

    <div v-else class="ref-layout">
      <div class="panel-explosionado">
        <h3 class="panel-title">Diagrama Explosionado</h3>

        <div class="img-wrapper">
          <img
            v-if="
              producto &&
              (producto.Imagen_Explosionada_URL || (producto as any).imagen_explosionada)
            "
            :src="producto.Imagen_Explosionada_URL || (producto as any).imagen_explosionada"
            class="explosion-img"
          />
          <div v-else class="no-img-db">
            ⚠️ Este equipo no tiene un diagrama asignado en la Base de Datos.
          </div>

          <svg viewBox="0 0 1000 700" class="svg-overlay">
            <rect
              x="300"
              y="200"
              width="120"
              height="120"
              fill="transparent"
              class="ref-area"
              @mouseover="highlightedRefId = 'REF_01'"
              @mouseout="highlightedRefId = null"
            />
          </svg>
        </div>
      </div>

      <div class="panel-kits">
        <h3 class="panel-title">Kits de Repuestos</h3>

        <div class="accordion" v-for="(kit, index) in listaKits" :key="kit.id || index">
          <div class="accordion-header" @click="toggleKit(index)">
            <span style="font-weight: bold">{{ kit.nombre_kit || kit.nombre }}</span>
            <span>{{ activeKit === index ? '▲' : '▼' }}</span>
          </div>

          <div class="accordion-body" :class="{ open: activeKit === index }">
            <table class="refacciones-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Refacción</th>
                  <th>SKU / Parte</th>
                  <th>Disponibilidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="pieza in kit.refacciones || kit.piezas"
                  :key="pieza.sku"
                  :class="{ 'high-row': highlightedRefId === pieza.id_refaccion }"
                >
                  <td style="text-align: center">
                    <img
                      :src="pieza.imagen_url || pieza.img || placeholderRef"
                      width="45"
                      height="45"
                      class="pieza-thumb"
                    />
                  </td>
                  <td class="font-bold-light">{{ pieza.nombre_refaccion || pieza.nombre }}</td>
                  <td class="sku-text">{{ pieza.sku }}</td>
                  <td>
                    <span :class="(pieza.stock || 0) > 0 ? 'stock-ok' : 'stock-low'">
                      {{ (pieza.stock || 0) > 0 ? '✅ En Stock' : '⏳ Sobre Pedido' }}
                    </span>
                  </td>
                  <td style="text-align: center">
                    <button class="btn-add-small" @click="añadirPiezaAlCarrito(pieza)">
                      + Añadir al Carrito
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="listaKits.length === 0" class="no-kits-msg">
          No hay kits de refacciones vinculados a este equipo en la base de datos.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { fetchProductos, type Producto } from '@/api/inventory'

// 1. CREAMOS LAS INTERFACES PARA EVITAR EL ERROR "Unexpected any"
interface Pieza {
  id_refaccion?: string
  nombre_refaccion?: string
  nombre?: string
  sku: string
  stock?: number
  imagen_url?: string
  img?: string
}

interface Kit {
  id?: string | number
  nombre_kit?: string
  nombre?: string
  refacciones?: Pieza[]
  piezas?: Pieza[]
}

interface ProductoConKits extends Producto {
  Kits?: Kit[]
  kits?: Kit[]
}

const route = useRoute()
const cartStore = useCartStore()

// 2. ESTADO LOCAL (Resuelve los errores del Store y Tipos)
const highlightedRefId = ref<string | null>(null)
const producto = ref<Producto | null>(null)
const listaKits = ref<Kit[]>([])
const cargando = ref(true)
const activeKit = ref<number | null>(null)

const placeholderRef = 'https://via.placeholder.com/150/ffffff/000000?text=PART'

const toggleKit = (index: number) => {
  activeKit.value = activeKit.value === index ? null : index
}

onMounted(async () => {
  cargando.value = true
  try {
    const idEquipo = route.params.id as string
    const todosLosProductos = await fetchProductos()

    const encontrado = todosLosProductos.find((p) => String(p.id || p.ID) === idEquipo)

    if (encontrado) {
      producto.value = encontrado

      // Mapeo con tipos estrictos para TypeScript
      const fallbackKits: Kit[] = [
        {
          nombre: 'KIT DE SELLOS INDUSTRIALES (EMPAQUES)',
          piezas: [
            {
              id_refaccion: 'REF_01',
              nombre: 'O-Ring del Vástago Principal',
              sku: 'OR-700-V',
              stock: 15,
              img: '',
            },
            {
              id_refaccion: 'REF_02',
              nombre: 'Empaque de Teflón Reforzado',
              sku: 'TP-512-T',
              stock: 8,
              img: '',
            },
          ],
        },
        {
          nombre: 'KIT DE MANTENIMIENTO INTERNO',
          piezas: [
            {
              id_refaccion: 'REF_03',
              nombre: 'Resorte de Retorno de Acero Inox',
              sku: 'SP-99-I',
              stock: 0,
              img: '',
            },
            {
              id_refaccion: 'REF_04',
              nombre: 'Pistón de Dosificación Céntrico',
              sku: 'PIS-22-C',
              stock: 3,
              img: '',
            },
          ],
        },
      ]

      // Verificamos si el producto ya trae los kits, si no, usamos el fallback
      listaKits.value =
        (encontrado as ProductoConKits).Kits || (encontrado as ProductoConKits).kits || fallbackKits
    }
  } catch (error) {
    console.error('Error leyendo la base de datos:', error)
  } finally {
    cargando.value = false
  }
})

const añadirPiezaAlCarrito = (pieza: Pieza) => {
  cartStore.agregarProducto(pieza.sku)
  alert(`${pieza.nombre_refaccion || pieza.nombre} agregado al carrito de cotización.`)
}
</script>

<style scoped>
.refacciones-view {
  padding: 30px 5%;
  min-height: calc(100vh - 60px);
  background: var(--bg-main);
  color: var(--text-main);
}
.ref-header {
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
  border-color: var(--accent);
}

.ref-layout {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}
.panel-explosionado {
  flex: 1;
  min-width: 350px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.panel-kits {
  flex: 1;
  min-width: 350px;
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
  letter-spacing: 1px;
}

.img-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.explosion-img {
  width: 100%;
  max-height: 650px;
  object-fit: contain;
}
.no-img-db {
  padding: 80px 20px;
  text-align: center;
  color: var(--text-muted);
  font-weight: bold;
  font-size: 14px;
  width: 100%;
}
.svg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.ref-area {
  pointer-events: all;
  cursor: pointer;
  transition: 0.2s;
}
.ref-area:hover {
  fill: rgba(255, 0, 0, 0.15);
  stroke: var(--accent);
  stroke-width: 2;
}

/* Acordeones de Kits */
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
  color: var(--text-main);
  font-size: 13px;
  letter-spacing: 0.5px;
}
.accordion-header:hover {
  background: var(--border);
  color: var(--accent);
}
.accordion-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  background: var(--bg-panel);
}
.accordion-body.open {
  max-height: 600px;
  overflow-y: auto;
}

/* Tablas técnicas */
.refacciones-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-main);
}
.refacciones-table th {
  background: var(--bg-input);
  padding: 12px 10px;
  text-align: left;
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
}
.refacciones-table td {
  padding: 12px 10px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  vertical-align: middle;
}
.pieza-thumb {
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: #fff;
}
.font-bold-light {
  font-weight: 600;
}
.sku-text {
  font-family: monospace;
  color: var(--text-muted);
  font-size: 12px;
}
.stock-ok {
  color: #2ea44f;
  font-weight: bold;
  font-size: 12px;
}
.stock-low {
  color: #e0a800;
  font-weight: bold;
  font-size: 12px;
}

.high-row {
  background: rgba(255, 0, 0, 0.08) !important;
  border-left: 4px solid var(--accent);
}

.btn-add-small {
  background: var(--accent);
  color: white;
  border: none;
  padding: 7px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: bold;
  transition: 0.2s;
}
.btn-add-small:hover {
  background: var(--accent-hover);
  box-shadow: 0 3px 8px rgba(255, 0, 0, 0.2);
}

.loading-state {
  text-align: center;
  padding: 100px 0;
  color: var(--text-muted);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.no-kits-msg {
  text-align: center;
  padding: 30px;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
