<template>
  <div :class="['cart-panel', { open: uiStore.isCartOpen }]">
    <div class="cart-header">
      <h2>Tu Carrito</h2>
      <span @click="uiStore.closeAll" class="close-btn">✕</span>
    </div>

    <div class="cart-items-container">
      <div v-if="cartStore.items.length === 0" class="empty-cart">Tu carrito está vacío.</div>

      <div v-else v-for="item in cartDetails" :key="item.id" class="cart-item">
        <img
          :src="item.Imagen_URL || 'https://via.placeholder.com/150'"
          width="50"
          height="50"
          class="item-img"
        />
        <div class="item-info">
          <b>{{ item.Producto }}</b
          ><br />
          <span style="color: var(--accent); font-weight: bold">
            ${{ formatPrecio(item.Precio) }} USD </span
          ><br />
          Cant:
          <input
            type="number"
            class="cart-qty-input"
            :value="item.cant"
            min="1"
            @change="actualizarCant(item.id, $event)"
          />
        </div>
        <button @click="cartStore.quitarProducto(item.id)" class="remove-btn">✕</button>
      </div>
    </div>

    <div class="cart-footer">
      <div class="cart-total-display" v-if="cartStore.items.length > 0">
        <span>Total Estimado:</span>
        <span style="color: var(--accent); font-size: 18px"
          >${{ formatPrecio(totalEstimado) }} USD</span
        >
      </div>

      <p class="security-note">🔒 El cálculo oficial se validará en el servidor.</p>

      <p v-if="!authStore.usuarioActual && cartStore.items.length > 0" class="login-warning">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { fetchProductos, procesarOrdenDeCompra, type Producto } from '@/api/inventory'

const cartStore = useCartStore()
const uiStore = useUiStore()
const authStore = useAuthStore()
const todosLosProductos = ref<Producto[]>([])
const procesando = ref(false)

onMounted(async () => {
  todosLosProductos.value = await fetchProductos()
})

// Mapea los detalles y se trae el precio de la base de datos
const cartDetails = computed(() => {
  return cartStore.items.map((cartItem) => {
    // CORRECCIÓN: Forzamos el ID del carrito a ser texto para que no falle la comparación
    const idBuscado = String(cartItem.id)

    const productDetail = todosLosProductos.value.find(
      (p) =>
        String(p.id) === idBuscado ||
        String(p.ID) === idBuscado ||
        String(p.Producto) === idBuscado,
    )

    return {
      ...cartItem,
      Producto: productDetail?.Producto || `Producto no encontrado (${idBuscado})`,
      // CORRECCIÓN: Agregamos el placeholder directo aquí para evitar la imagen rota
      Imagen_URL:
        productDetail?.Imagen_URL || productDetail?.imagen || 'https://via.placeholder.com/150',
      Precio: productDetail?.Precio || 0,
    }
  })
})

// Calcula la suma total reactiva del carrito
const totalEstimado = computed(() => {
  return cartDetails.value.reduce((total, item) => {
    const precio = parseFloat(String(item.Precio)) || 0
    return total + precio * item.cant
  }, 0)
})

const formatPrecio = (precio: number | string | undefined) => {
  return parseFloat(String(precio || 0)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const actualizarCant = (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  cartStore.actualizarCantidad(id, Number(target.value))
}

const procesarCompra = async () => {
  procesando.value = true
  try {
    const payload = cartStore.items.map((item) => ({ id: item.id, cantidad: item.cant }))

    // Llamada al backend
    interface RespuestaBackend {
      success: boolean
      mensaje: string
      totalCalculadoEnBackend: number
    }
    const respuesta = (await procesarOrdenDeCompra(payload)) as RespuestaBackend

    alert(
      `${respuesta.mensaje}\nTotal a pagar: $${formatPrecio(respuesta.totalCalculadoEnBackend)} USD`,
    )
    cartStore.vaciarCarrito()
    uiStore.closeAll()
  } catch (error) {
    console.error(error)
    alert('Ocurrió un error al procesar tu orden.')
  } finally {
    procesando.value = false
  }
}
</script>

<style scoped>
.cart-panel {
  position: fixed;
  top: 0;
  right: -420px;
  width: 380px;
  height: 100vh;
  background: var(--bg-panel);
  z-index: 9000;
  transition: right 0.4s ease;
  padding: 20px;
  border-left: 2px solid var(--accent);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  color: var(--text-main);
}
.cart-panel.open {
  right: 0;
}
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.cart-header h2 {
  color: var(--accent);
  margin: 0;
}
.close-btn {
  cursor: pointer;
  font-size: 24px;
}
.cart-items-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}
.empty-cart {
  text-align: center;
  color: var(--text-muted);
  margin-top: 50px;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 15px;
}
.item-img {
  object-fit: contain;
  background: white;
  border-radius: 4px;
  padding: 2px;
}
.item-info {
  flex: 1;
  font-size: 13px;
  line-height: 1.4;
}
.cart-qty-input {
  width: 50px;
  padding: 4px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text-main);
  border-radius: 4px;
  text-align: center;
  margin-top: 5px;
  font-weight: bold;
}
.remove-btn {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  padding: 5px;
}
.cart-footer {
  padding-top: 15px;
  border-top: 1px solid var(--border);
}
.cart-total-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 16px;
}
.security-note {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 10px;
  text-align: center;
}
.login-warning {
  color: #ff4444;
  font-size: 12px;
  text-align: center;
  margin-bottom: 10px;
  font-weight: bold;
}
.checkout-btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 14px;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
  font-size: 14px;
  letter-spacing: 1px;
}
.checkout-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
}
.checkout-btn:disabled {
  background: var(--border);
  color: var(--text-muted);
  cursor: not-allowed;
  box-shadow: none;
}
</style>
