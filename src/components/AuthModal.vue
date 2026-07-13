<template>
  <div v-if="uiStore.isAuthModalOpen" class="modal-wrapper">
    <div class="modal-backdrop" @click="uiStore.closeAll"></div>

    <div class="auth-content">
      <div class="auth-header">
        <h2 class="auth-title">{{ esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión' }}</h2>
        <span @click="uiStore.closeAll" class="close-icon">✕</span>
      </div>

      <form @submit.prevent="procesarFormulario" class="auth-form">
        <div class="input-group">
          <label>Correo Electrónico</label>
          <input type="email" v-model="email" required placeholder="tu@correo.com" />
        </div>
        <div class="input-group">
          <label>Contraseña</label>
          <input type="password" v-model="password" required placeholder="••••••••" minlength="6" />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-auth" :disabled="procesando">
          {{ procesando ? 'Procesando...' : esRegistro ? 'REGISTRARSE' : 'INGRESAR' }}
        </button>
      </form>

      <div class="auth-toggle">
        <span v-if="!esRegistro"
          >¿No tienes cuenta? <a @click="esRegistro = true">Regístrate aquí</a></span
        >
        <span v-else>¿Ya tienes cuenta? <a @click="esRegistro = false">Inicia sesión</a></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const uiStore = useUiStore()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const esRegistro = ref(false)
const procesando = ref(false)
const errorMsg = ref('')

const procesarFormulario = async () => {
  procesando.value = true
  errorMsg.value = ''
  try {
    if (esRegistro.value) {
      await authStore.registrarse(email.value, password.value)
    } else {
      await authStore.iniciarSesion(email.value, password.value)
    }
    uiStore.closeAll()
    email.value = ''
    password.value = ''
  } catch (error: unknown) {
    console.error(error)
    errorMsg.value = 'Error: Verifica tus credenciales (mínimo 6 caracteres).'
  } finally {
    procesando.value = false
  }
}
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 25000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1;
}
.auth-content {
  position: relative;
  z-index: 2;
  background: var(--bg-panel);
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid var(--border);
  color: var(--text-main);
  box-sizing: border-box;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
}
.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.auth-title {
  color: var(--accent);
  margin: 0;
}
.close-icon {
  cursor: pointer;
  font-size: 20px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.input-group label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 5px;
  display: block;
}
.input-group input {
  width: 100%;
  padding: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-main);
  outline: none;
  box-sizing: border-box;
}
.btn-auth {
  background: var(--accent);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 10px;
}
.btn-auth:hover:not(:disabled) {
  background: var(--accent-hover);
}
.btn-auth:disabled {
  background: var(--border);
  color: var(--text-muted);
  cursor: not-allowed;
}
.error-msg {
  color: #ff4444;
  font-size: 13px;
  text-align: center;
}
.auth-toggle {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}
.auth-toggle a {
  color: var(--accent);
  cursor: pointer;
  text-decoration: underline;
}
</style>
