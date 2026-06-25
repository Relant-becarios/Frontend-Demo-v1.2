import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '@/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const usuarioActual = ref<User | null>(null)
  const cargando = ref(true)

  // Escuchamos automáticamente si el usuario ya había iniciado sesión antes
  onAuthStateChanged(auth, (user) => {
    usuarioActual.value = user
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
