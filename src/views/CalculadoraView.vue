<template>
  <div class="industrial-calc-section">
    <h2 class="calc-title">CALCULADORA DE DOSIFICACIÓN</h2>

    <div class="calc-grid">
      <div class="input-card">
        <label class="input-label">TAMAÑO GOTA</label>
        <input type="number" v-model.number="gota" class="calc-input" />
      </div>

      <div class="input-card">
        <label class="input-label">GRAMAJE</label>
        <input type="number" v-model.number="gramaje" class="calc-input" />
      </div>

      <div class="input-card">
        <label class="input-label">TIEMPO CICLO (S)</label>
        <input type="number" v-model.number="tiempo" class="calc-input" />
      </div>
    </div>

    <h1 class="result-title">
      RESULTADO: <span class="result-value">{{ resultado.toFixed(4) }}</span>
    </h1>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Variables reactivas (arrancan en 0)
const gota = ref<number>(0)
const gramaje = ref<number>(0)
const tiempo = ref<number>(0)

// Computed property que hace el cálculo matematico de forma automática
const resultado = computed(() => {
  if (tiempo.value !== 0) {
    return (gota.value * gramaje.value) / tiempo.value
  }
  return 0
})
</script>

<style scoped>
.industrial-calc-section {
  background: #161b22;
  color: #ffffff;
  padding: 50px 5%;
  text-align: center;
  border-top: 2px solid #ff0000;
  /* Ajustamos la altura para que abarque toda la pantalla menos el Navbar */
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.calc-title {
  letter-spacing: 2px;
  color: #ff0000;
  margin-bottom: 40px;
}

.calc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.input-card {
  background: #0d1117;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #30363d;
}

.input-label {
  display: block;
  color: #ff0000;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 10px;
}

.calc-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #30363d;
  color: white;
  text-align: center;
  font-size: 24px;
  outline: none;
  padding: 5px;
}

.calc-input::-webkit-outer-spin-button,
.calc-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.result-title {
  font-size: 40px;
  margin-top: 50px;
}

.result-value {
  color: #ff0000;
}
</style>
