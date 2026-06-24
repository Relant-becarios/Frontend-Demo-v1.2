<template>
  <div v-if="marketStore.isModalOpen" class="modal-detalles" @click.self="marketStore.closeModal">
    <div class="modal-content">
      <div class="modal-img-side" @mousemove="zoomImage" @mouseleave="resetZoom" ref="containerRef">
        <img
          :src="producto?.Imagen_URL || producto?.imagen || 'https://via.placeholder.com/400'"
          ref="imgRef"
        />
      </div>

      <div class="modal-info-side">
        <h2 class="det-titulo">{{ producto?.Producto }}</h2>
        <div class="det-precio">${{ formatPrecio(producto?.Precio) }} USD</div>

        <div class="ficha-header">FICHA TÉCNICA</div>
        <table class="ficha-tabla">
          <tbody>
            <tr v-for="(valor, clave) in fichaTecnica" :key="clave">
              <td>{{ String(clave).replace(/_/g, ' ') }}</td>
              <td>{{ valor }}</td>
            </tr>
          </tbody>
        </table>

        <button @click="añadirAlCarrito" class="btn-add-modal">AÑADIR AL CARRITO</button>
        <button @click="marketStore.closeModal" class="btn-close-modal">
          CERRAR FICHA TÉCNICA
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMarketStore } from '@/stores/market'
import { useCartStore } from '@/stores/cart'

const marketStore = useMarketStore()
const cartStore = useCartStore()

const containerRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)

const producto = computed(() => marketStore.selectedProduct)

const formatPrecio = (precio: number | string | undefined) => {
  return parseFloat(String(precio || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })
}

const fichaTecnica = computed(() => {
  if (!producto.value) return {}
  const excluidos = ['Imagen_URL', 'imagen', 'Producto', 'Precio', 'ID', 'id', 'Categoria']
  const specs: Record<string, string | number | boolean> = {}

  Object.entries(producto.value).forEach(([key, value]) => {
    if (!excluidos.includes(key) && value !== undefined && value !== null) {
      specs[key] = value as string | number | boolean
    }
  })
  return specs
})

const añadirAlCarrito = () => {
  if (producto.value) {
    const idParaCarrito = producto.value.id || producto.value.ID || producto.value.Producto
    cartStore.agregarProducto(idParaCarrito as string)
    marketStore.closeModal()
  }
}

const zoomImage = (e: MouseEvent) => {
  if (!containerRef.value || !imgRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  imgRef.value.style.transformOrigin = `${x}% ${y}%`
  imgRef.value.style.transform = 'scale(2.5)'
}

const resetZoom = () => {
  if (imgRef.value) imgRef.value.style.transform = 'scale(1)'
}
</script>

<style scoped>
.modal-detalles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 8000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-content {
  background: #161b22;
  max-width: 950px;
  width: 100%;
  border-radius: 15px;
  display: flex;
  overflow: hidden;
  border: 1px solid #30363d;
  max-height: 90vh;
}
.modal-img-side {
  width: 45%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: crosshair;
  position: relative;
}
.modal-img-side img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.1s ease-out;
}
.modal-info-side {
  width: 55%;
  padding: 40px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.det-titulo {
  color: #ff0000;
  margin: 0;
}
.det-precio {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #fff;
}
.ficha-header {
  font-size: 12px;
  color: #ff0000;
  font-weight: bold;
  margin-top: 10px;
}
.ficha-tabla {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.ficha-tabla td {
  padding: 10px;
  border-bottom: 1px solid #30363d;
  color: #fff;
}
.ficha-tabla tr td:first-child {
  color: #ff0000;
  font-weight: bold;
  width: 40%;
  text-transform: uppercase;
}
.btn-add-modal {
  background: #ff0000;
  color: white;
  border: none;
  padding: 18px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}
.btn-close-modal {
  background: #444;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
}
</style>
