<template>
  <div class="cart-panel-overlay" :class="{ open: uiStore.isCartOpen }" @click="uiStore.closeAll">
    <aside class="cart-panel" :class="{ open: uiStore.isCartOpen }" @click.stop>
      <div class="cart-header">
        <h3>🛒 Carrito de Cotización</h3>
        <button class="btn-close" @click="uiStore.closeAll">✕</button>
      </div>

      <div class="cart-body">
        <div v-if="cartStore.items.length === 0" class="empty-cart">El carrito está vacío.</div>

        <div v-else class="cart-items-list">
          <div v-for="item in itemsConDetalle" :key="item.id" class="cart-item">
            <img :src="item.imagen" :alt="item.nombre" class="item-img" />

            <div class="item-info">
              <h4 class="item-title">{{ item.nombre }}</h4>
              <p class="item-price">${{ item.precio.toFixed(2) }} USD</p>

              <div class="item-qty-row">
                <label>Cant:</label>
                <input
                  type="number"
                  min="1"
                  :value="item.cant"
                  @change="
                    (e) =>
                      cartStore.actualizarCantidad(
                        item.id,
                        Number((e.target as HTMLInputElement).value),
                      )
                  "
                  class="qty-input"
                />
              </div>
            </div>

            <button
              class="btn-remove"
              @click="cartStore.quitarProducto(item.id)"
              title="Eliminar producto"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div class="cart-footer">
        <div class="summary-row">
          <span>Total Estimado:</span>
          <span class="total-price">${{ totalPrecio.toFixed(2) }} USD</span>
        </div>

        <p class="disclaimer">🔒 El cálculo oficial se validará en el servidor.</p>

        <p v-if="!authStore.usuarioActual" class="auth-warning">
          Debes iniciar sesión para procesar la orden.
        </p>

        <button
          @click="procesarCompra"
          class="checkout-btn"
          :disabled="cartStore.items.length === 0 || procesando || !authStore.usuarioActual"
        >
          {{ procesando ? 'Procesando...' : 'PROCESAR ORDEN' }}
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { fetchProductos, type Producto } from '@/api/inventory'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const procesando = ref(false)
const productosDetalle = ref<Producto[]>([])

const cargarCatalogo = async () => {
  try {
    const data = await fetchProductos()
    productosDetalle.value = data
  } catch (error) {
    console.error('Error cargando detalles en carrito:', error)
  }
}

onMounted(() => {
  cargarCatalogo()
})

// Refresca la información automáticamente cada vez que el usuario abre el panel
watch(
  () => uiStore.isCartOpen,
  (isOpen) => {
    if (isOpen) {
      cargarCatalogo()
    }
  },
)

const itemsConDetalle = computed(() => {
  return cartStore.items.map((item) => {
    const targetId = String(item.id || '')
      .trim()
      .toLowerCase()

    // Búsqueda flexible tolerante a ID, ID alternativo, SKU o Nombre de Producto
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

const procesarCompra = () => {
  uiStore.closeAll()
  router.push('/checkout')
}
</script>

<style scoped>
.cart-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 30000;
}

.cart-panel-overlay.open {
  opacity: 1;
  visibility: visible;
}

.cart-panel {
  position: fixed;
  top: 0;
  right: -420px;
  width: 100%;
  max-width: 400px;
  height: 100vh;
  background: var(--bg-panel, #18181b);
  border-left: 1px solid var(--border, #27272a);
  color: var(--text-main, #ffffff);
  display: flex;
  flex-direction: column;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
}

.cart-panel.open {
  right: 0;
}

.cart-header {
  padding: 20px;
  border-bottom: 1px solid var(--border, #27272a);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-muted, #a1a1aa);
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #ff0000;
}

.cart-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-cart {
  text-align: center;
  color: var(--text-muted, #a1a1aa);
  margin-top: 50px;
  font-style: italic;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-input, #09090b);
  border: 1px solid var(--border, #27272a);
  padding: 12px;
  border-radius: 8px;
  position: relative;
}

.item-img {
  width: 55px;
  height: 55px;
  object-fit: cover;
  border-radius: 6px;
  background: #ffffff;
}

.item-info {
  flex: 1;
}

.item-title {
  margin: 0 0 4px 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main, #ffffff);
  line-height: 1.2;
}

.item-price {
  margin: 0 0 6px 0;
  color: #ff0000;
  font-weight: 800;
  font-size: 0.9rem;
}

.item-qty-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-muted, #a1a1aa);
}

.qty-input {
  width: 50px;
  background: var(--bg-panel, #18181b);
  border: 1px solid var(--border, #27272a);
  color: var(--text-main, #ffffff);
  border-radius: 4px;
  padding: 2px 6px;
  text-align: center;
  outline: none;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px 8px;
}

.btn-remove:hover {
  color: #ff0000;
}

.cart-footer {
  padding: 20px;
  border-top: 1px solid var(--border, #27272a);
  background: var(--bg-panel, #18181b);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.total-price {
  color: #ff0000;
  font-size: 1.2rem;
}

.disclaimer {
  font-size: 0.75rem;
  color: var(--text-muted, #a1a1aa);
  text-align: center;
  margin-bottom: 12px;
}

.auth-warning {
  color: #ff4444;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.checkout-btn {
  width: 100%;
  background: #ff0000;
  color: #ffffff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 900;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  letter-spacing: 0.5px;
}

.checkout-btn:hover:not(:disabled) {
  background: #cc0000;
}

.checkout-btn:disabled {
  background: #27272a;
  color: #71717a;
  cursor: not-allowed;
}
</style>
