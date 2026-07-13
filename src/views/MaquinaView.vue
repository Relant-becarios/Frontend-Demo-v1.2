<template>
  <div class="maquina-dashboard">
    <NavBar @toggle-cart="$emit('toggle-cart')" />

    <div class="dashboard-content">
      <header class="dash-header">
        <div>
          <h1 class="dash-title">Panel de Control: Máquina Expendedora</h1>
          <p class="dash-subtitle">
            ID de Equipo: <span style="color: var(--text-main)">{{ idMaquina }}</span> | Licencia:
            Activa | Estatus: <span class="status-online">En Línea</span>
          </p>
        </div>
      </header>

      <div class="main-grid">
        <!-- Columna Izquierda: Inventario -->
        <div class="left-col">
          <div class="widget">
            <h3>Layout de Máquina (Inventario Actual)</h3>
            <p class="widget-note" style="margin-bottom: 20px">
              Seleccione los artículos que desea extraer de la máquina. El sistema validará su
              solicitud.
            </p>

            <div class="coil-grid">
              <div
                v-for="item in inventarioMaquina"
                :key="item.posicion"
                :class="['coil-slot', { 'out-of-stock': item.stock === 0 }]"
                @click="agregarAlPedido(item)"
              >
                <span class="slot-id">{{ item.posicion }}</span>
                <span class="slot-name">{{ item.nombre }}</span>
                <span class="slot-price">${{ item.precio.toFixed(2) }}</span>
                <span class="slot-stock">Disp: {{ item.stock }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Confirmación de Pedido -->
        <div class="right-col">
          <div class="widget order-widget">
            <h3>Generar Pedido</h3>

            <div class="order-items">
              <div v-if="pedidoActual.length === 0" class="empty-order">
                No ha seleccionado artículos.
              </div>

              <div v-else v-for="(item, index) in pedidoActual" :key="index" class="order-item">
                <div class="order-item-info">
                  <span class="item-pos">[{{ item.posicion }}]</span> {{ item.nombre }}
                </div>
                <div class="order-item-price">${{ item.precio.toFixed(2) }}</div>
                <button class="btn-remove" @click="quitarDelPedido(index)">✕</button>
              </div>
            </div>

            <div class="order-summary" v-if="pedidoActual.length > 0">
              <div class="summary-row total-row">
                <span>Total a descontar:</span>
                <span>${{ totalPedido.toFixed(2) }} USD</span>
              </div>
            </div>

            <!-- BOTÓN EXÁCTO AL DE TUS NOTAS -->
            <button
              class="btn-confirm"
              :disabled="pedidoActual.length === 0 || procesando"
              @click="procesarPedido"
            >
              {{ procesando ? estadoProceso : 'VALIDAR USUARIO Y CONFIRMAR PEDIDO' }}
            </button>

            <p class="legal-note">
              Al confirmar, se generará un PDF automático que será enviado a Diana (Surtido) y a su
              correo registrado para el descuento y facturación quincenal.
            </p>
          </div>

          <!-- Widget de Presupuesto -->
          <div class="widget budget-widget">
            <h3>Presupuesto Mensual</h3>
            <div class="budget-display">
              <span class="budget-used">${{ presupuestoConsumido.toFixed(2) }}</span>
              <span class="budget-max">/ $4,000.00 USD</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: porcentajePresupuesto + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'

defineEmits(['toggle-cart'])

const route = useRoute()
const idMaquina = route.params.id || 'VENDING-001'

// Simulamos los productos dentro de esta máquina específica
const inventarioMaquina = ref([
  { posicion: 'A1', nombre: 'Válvula Dosificadora AX', precio: 150.0, stock: 5 },
  { posicion: 'A2', nombre: 'Kit Sellos Industriales', precio: 45.5, stock: 12 },
  { posicion: 'A3', nombre: 'Pistón de Reemplazo', precio: 85.0, stock: 2 },
  { posicion: 'B1', nombre: 'Sensor Óptico V2', precio: 120.0, stock: 0 },
  { posicion: 'B2', nombre: 'Manguera Teflón (1m)', precio: 15.0, stock: 25 },
  { posicion: 'B3', nombre: 'Boquilla de Precisión', precio: 35.0, stock: 8 },
])

interface Producto {
  posicion: string
  nombre: string
  precio: number
  stock: number
}

const pedidoActual = ref<Producto[]>([])
const presupuestoConsumido = ref(1250.0)
const procesando = ref(false)
const estadoProceso = ref('')

const totalPedido = computed(() => {
  return pedidoActual.value.reduce((total, item) => total + item.precio, 0)
})

const porcentajePresupuesto = computed(() => {
  return (presupuestoConsumido.value / 4000) * 100
})

const agregarAlPedido = (item: Producto) => {
  if (item.stock > 0) {
    pedidoActual.value.push({ ...item })
  }
}

const quitarDelPedido = (index: number) => {
  pedidoActual.value.splice(index, 1)
}

// LOGICA BASADA EN TUS NOTAS
const procesarPedido = () => {
  procesando.value = true

  // 1. Validación de Usuario
  estadoProceso.value = 'Validando credenciales de usuario...'

  setTimeout(() => {
    // 2. Generación del PDF
    estadoProceso.value = 'Generando orden de surtido en PDF...'

    setTimeout(() => {
      // 3. Envío por correo
      estadoProceso.value = 'Enviando PDF a Diana y al Solicitante...'

      setTimeout(() => {
        presupuestoConsumido.value += totalPedido.value
        pedidoActual.value = []
        procesando.value = false
        estadoProceso.value = ''

        alert(
          '✅ ¡Validación y Pedido Confirmados!\n\nEl PDF se ha generado y enviado a Diana para su surtido, y una copia ha llegado a tu correo. El descuento ha sido aplicado a tu máquina.',
        )
      }, 1500)
    }, 1500)
  }, 1200)
}
</script>

<style scoped>
.maquina-dashboard {
  min-height: 100vh;
  background: var(--bg-main);
  color: var(--text-main);
}
.dashboard-content {
  padding: 30px 5%;
  max-width: 1400px;
  margin: 0 auto;
}
.dash-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.dash-title {
  margin: 0;
  color: var(--accent);
  letter-spacing: 1px;
}
.dash-subtitle {
  margin: 5px 0 0 0;
  color: var(--text-muted);
  font-size: 14px;
}
.status-online {
  color: #2ea44f;
  font-weight: bold;
}
.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
}
@media (max-width: 900px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}
.widget {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 25px;
}
.widget h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
}
.widget-note {
  font-size: 12px;
  color: #8b949e;
  margin: 0;
}
.coil-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
}
.coil-slot {
  background: var(--bg-input);
  border: 1px dashed var(--border);
  border-radius: 8px;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: 0.2s;
}
.coil-slot:hover:not(.out-of-stock) {
  border-color: var(--accent);
  background: rgba(255, 0, 0, 0.05);
  transform: translateY(-2px);
}
.coil-slot.out-of-stock {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.2);
}
.slot-id {
  position: absolute;
  top: 5px;
  left: 8px;
  font-size: 11px;
  font-weight: bold;
  color: var(--text-muted);
}
.slot-name {
  font-size: 12px;
  font-weight: bold;
  margin: 15px 0 5px 0;
  color: var(--text-main);
  line-height: 1.2;
}
.slot-price {
  font-size: 14px;
  color: var(--accent);
  font-weight: bold;
}
.slot-stock {
  font-size: 10px;
  color: #8b949e;
  margin-top: 5px;
}
.order-items {
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
}
.empty-order {
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 50px;
  font-size: 13px;
}
.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.order-item-info {
  flex: 1;
}
.item-pos {
  color: var(--accent);
  font-weight: bold;
  margin-right: 5px;
}
.order-item-price {
  font-weight: bold;
  margin-right: 15px;
}
.btn-remove {
  background: transparent;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-weight: bold;
}
.order-summary {
  background: var(--bg-input);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.total-row {
  font-weight: bold;
  color: var(--accent);
  font-size: 16px;
}
.btn-confirm {
  width: 100%;
  background: var(--accent);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  letter-spacing: 1px;
}
.btn-confirm:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
}
.btn-confirm:disabled {
  background: var(--border);
  color: var(--text-muted);
  cursor: not-allowed;
}
.legal-note {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  margin-top: 15px;
  line-height: 1.4;
}
.budget-display {
  margin-bottom: 15px;
}
.budget-used {
  font-size: 28px;
  font-weight: 900;
  color: var(--text-main);
}
.budget-max {
  font-size: 16px;
  color: var(--text-muted);
}
.progress-bar-bg {
  width: 100%;
  height: 10px;
  background: var(--bg-input);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  transition: 0.3s;
}
</style>
