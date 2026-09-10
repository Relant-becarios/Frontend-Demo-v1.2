import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { db, auth } from '@/firebase'
import { ref as dbRef, set, get } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'

export interface ItemCarrito {
  id: string
  cant: number
}

const STORAGE_KEY = 'relant_cart_items'

// Convierte respuestas de Firebase (Objetos o Arreglos) a un Array JS seguro
const normalizarCarrito = (val: unknown): ItemCarrito[] => {
  if (!val) return []
  if (Array.isArray(val)) {
    return val.filter((item) => item && typeof item === 'object' && item.id)
  }
  if (typeof val === 'object') {
    return Object.values(val as Record<string, ItemCarrito>).filter(
      (item) => item && typeof item === 'object' && item.id,
    )
  }
  return []
}

export const useCartStore = defineStore('cart', () => {
  // 1. Cargar datos desde localStorage inmediatamente al iniciar la app
  const items = ref<ItemCarrito[]>(
    (() => {
      try {
        const guardado = localStorage.getItem(STORAGE_KEY)
        return guardado ? JSON.parse(guardado) : []
      } catch (e) {
        console.error('Error leyendo localStorage:', e)
        return []
      }
    })(),
  )

  const usuarioId = ref<string | null>(null)
  const cargandoSincronizacion = ref<boolean>(false)

  // 2. Reactividad reactiva profunda: guarda en localStorage y Firebase ante cualquier cambio
  watch(
    items,
    async (nuevosItems) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosItems))

      if (usuarioId.value && !cargandoSincronizacion.value) {
        try {
          await set(dbRef(db, `carritos/${usuarioId.value}`), nuevosItems)
        } catch (error) {
          console.error('Error al sincronizar con Firebase:', error)
        }
      }
    },
    { deep: true },
  )

  // 3. Sincronización multinube al iniciar sesión o recargar la página
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      usuarioId.value = user.uid
      cargandoSincronizacion.value = true

      try {
        const snapshot = await get(dbRef(db, `carritos/${user.uid}`))
        const carritoNube = normalizarCarrito(snapshot.val())

        if (carritoNube.length > 0) {
          // Fusiona carrito local con la nube para evitar perder productos agregados sin sesión
          const mapa = new Map<string, number>()

          carritoNube.forEach((item) => mapa.set(item.id, item.cant))

          items.value.forEach((item) => {
            const cantExistente = mapa.get(item.id) || 0
            mapa.set(item.id, Math.max(cantExistente, item.cant))
          })

          items.value = Array.from(mapa.entries()).map(([id, cant]) => ({ id, cant }))
        } else if (items.value.length > 0) {
          await set(dbRef(db, `carritos/${user.uid}`), items.value)
        }
      } catch (error) {
        console.error('Error al sincronizar con la nube:', error)
      } finally {
        cargandoSincronizacion.value = false
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
      }
    } else {
      usuarioId.value = null
    }
  })

  // Getters
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.cant, 0)
  })

  // Acciones
  function agregarProducto(idProducto: string) {
    if (!idProducto || idProducto === 'undefined') return
    const existe = items.value.find((item) => item.id === idProducto)
    if (existe) {
      existe.cant++
    } else {
      items.value.push({ id: idProducto, cant: 1 })
    }
  }

  function quitarProducto(idProducto: string) {
    items.value = items.value.filter((item) => item.id !== idProducto)
  }

  function actualizarCantidad(idProducto: string, nuevaCantidad: number) {
    const item = items.value.find((item) => item.id === idProducto)
    if (item && nuevaCantidad > 0) {
      item.cant = nuevaCantidad
    }
  }

  function vaciarCarrito() {
    items.value = []
  }

  return {
    items,
    totalItems,
    agregarProducto,
    quitarProducto,
    actualizarCantidad,
    vaciarCarrito,
  }
})
