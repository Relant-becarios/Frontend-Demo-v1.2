<template>
  <div :class="['chat-panel', { open: uiStore.isChatOpen }]">
    <div class="chat-header">
      <h3 style="margin: 0; color: #ff0000">✨ Relant Assistant</h3>
      <span @click="uiStore.closeAll" style="cursor: pointer; font-size: 20px">✕</span>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['msg', msg.sender === 'user' ? 'msg-user' : 'msg-bot']"
      >
        {{ msg.text }}
      </div>
    </div>

    <div class="chat-input-area">
      <div class="input-wrapper">
        <input
          type="text"
          v-model="newMessage"
          placeholder="Escribe un mensaje..."
          @keypress.enter="enviarMensaje"
        />
        <div class="send-btn" @click="enviarMensaje">➤</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
const messagesContainer = ref<HTMLElement | null>(null)
const newMessage = ref('')

// Historial inicial simulado
const messages = ref<{ text: string; sender: 'user' | 'bot' }[]>([
  {
    text: '¡Hola! Soy el asistente virtual de Relant. ¿En qué puedo ayudarte a dosificar hoy?',
    sender: 'bot',
  },
])

const enviarMensaje = async () => {
  if (!newMessage.value.trim()) return

  // Agrega el mensaje del usuario
  messages.value.push({ text: newMessage.value, sender: 'user' })
  const pregunta = newMessage.value
  newMessage.value = ''

  await scrollBottom()

  // Simula el "pensamiento" de la IA
  setTimeout(async () => {
    messages.value.push({
      text: `Entendido. En este momento solo soy una simulación en el frontend. Próximamente podré ayudarte con "${pregunta}".`,
      sender: 'bot',
    })
    await scrollBottom()
  }, 1000)
}

const scrollBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.chat-panel {
  position: fixed;
  top: 0;
  right: -420px;
  width: 400px;
  height: 100vh;
  background: var(--bg-panel);
  z-index: 9500;
  transition: right 0.4s ease;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #30363d;
  color: white;
}
.chat-panel.open {
  right: 0;
}
.chat-header {
  padding: 20px;
  background: var(--bg-input);
  border-bottom: 1px solid #30363d;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.msg {
  max-width: 85%;
  padding: 12px 15px;
  border-radius: 15px;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 10px;
}
.msg-user {
  align-self: flex-end;
  background: #ff0000;
  color: white;
}
.msg-bot {
  align-self: flex-start;
  background: #30363d;
  color: #ffffff;
}
.chat-input-area {
  padding: 15px;
  border-top: 1px solid #30363d;
}
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0f1215;
  padding: 10px;
  border-radius: 25px;
  border: 1px solid #30363d;
}
.input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  outline: none;
  padding-left: 10px;
}
.send-btn {
  color: #ff0000;
  cursor: pointer;
  font-size: 18px;
  padding-right: 5px;
}
</style>
