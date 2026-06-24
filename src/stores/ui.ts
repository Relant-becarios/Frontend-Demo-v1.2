import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isCartOpen = ref(false)
  const isMenuOpen = ref(false)

  function toggleCart() {
    isCartOpen.value = !isCartOpen.value
    if (isCartOpen.value) isMenuOpen.value = false // Cierra el menú si se abre el carrito
  }

  function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
    if (isMenuOpen.value) isCartOpen.value = false // Cierra el carrito si se abre el menú
  }

  function closeAll() {
    isCartOpen.value = false
    isMenuOpen.value = false
  }

  return { isCartOpen, isMenuOpen, toggleCart, toggleMenu, closeAll }
})
