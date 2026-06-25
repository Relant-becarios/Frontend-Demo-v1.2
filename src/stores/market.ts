import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Producto } from '@/api/inventory'

export const useMarketStore = defineStore('market', () => {
  const searchQuery = ref('')
  const selectedCategory = ref('Todas')
  const availableCategories = ref<string[]>([])

  const isModalOpen = ref(false)
  const selectedProduct = ref<Producto | null>(null)

  // Esta función cargará las categorías al inicio
  function setCategories(cats: string[]) {
    availableCategories.value = cats
  }

  function openModal(producto: Producto) {
    selectedProduct.value = producto
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
    setTimeout(() => {
      selectedProduct.value = null
    }, 300)
  }

  return {
    searchQuery,
    selectedCategory,
    availableCategories,
    isModalOpen,
    selectedProduct,
    setCategories,
    openModal,
    closeModal,
  }
})
