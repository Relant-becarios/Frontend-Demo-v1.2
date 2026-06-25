import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isCartOpen = ref(false)
  const isMenuOpen = ref(false)
  const isAuthModalOpen = ref(false)
  const isChatOpen = ref(false) // NUEVO

  function toggleCart() {
    isCartOpen.value = !isCartOpen.value
    if (isCartOpen.value) {
      isMenuOpen.value = false
      isAuthModalOpen.value = false
      isChatOpen.value = false
    }
  }

  function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
    if (isMenuOpen.value) {
      isCartOpen.value = false
      isAuthModalOpen.value = false
      isChatOpen.value = false
    }
  }

  function toggleAuthModal() {
    isAuthModalOpen.value = !isAuthModalOpen.value
    if (isAuthModalOpen.value) {
      isCartOpen.value = false
      isMenuOpen.value = false
      isChatOpen.value = false
    }
  }

  function toggleChat() {
    isChatOpen.value = !isChatOpen.value
    if (isChatOpen.value) {
      isCartOpen.value = false
      isMenuOpen.value = false
      isAuthModalOpen.value = false
    }
  }

  function closeAll() {
    isCartOpen.value = false
    isMenuOpen.value = false
    isAuthModalOpen.value = false
    isChatOpen.value = false
  }

  return {
    isCartOpen,
    isMenuOpen,
    isAuthModalOpen,
    isChatOpen,
    toggleCart,
    toggleMenu,
    toggleAuthModal,
    toggleChat,
    closeAll,
  }
})
