<template>
  <div class="checkout-container">
    <NavBar />

    <main class="checkout-content">
      <!-- VISTA DE ÉXITO TRAS EL PAGO -->
      <div v-if="pagoExitoso" class="success-card">
        <div class="check-icon">✅</div>
        <h2>¡Pago Procesado con Éxito!</h2>
        <p>
          Tu orden <strong>#REL-{{ idOrden }}</strong> ha sido confirmada.
        </p>
        <button class="btn-primary" @click="$router.push('/catalogo')">Volver al Catálogo</button>
      </div>

      <!-- VISTA PRINCIPAL DE PAGO -->
      <div v-else class="checkout-grid">
        <!-- Formulario de Pago -->
        <section class="payment-section">
          <h2>💳 Pasarela de Pago Simulada</h2>
          <form @submit.prevent="procesarPago" class="payment-form">
            <div class="input-group">
              <label>Titular de la Tarjeta</label>
              <input type="text" v-model="nombreTarjeta" placeholder="Ej. Juan Pérez" required />
            </div>

            <div class="input-group">
              <label>Número de Tarjeta</label>
              <input
                type="text"
                v-model="numeroTarjeta"
                placeholder="4532 •••• •••• 8890"
                maxlength="19"
                required
              />
            </div>

            <div class="form-row">
              <div class="input-group">
                <label>Expiración</label>
                <input
                  type="text"
                  v-model="expiracion"
                  placeholder="MM/AA"
                  maxlength="5"
                  required
                />
              </div>
              <div class="input-group">
                <label>CVV</label>
                <input type="password" v-model="cvv" placeholder="123" maxlength="3" required />
              </div>
            </div>

            <button
              type="submit"
              :disabled="procesando || cartStore.items.length === 0"
              class="btn-pay"
            >
              {{ procesando ? 'Procesando Transacción...' : 'PAGAR AHORA' }}
            </button>
          </form>
        </section>

        <!-- Resumen del Pedido (Items del Carrito) -->
        <aside class="summary-section">
          <h3>Resumen del Pedido</h3>

          <div v-if="itemsConDetalle.length === 0" class="empty-summary">
            No hay productos en el carrito.
          </div>

          <div v-else class="items-list">
            <div v-for="item in itemsConDetalle" :key="item.id" class="summary-item">
              <img :src="item.imagen" :alt="item.nombre" class="item-img" />

              <div class="item-info">
                <h4 class="item-title">{{ item.nombre }}</h4>
                <p class="item-price">${{ item.precio.toFixed(2) }} USD</p>
                <span class="item-qty">Cant: {{ item.cant }}</span>
              </div>
            </div>
          </div>

          <div class="order-divider"></div>

          <div class="summary-total-row">
            <span>Total Estimado:</span>
            <span class="total-amount">${{ totalPrecio.toFixed(2) }} USD</span>
          </div>

          <button class="btn-secondary" @click="$router.push('/catalogo')">
            Modificar Carrito
          </button>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { fetchProductos, type Producto } from '@/api/inventory'
import NavBar from '@/components/NavBar.vue'

const cartStore = useCartStore()

const nombreTarjeta = ref('')
const numeroTarjeta = ref('')
const expiracion = ref('')
const cvv = ref('')
const procesando = ref(false)
const pagoExitoso = ref(false)
const idOrden = ref('')
const productosDetalle = ref<Producto[]>([])

// Cargar catálogo desde Google Sheets
const cargarCatalogo = async () => {
  try {
    productosDetalle.value = await fetchProductos()
  } catch (error) {
    console.error('Error cargando detalles del carrito en checkout:', error)
  }
}

onMounted(() => {
  cargarCatalogo()
})

// Mapeo detallado de cada producto en el carrito
const itemsConDetalle = computed(() => {
  return cartStore.items.map((item) => {
    const targetId = String(item.id || '')
      .trim()
      .toLowerCase()

    const prod = productosDetalle.value.find((p) => {
      const pId = String(p.id || '')
        .trim()
        .toLowerCase()
      const pID = String(p.ID || '')
        .trim()
        .toLowerCase()
      const pSku = String(p.sku || '')
        .trim()
        .toLowerCase()
      const pNombre = String(p.Producto || p.nombre || '')
        .trim()
        .toLowerCase()

      return (
        (pId && pId === targetId) ||
        (pID && pID === targetId) ||
        (pSku && pSku === targetId) ||
        (pNombre && pNombre === targetId)
      )
    })

    const precioNumerico =
      typeof prod?.Precio === 'number' ? prod.Precio : parseFloat(String(prod?.Precio || 0)) || 0

    const nombreProducto =
      prod?.Producto || (item.id !== 'undefined' ? item.id : 'Producto sin título')

    return {
      id: item.id,
      cant: item.cant,
      nombre: nombreProducto,
      precio: precioNumerico,
      imagen:
        prod?.Imagen_URL ||
        prod?.imagen ||
        `https://via.placeholder.com/60?text=${encodeURIComponent(nombreProducto)}`,
    }
  })
})

const totalPrecio = computed(() => {
  return itemsConDetalle.value.reduce((acc, item) => acc + item.precio * item.cant, 0)
})

const procesarPago = () => {
  procesando.value = true

  setTimeout(() => {
    procesando.value = false
    pagoExitoso.value = true
    idOrden.value = Math.floor(100000 + Math.random() * 900000).toString()
    cartStore.vaciarCarrito()
  }, 2000)
}
</script>

<style scoped>
.checkout-container {
  min-height: 100vh;
  background: var(--bg-main, #09090b);
  color: var(--text-main, #ffffff);
}
.checkout-content {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
}
.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 30px;
}
.payment-section,
.summary-section {
  background: var(--bg-panel, #18181b);
  border: 1px solid var(--border, #27272a);
  border-radius: 12px;
  padding: 30px;
}
.payment-section h2,
.summary-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: 800;
}
.input-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input-group label {
  font-size: 12px;
  color: var(--text-muted, #a1a1aa);
  font-weight: bold;
}
.input-group input {
  background: var(--bg-input, #09090b);
  border: 1px solid var(--border, #27272a);
  color: var(--text-main, #ffffff);
  padding: 12px;
  border-radius: 8px;
  outline: none;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.btn-pay {
  width: 100%;
  background: #ff0000;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-weight: 900;
  cursor: pointer;
  margin-top: 10px;
}
.btn-pay:hover:not(:disabled) {
  background: #cc0000;
}
.btn-pay:disabled {
  background: #27272a;
  color: #71717a;
  cursor: not-allowed;
}

/* LISTA DE PRODUCTOS EN CHECKOUT */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 380px;
  overflow-y: auto;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-input, #09090b);
  border: 1px solid var(--border, #27272a);
  padding: 10px;
  border-radius: 8px;
}
.item-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  background: #ffffff;
}
.item-info {
  flex: 1;
}
.item-title {
  margin: 0 0 4px 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-main, #ffffff);
  line-height: 1.2;
}
.item-price {
  margin: 0;
  color: #ff0000;
  font-weight: 800;
  font-size: 0.85rem;
}
.item-qty {
  font-size: 0.75rem;
  color: var(--text-muted, #a1a1aa);
}
.empty-summary {
  text-align: center;
  color: var(--text-muted, #a1a1aa);
  padding: 20px 0;
  font-style: italic;
}
.order-divider {
  height: 1px;
  background: var(--border, #27272a);
  margin: 20px 0;
}
.summary-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 20px;
}
.total-amount {
  color: #ff0000;
  font-size: 1.2rem;
}

.success-card {
  text-align: center;
  background: var(--bg-panel, #18181b);
  border: 1px solid var(--border, #27272a);
  padding: 50px;
  border-radius: 16px;
  max-width: 500px;
  margin: 50px auto;
}
.check-icon {
  font-size: 50px;
  margin-bottom: 15px;
}
.btn-primary,
.btn-secondary {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background: #ff0000;
  color: white;
}
.btn-secondary {
  background: var(--bg-input, #09090b);
  color: var(--text-main, #ffffff);
  border: 1px solid var(--border, #27272a);
  width: 100%;
}

@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
