import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue } from 'firebase/database'

const firebaseConfig = {
  databaseURL: 'https://relantmarketplace-default-rtdb.firebaseio.com',
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export const conectarFirebase = (callback: (data: unknown) => void) => {
  onValue(ref(db, 'productos'), (snapshot) => {
    callback(snapshot.val() || [])
  })
}
