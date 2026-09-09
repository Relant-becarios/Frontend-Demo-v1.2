<template>
  <div class="checkout-container">
    <NavBar />

    <main class="checkout-content">
      <!-- PANTALLA DE ÉXITO TRAS VOLVER DE MERCADO PAGO -->
      <div v-if="pagoExitoso" class="success-card">
        <div class="check-icon">✅</div>
        <h2>¡Pago Procesado con Éxito!</h2>
        <p>
          Tu orden <strong>#REL-{{ idOrden }}</strong> ha sido confirmada.
        </p>
        <p>El inventario ha sido actualizado en la base de datos.</p>
        <button class="btn-primary" @click="$router.push('/catalogo')">Volver al Catálogo</button>
      </div>

      <!-- PANTALLA DE ERROR / FALLO -->
      <div v-else-if="pagoFallido" class="error-card">
        <div class="error-icon">❌</div>
        <h2>Ocurrió un problema con el pago</h2>
        <p>El pago fue rechazado o cancelado. No se hizo ningún cargo.</p>
        <button class="btn-secondary" @click="pagoFallido = false">Intentar de nuevo</button>
      </div>

      <!-- VISTA PRINCIPAL (RESUMEN Y BOTÓN DE PAGO) -->
      <div v-else class="checkout-grid">
        <section class="payment-section">
          <h2>Pagar con Mercado Pago</h2>
          <p class="mp-subtitle">Serás redirigido de forma segura a la plataforma de pago.</p>

          <div v-if="errorMensaje" class="error-banner">⚠️ {{ errorMensaje }}</div>

          <button
            @click="generarPagoMercadoPago"
            :disabled="procesando || cartStore.items.length === 0"
            class="btn-mercadopago"
          >
            {{ procesando ? 'Generando Link...' : 'PAGAR CON MERCADO PAGO' }}
          </button>
        </section>

        <!-- Resumen del Pedido (Items del Carrito) -->
        <aside class="summary-section">
          <!-- (El mismo resumen del carrito que ya tenías) -->
          <h3>Resumen del Pedido</h3>
          <div v-if="itemsConDetalle.length === 0" class="empty-summary">No hay productos.</div>
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
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { fetchProductos, type Producto } from '@/api/inventory'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const procesando = ref(false)
const pagoExitoso = ref(false)
const pagoFallido = ref(false)
const idOrden = ref('')
const errorMensaje = ref('')
const productosDetalle = ref<Producto[]>([])

// Base URL del API
const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// 1. Verificar si el usuario viene regresando de Mercado Pago
onMounted(async () => {
  cargarCatalogo()

  // Si en la URL viene ?status=approved, significa que ya pagó en Mercado Pago
  if (route.query.status === 'approved') {
    await descontarStockEnBackend() // Descontamos de Postgres
    pagoExitoso.value = true
    idOrden.value = String(route.query.payment_id || Math.floor(100000 + Math.random() * 900000))
    cartStore.vaciarCarrito()
    router.replace('/checkout') // Limpiamos la URL
  } else if (route.query.status === 'failure') {
    pagoFallido.value = true
    router.replace('/checkout')
  }
})

const cargarCatalogo = async () => {
  productosDetalle.value = await fetchProductos()
}

// 2. Mapeo detallado del carrito
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
      return pId === targetId || pID === targetId
    })
    return {
      id: item.id,
      cant: item.cant,
      nombre: prod?.Producto || item.id,
      precio: parseFloat(String(prod?.Precio || 0)) || 0,
      imagen: prod?.Imagen_URL || prod?.imagen || `https://via.placeholder.com/60`,
    }
  })
})

const totalPrecio = computed(() => {
  return itemsConDetalle.value.reduce((acc, item) => acc + item.precio * item.cant, 0)
})

// 3. Función principal para ir a Mercado Pago
const generarPagoMercadoPago = async () => {
  procesando.value = true
  errorMensaje.value = ''

  try {
    const respuesta = await fetch(`${URL_API}/api/create_preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsConDetalle.value }),
    })

    const data = await respuesta.json()

    if (data.init_point) {
      // Redirigir al link seguro de Mercado Pago
      window.location.href = data.init_point
    } else {
      throw new Error('No se pudo generar el link de pago.')
    }
  } catch (error: unknown) {
    console.error(error)
    errorMensaje.value = error instanceof Error ? error.message : 'No se pudo generar el link de pago.'
  } finally {
    procesando.value = false
  }
}

// 4. Función para descontar stock (se llama automáticamente cuando regresan de MP)
const descontarStockEnBackend = async () => {
  if (cartStore.items.length === 0) return

  try {
    await fetch(`${URL_API}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartStore.items.map((item) => ({ id: item.id, cantidad: item.cant })),
      }),
    })
  } catch (error) {
    console.error('Error al descontar stock:', error)
  }
}
</script>

<style scoped>
/* Agrega este estilo al final de tus otros estilos de CheckoutView */
.btn-mercadopago {
  width: 100%;
  background: #009ee3; /* Color azul oficial de Mercado Pago */
  color: white;
  border: none;
  padding: 18px;
  border-radius: 8px;
  font-weight: 900;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
}
.btn-mercadopago:hover:not(:disabled) {
  background: #007ebd;
}
.mp-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 25px;
}
.error-card {
  text-align: center;
  background: var(--bg-panel, #18181b);
  border: 1px solid #ff0000;
  padding: 50px;
  border-radius: 16px;
  max-width: 500px;
  margin: 50px auto;
}
.error-icon {
  font-size: 50px;
  margin-bottom: 15px;
}
/* ... y mantén los demás estilos que ya tenías para el resumen y cards ... */
</style>
