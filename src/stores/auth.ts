import { defineStore } from 'pinia'
import { ref as vueRef } from 'vue'
import { auth } from '@/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

export interface UsuarioConRol extends User {
  rol?: string
}

export const useAuthStore = defineStore('auth', () => {
  const usuarioActual = vueRef<UsuarioConRol | null>(null)
  const cargando = vueRef(true)

  onAuthStateChanged(auth, (user) => {
    if (user) {
      let rolAsignado = 'CLIENTE' // Por defecto, todos son clientes

      // 👇 EL TRUCO: Si el correo es el tuyo, te damos poder absoluto
      if (user.email === 'relantbecario@relant.com.mx') {
        rolAsignado = 'ADMIN'
      }
      // Si tienes otro correo de jefe, puedes agregarlo así:
      // else if (user.email === 'siza@relant.com.mx') { rolAsignado = 'ADMIN' }

      usuarioActual.value = {
        ...user,
        rol: rolAsignado,
      } as UsuarioConRol
    } else {
      usuarioActual.value = null
    }
    cargando.value = false
  })

  const iniciarSesion = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass)
  }

  const registrarse = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass)
  }

  const cerrarSesion = async () => {
    await signOut(auth)
  }

  return { usuarioActual, cargando, iniciarSesion, registrarse, cerrarSesion }
})
