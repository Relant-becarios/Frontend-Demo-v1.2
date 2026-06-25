<template>
  <div class="card" @click="marketStore.openModal(producto)">
    <img
      :src="producto.Imagen_URL || producto.imagen || 'https://via.placeholder.com/150'"
      :alt="producto.Producto"
    />
    <h3 class="card-title">{{ producto.Producto }}</h3>
    <div class="card-price">${{ formatPrecio(producto.Precio) }} USD</div>

    <button class="btn-add" @click.stop="añadirAlCarrito">AÑADIR</button>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { useMarketStore } from '@/stores/market'
import type { Producto } from '@/api/inventory'

const props = defineProps<{
  producto: Producto
}>()

const cartStore = useCartStore()
const marketStore = useMarketStore()

const formatPrecio = (precio: number | string | undefined) => {
  return parseFloat(String(precio || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })
}

const añadirAlCarrito = () => {
  const idParaCarrito = props.producto.id || props.producto.ID || props.producto.Producto
  cartStore.agregarProducto(idParaCarrito as string)
  alert(`${props.producto.Producto} añadido al carrito`)
}
</script>

<style scoped>
.card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  transition: 0.3s;
  cursor: pointer;
  color: var(--text-main);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(255, 0, 0, 0.2);
}

.card img {
  width: 100%;
  height: 160px;
  object-fit: contain;
  background: white;
  border-radius: 5px;
  margin-bottom: 10px;
}

.card-title {
  font-size: 14px;
  margin: 10px 0;
  height: 35px;
  overflow: hidden;
}

.card-price {
  color: var(--accent);
  font-weight: bold;
  font-size: 18px;
}

.btn-add {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  width: 100%;
  margin-top: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}

.btn-add:hover {
  background: var(--accent-hover);
}
</style>
