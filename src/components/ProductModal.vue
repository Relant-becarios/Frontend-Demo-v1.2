<template>
  <div v-if="marketStore.isModalOpen" class="modal-overlay" @click.self="marketStore.closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 style="color: var(--accent); margin: 0">FICHA TÉCNICA</h2>
        <span @click="marketStore.closeModal" class="close-btn">✕</span>
      </div>

      <div class="modal-body" v-if="producto">
        <img
          :src="producto.Imagen_URL || producto.imagen || 'https://via.placeholder.com/300'"
          class="modal-img"
        />
        <div class="modal-info">
          <h3>{{ producto.Producto }}</h3>
          <p class="desc-text">{{ producto.Descripcion || 'Sin descripción detallada.' }}</p>

          <div class="specs">
            <p><strong>Categoría:</strong> {{ producto.Categoria || 'N/A' }}</p>
            <p><strong>SKU/ID:</strong> {{ producto.id || producto.ID || 'N/A' }}</p>
          </div>

          <div class="modal-actions">
            <button class="btn-primary" @click="añadirAlCarrito">AÑADIR AL CARRITO</button>

            <button v-if="mostrarBtnRefacciones" class="btn-refacciones" @click="irARefacciones">
              ⚙️ VER KITS Y REFACCIONES
            </button>

            <button class="btn-secondary" @click="marketStore.closeModal">
              CERRAR FICHA TÉCNICA
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/market'
import { useCartStore } from '@/stores/cart'

const marketStore = useMarketStore()
const cartStore = useCartStore()
const router = useRouter()

const producto = computed(() => marketStore.selectedProduct)

// Lógica para detectar si es un equipo prefabicado (Válvula, Bomba, etc)
const mostrarBtnRefacciones = computed(() => {
  if (!producto.value) return false
  const nombre = (producto.value.Producto || '').toLowerCase()
  const categoria = (producto.value.Categoria || '').toLowerCase()
  return (
    nombre.includes('valvula') ||
    nombre.includes('válvula') ||
    nombre.includes('bomba') ||
    categoria.includes('valvula') ||
    categoria.includes('bomba')
  )
})

const añadirAlCarrito = () => {
  if (producto.value) {
    const id = producto.value.id || producto.value.ID || producto.value.Producto
    cartStore.agregarProducto(id as string)
    alert('Añadido al carrito')
    marketStore.closeModal()
  }
}

const irARefacciones = () => {
  if (producto.value) {
    const id = producto.value.id || producto.value.ID
    marketStore.closeModal()
    router.push(`/refacciones/${id}`)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: var(--bg-panel);
  width: 90%;
  max-width: 800px;
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow: hidden;
  color: var(--text-main);
}
.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-input);
}
.close-btn {
  font-size: 24px;
  cursor: pointer;
  color: var(--text-muted);
  transition: 0.2s;
}
.close-btn:hover {
  color: var(--accent);
}
.modal-body {
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  gap: 20px;
}
.modal-img {
  flex: 1;
  min-width: 250px;
  max-width: 350px;
  object-fit: contain;
  background: white;
  border-radius: 8px;
}
.modal-info {
  flex: 2;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.desc-text {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
}
.specs p {
  margin: 5px 0;
  font-size: 14px;
}
.modal-actions {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;
}
.btn-primary:hover {
  background: var(--accent-hover);
}
.btn-secondary {
  background: var(--bg-input);
  color: var(--text-main);
  border: 1px solid var(--border);
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;
}
.btn-secondary:hover {
  background: var(--border);
}
.btn-refacciones {
  background: #e0a800;
  color: #000;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;
}
.btn-refacciones:hover {
  background: #c69500;
}
</style>
