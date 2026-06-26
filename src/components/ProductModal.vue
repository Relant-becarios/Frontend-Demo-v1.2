<template>
  <div v-if="marketStore.isModalOpen" class="modal-overlay" @click.self="marketStore.closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 style="color: var(--accent); margin: 0; letter-spacing: 1px">
          FICHA TÉCNICA INDUSTRIAL
        </h2>
        <span @click="marketStore.closeModal" class="close-btn">✕</span>
      </div>

      <div class="modal-body" v-if="producto">
        <img
          :src="producto.Imagen_URL || producto.imagen || 'https://via.placeholder.com/300'"
          class="modal-img"
        />

        <div class="modal-info">
          <h3 class="producto-titulo">{{ producto.Producto || (producto as any)['Producto '] }}</h3>

          <p class="desc-text">
            {{
              (producto as any).Detalle || 'Sin descripción técnica registrada en la base de datos.'
            }}
          </p>

          <div class="specs-grid">
            <div class="spec-item">
              <strong>Categoría:</strong> <span>{{ producto.Categoria || 'N/A' }}</span>
            </div>
            <div class="spec-item">
              <strong>SKU / ID:</strong> <span>{{ producto.id || producto.ID || 'N/A' }}</span>
            </div>
            <div class="spec-item" v-if="(producto as any).Especial">
              <strong>Especificación:</strong> <span>{{ (producto as any).Especial }}</span>
            </div>
          </div>

          <div
            class="documentacion-section"
            v-if="(producto as any).Manual_URL || (producto as any).Plano_URL"
          >
            <h4>📄 Documentos Disponibles:</h4>
            <div class="docs-links">
              <a
                v-if="(producto as any).Manual_URL"
                :href="(producto as any).Manual_URL"
                target="_blank"
                class="doc-link btn-manual"
              >
                📘 Descargar Manual de Operación
              </a>
              <a
                v-if="(producto as any).Plano_URL"
                :href="(producto as any).Plano_URL"
                target="_blank"
                class="doc-link btn-plano"
              >
                📐 Ver Plano Técnico / Layout
              </a>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-primary" @click="añadirAlCarrito">
              AÑADIR AL CARRITO DE COTIZACIÓN
            </button>

            <button class="btn-refacciones" @click="irARefacciones">
              ⚙️ VER KITS Y REFACCIONES (VISTA EXPLOSIONADA)
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

const getProductId = (): string | number | undefined => {
  if (!producto.value) return undefined
  const product = producto.value as {
    [key: string]: string | number | undefined
  }
  return product.id ?? product.ID ?? product.Producto ?? product['Producto ']
}

const añadirAlCarrito = () => {
  const id = getProductId()
  if (id != null) {
    cartStore.agregarProducto(String(id))
    alert('Producto añadido al carrito de cotización')
    marketStore.closeModal()
  }
}

const irARefacciones = () => {
  const id = getProductId()
  if (id != null) {
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
  padding: 20px;
  box-sizing: border-box;
}
.modal-content {
  background: var(--bg-panel);
  width: 100%;
  max-width: 850px;
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow: hidden;
  color: var(--text-main);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  max-height: 90vh;
  overflow-y: auto;
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
  padding: 25px;
  gap: 25px;
}
.modal-img {
  flex: 1;
  min-width: 280px;
  max-width: 350px;
  height: auto;
  max-height: 350px;
  object-fit: contain;
  background: white;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid var(--border);
  align-self: flex-start;
}
.modal-info {
  flex: 1.5;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.producto-titulo {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.desc-text {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  background: var(--bg-input);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
}

/* Grid de especificaciones */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  background: var(--bg-input);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
}
.spec-item {
  font-size: 13px;
}
.spec-item strong {
  color: var(--text-muted);
}

/* Sección de Descarga de Documentos */
.documentacion-section {
  border-top: 1px dashed var(--border);
  padding-top: 15px;
  margin-top: 5px;
}
.documentacion-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: var(--text-main);
}
.docs-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.doc-link {
  display: block;
  padding: 10px 15px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 13px;
  font-weight: bold;
  transition: 0.2s;
  text-align: center;
  border: 1px solid var(--border);
}
.btn-manual {
  background: rgba(0, 123, 255, 0.1);
  color: #38bdf8;
  border-color: rgba(0, 123, 255, 0.3);
}
.btn-manual:hover {
  background: #007bff;
  color: white;
}
.btn-plano {
  background: rgba(46, 164, 79, 0.1);
  color: #4ade80;
  border-color: rgba(46, 164, 79, 0.3);
}
.btn-plano:hover {
  background: #2ea44f;
  color: white;
}

/* Botones de acción */
.modal-actions {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  font-size: 13px;
  letter-spacing: 0.5px;
}
.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
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
  font-size: 13px;
}
.btn-secondary:hover {
  background: var(--border);
}
.btn-refacciones {
  background: #e0a800;
  color: #000;
  border: none;
  padding: 14px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  font-size: 13px;
  letter-spacing: 0.5px;
}
.btn-refacciones:hover {
  background: #c69500;
  box-shadow: 0 4px 12px rgba(224, 168, 0, 0.3);
}
</style>
