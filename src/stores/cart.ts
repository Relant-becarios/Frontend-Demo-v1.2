import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // El estado ahora solo guarda un arreglo de objetos: { id: string, cant: number }
  const items = ref<{ id: string; cant: number }[]>([])

  // Getter para saber cuántos artículos hay en total (para el globito del NavBar)
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.cant, 0)
  })

  // Acción para agregar al carrito
  function agregarProducto(idProducto: string) {
    const existe = items.value.find((item) => item.id === idProducto)
    if (existe) {
      existe.cant++ // Si ya existe, sumamos 1 a la cantidad
    } else {
      items.value.push({ id: idProducto, cant: 1 }) // Si no, lo agregamos con cantidad 1
    }
    // Opcional: Podrías guardar esto en localStorage aquí mismo si quieres persistencia local
  }

  // Acción para quitar del carrito
  function quitarProducto(idProducto: string) {
    items.value = items.value.filter((item) => item.id !== idProducto)
  }

  // Acción para cambiar cantidad directamente
  function actualizarCantidad(idProducto: string, nuevaCantidad: number) {
    const item = items.value.find((item) => item.id === idProducto)
    if (item && nuevaCantidad > 0) {
      item.cant = nuevaCantidad
    }
  }

  // Acción para vaciar el carrito (después de una compra exitosa)
  function vaciarCarrito() {
    items.value = []
  }

  return { items, totalItems, agregarProducto, quitarProducto, actualizarCantidad, vaciarCarrito }
})
