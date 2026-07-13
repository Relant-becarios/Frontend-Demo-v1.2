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
import { ref as dbRef, set, get } from 'firebase/database'
import { getDatabase } from 'firebase/database'

const db = getDatabase()

export interface UsuarioConRol extends User {
  rol?: string
}

export const useAuthStore = defineStore('auth', () => {
  const usuarioActual = vueRef<UsuarioConRol | null>(null)
  const cargando = vueRef(true)

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const referenciaUsuario = dbRef(db, `usuarios/${user.uid}`)
      const snapshot = await get(referenciaUsuario)

      let rolAsignado = 'basico'

      if (snapshot.exists()) {
        rolAsignado = snapshot.val().rol
      }

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
    const credenciales = await createUserWithEmailAndPassword(auth, email, pass)
    const nuevoUsuario = credenciales.user

    await set(dbRef(db, `usuarios/${nuevoUsuario.uid}`), {
      email: nuevoUsuario.email,
      rol: 'basico',
      fechaCreacion: new Date().toISOString(),
    })
  }

  const cerrarSesion = async () => {
    await signOut(auth)
  }

  return { usuarioActual, cargando, iniciarSesion, registrarse, cerrarSesion }
})
