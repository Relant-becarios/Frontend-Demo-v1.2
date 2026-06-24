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
      <p class="security-note">🔒 El cálculo total se realizará de forma segura en el servidor.</p>
      <button
        @click="procesarCompra"
        class="checkout-btn"
        :disabled="cartStore.items.length === 0 || procesando"
      >
        {{ procesando ? 'Procesando...' : 'PROCESAR COMPRA' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useUiStore } from '@/stores/ui' // Importamos UI Store
import { fetchProductos, procesarOrdenDeCompra, type Producto } from '@/api/inventory'

const cartStore = useCartStore()
const uiStore = useUiStore() // Instanciamos
const todosLosProductos = ref<Producto[]>([])
const procesando = ref(false)

onMounted(async () => {
  todosLosProductos.value = await fetchProductos()
})

const cartDetails = computed(() => {
  return cartStore.items.map((cartItem) => {
    const productDetail = todosLosProductos.value.find(
      (p) => p.id === cartItem.id || p.ID === cartItem.id,
    )
    return {
      ...cartItem,
      Producto: productDetail?.Producto || 'Cargando...',
      Imagen_URL: productDetail?.Imagen_URL || productDetail?.imagen || '',
    }
  })
})

const actualizarCant = (id: string, event: Event) => {
  const target = event.target as HTMLInputElement
  cartStore.actualizarCantidad(id, Number(target.value))
}

const procesarCompra = async () => {
  procesando.value = true
  try {
    const payload = cartStore.items.map((item) => ({ id: item.id, cantidad: item.cant }))
    interface RespuestaBackend {
      success: boolean
      mensaje: string
      totalCalculadoEnBackend: number
    }
    const respuesta = (await procesarOrdenDeCompra(payload)) as RespuestaBackend
    alert(
      `${respuesta.mensaje}\nTotal calculado por el backend: $${respuesta.totalCalculadoEnBackend} USD`,
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
  background: #161b22;
  z-index: 9000;
  transition: right 0.4s ease;
  padding: 20px;
  border-left: 2px solid #ff0000;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  color: #fff;
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
  color: #ff0000;
  margin: 0;
}
.close-btn {
  cursor: pointer;
  font-size: 24px;
}
.cart-items-container {
  flex: 1;
  overflow-y: auto;
}
.empty-cart {
  text-align: center;
  color: #8b949e;
  margin-top: 50px;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #30363d;
  padding-bottom: 10px;
}
.item-img {
  object-fit: contain;
  background: white;
  border-radius: 4px;
}
.item-info {
  flex: 1;
  font-size: 12px;
}
.cart-qty-input {
  width: 55px;
  padding: 5px;
  border: 1px solid #30363d;
  background: #0d1117;
  color: #ffffff;
  border-radius: 4px;
  text-align: center;
  margin-top: 5px;
}
.remove-btn {
  background: none;
  border: none;
  color: #ff0000;
  cursor: pointer;
  font-weight: bold;
}
.cart-footer {
  padding-top: 15px;
  border-top: 1px solid #30363d;
}
.security-note {
  font-size: 11px;
  color: #8b949e;
  margin-bottom: 10px;
  text-align: center;
}
.checkout-btn {
  background: #ff0000;
  color: white;
  border: none;
  padding: 12px;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
.checkout-btn:hover:not(:disabled) {
  background: #cc0000;
}
.checkout-btn:disabled {
  background: #444;
  cursor: not-allowed;
}
</style>
