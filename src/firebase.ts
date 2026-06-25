import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBWI5Gt4rpzbC9ROFJl99ivCjlhecRaYYg',
  authDomain: 'relantmarketplace.firebaseapp.com',
  databaseURL: 'https://relantmarketplace-default-rtdb.firebaseio.com',
  projectId: 'relantmarketplace',
  storageBucket: 'relantmarketplace.firebasestorage.app',
  messagingSenderId: '331114840284',
  appId: '1:331114840284:web:9a33b20d0185722ec97419',
  measurementId: 'G-56GYWVH01H',
}

// Inicializamos Firebase
export const app = initializeApp(firebaseConfig)

// Exportamos el servicio de Autenticación para usarlo en el resto de tu app
export const auth = getAuth(app)
