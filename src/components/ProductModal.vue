<template>
  <div v-if="marketStore.isModalOpen" class="modal-overlay" @click.self="marketStore.closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 style="color: var(--accent); margin: 0; letter-spacing: 1px;">FICHA TÉCNICA</h2>
        <span @click="marketStore.closeModal" class="close-btn">✕</span>
      </div>

      <div class="modal-body" v-if="producto">
          <img :src="String((producto as Record<string, unknown>)['Imagen URL'] || producto.Imagen_URL || producto.imagen || 'https://via.placeholder.com/300')" class="modal-img">

        <div class="modal-info">
          <h3 class="producto-titulo">{{ producto.Producto || (producto as Record<string, unknown>)['Producto '] }}</h3>

          <p class="desc-text">
            {{ (producto as Record<string, unknown>).Descripción || (producto as Record<string, unknown>).Descripcion || (producto as Record<string, unknown>).Detalle || 'Sin descripción técnica registrada en la base de datos.' }}
          </p>

          <div class="specs-grid">
            <div class="spec-item">
              <strong>Categoría:</strong> <span>{{ producto.Categoria || 'N/A' }}</span>
            </div>
            <div class="spec-item">
              <strong>SKU / ID:</strong> <span>{{ producto.id || producto.ID || 'N/A' }}</span>
            </div>

            <div class="spec-item" v-for="spec in especificacionesTecnicas" :key="spec.etiqueta">
              <strong>{{ spec.etiqueta }}:</strong> <span>{{ spec.valor }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-primary" @click="añadirAlCarrito">AÑADIR AL CARRITO DE COTIZACIÓN</button>

            <button class="btn-refacciones" @click="irARefacciones">
              ⚙️ VER KITS Y REFACCIONES (VISTA EXPLOSIONADA)
            </button>

            <button class="btn-secondary" @click="marketStore.closeModal">CERRAR FICHA TÉCNICA</button>
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

// LÓGICA DINÁMICA PARA EXTRAER TODOS LOS DATOS
const especificacionesTecnicas = computed(() => {
  if (!producto.value) return []

  const camposIgnorados = [
    'ID', 'id', 'Producto', 'Producto ', 'Descripción', 'Descripcion', 'Detalle',
    'Imagen_URL', 'Imagen URL', 'imagen', 'Precio', 'Categoria',
    'Kits', 'kits', 'Imagen_Explosionada_URL', 'imagen_explosionada',
    'Manual_URL', 'Plano_URL'
  ]

  const specs = []

  for (const [key, value] of Object.entries(producto.value)) {
    if (!camposIgnorados.includes(key) && value !== '' && value !== null && value !== undefined) {
      let etiquetaFormateada = key.replace(/_/g, ' ')
      etiquetaFormateada = etiquetaFormateada.charAt(0).toUpperCase() + etiquetaFormateada.slice(1)
      specs.push({ etiqueta: etiquetaFormateada, valor: value })
    }
  }

  return specs
})

const añadirAlCarrito = () => {
  if (producto.value) {
    const prodStrict = producto.value as Record<string, unknown>
    const id = prodStrict.id || prodStrict.ID || prodStrict.Producto || prodStrict['Producto ']
    cartStore.agregarProducto(String(id))
    alert('Producto añadido al carrito de cotización')
    marketStore.closeModal()
  }
}

const irARefacciones = () => {
  if (producto.value) {
    const prodStrict = producto.value as Record<string, unknown>
    const id = prodStrict.id || prodStrict.ID || prodStrict.Producto || prodStrict['Producto ']
    marketStore.closeModal()
    router.push(`/refacciones/${id}`)
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
.modal-content { background: var(--bg-panel); width: 100%; max-width: 850px; border-radius: 12px; border: 1px solid var(--border); overflow: hidden; color: var(--text-main); box-shadow: 0 20px 50px rgba(0,0,0,0.6); max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-input); }
.close-btn { font-size: 24px; cursor: pointer; color: var(--text-muted); transition: 0.2s; }
.close-btn:hover { color: var(--accent); }
.modal-body { display: flex; flex-wrap: wrap; padding: 25px; gap: 25px; }
.modal-img { flex: 1; min-width: 280px; max-width: 350px; height: auto; max-height: 350px; object-fit: contain; background: white; border-radius: 8px; padding: 10px; border: 1px solid var(--border); align-self: flex-start; }
.modal-info { flex: 1.5; min-width: 300px; display: flex; flex-direction: column; gap: 15px; }
.producto-titulo { font-size: 24px; font-weight: 800; margin: 0; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; }
.desc-text { color: var(--text-muted); font-size: 14px; line-height: 1.6; margin: 0; background: var(--bg-input); padding: 12px; border-radius: 6px; border: 1px solid var(--border); }

/* Cuadrícula para muchas especificaciones */
.specs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; background: var(--bg-input); padding: 15px; border-radius: 6px; border: 1px solid var(--border); max-height: 250px; overflow-y: auto; }
.spec-item { font-size: 13px; line-height: 1.4; border-bottom: 1px dashed var(--border); padding-bottom: 5px;}
.spec-item:last-child { border-bottom: none; }
.spec-item strong { color: var(--text-muted); display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 2px;}

.modal-actions { margin-top: 15px; display: flex; flex-direction: column; gap: 10px; }
.btn-primary { background: var(--accent); color: white; border: none; padding: 14px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 13px; letter-spacing: 0.5px; }
.btn-primary:hover { background: var(--accent-hover); box-shadow: 0 4px 12px rgba(255,0,0,0.3); }
.btn-secondary { background: var(--bg-input); color: var(--text-main); border: 1px solid var(--border); padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 13px; }
.btn-secondary:hover { background: var(--border); }
.btn-refacciones { background: #e0a800; color: #000; border: none; padding: 14px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 13px; letter-spacing: 0.5px; }
.btn-refacciones:hover { background: #c69500; box-shadow: 0 4px 12px rgba(224,168,0,0.3); }
</style>
