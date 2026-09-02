<template>
  <div class="checkout-container">
    <NavBar />

    <main class="checkout-content">
      <div v-if="pagoExitoso" class="success-card">
        <div class="check-icon">✅</div>
        <h2>¡Pago Procesado con Éxito!</h2>
        <p>
          Tu orden <strong>#REL-{{ idOrden }}</strong> ha sido confirmada.
        </p>
        <button class="btn-primary" @click="$router.push('/catalogo')">Volver al Catálogo</button>
      </div>

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

            <button type="submit" :disabled="procesando" class="btn-pay">
              {{ procesando ? 'Procesando Transacción...' : 'PAGAR AHORA' }}
            </button>
          </form>
        </section>

        <!-- Resumen de Orden -->
        <aside class="summary-section">
          <h3>Resumen del Pedido</h3>
          <p class="summary-count">Artículos en carrito: {{ cartStore.totalItems }}</p>

          <div class="order-divider"></div>

          <button class="btn-secondary" @click="$router.push('/catalogo')">
            Modificar Carrito
          </button>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import NavBar from '@/components/NavBar.vue'

const cartStore = useCartStore()

const nombreTarjeta = ref('')
const numeroTarjeta = ref('')
const expiracion = ref('')
const cvv = ref('')
const procesando = ref(false)
const pagoExitoso = ref(false)
const idOrden = ref('')

const procesarPago = () => {
  procesando.value = true

  // Simulación de respuesta de banco (2 segundos)
  setTimeout(() => {
    procesando.value = false
    pagoExitoso.value = true
    idOrden.value = Math.floor(100000 + Math.random() * 900000).toString()
    cartStore.vaciarCarrito() // Vacía el carrito tras la compra
  }, 2000)
}
</script>

<style scoped>
.checkout-container {
  min-height: 100vh;
  background: var(--bg-main);
  color: var(--text-main);
}
.checkout-content {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}
.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}
.payment-section,
.summary-section {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 30px;
}
.input-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input-group label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: bold;
}
.input-group input {
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-main);
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
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}
.btn-pay:hover:not(:disabled) {
  background: #cc0000;
}
.success-card {
  text-align: center;
  background: var(--bg-panel);
  border: 1px solid var(--border);
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
  margin-top: 15px;
}
.btn-primary {
  background: #ff0000;
  color: white;
}
.btn-secondary {
  background: var(--bg-input);
  color: var(--text-main);
  border: 1px solid var(--border);
  width: 100%;
}
</style>
