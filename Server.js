import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

app.post('/api/validar-licencia', async (req, res) => {
  const { clave, emailUsuario, nombreUsuario } = req.body

  try {
    // 1. Buscamos la licencia y los usuarios actuales
    const licencia = await prisma.licencia.findUnique({
      where: { clave: clave },
      include: { usuarios: true, maquina: true },
    })

    if (!licencia || !licencia.activa) {
      return res.status(401).json({ error: 'Clave inválida o inactiva.' })
    }

    // 2. Verificamos si este correo YA está vinculado a la máquina
    const yaEstaVinculado = licencia.usuarios.some((u) => u.email === emailUsuario)

    // 3. Si NO está vinculado, es un intento de usuario nuevo
    if (!yaEstaVinculado) {
      // ¡AQUÍ ESTÁ LA MAGIA! Revisamos el límite ANTES de crear nada
      if (licencia.usuarios.length >= licencia.maxUsuarios) {
        return res.status(403).json({
          error: 'Límite de 3 usuarios alcanzado. No tienes autorización para esta máquina.',
        })
      }

      // Como sí hay espacio, AHORA SÍ buscamos o creamos al usuario en la BD
      let usuario = await prisma.user.findUnique({ where: { email: emailUsuario } })
      if (!usuario) {
        usuario = await prisma.user.create({
          data: {
            email: emailUsuario,
            nombre: nombreUsuario,
          },
        })
      }

      // Y lo vinculamos a la licencia
      await prisma.licencia.update({
        where: { id: licencia.id },
        data: { usuarios: { connect: { id: usuario.id } } },
      })
    }

    // 4. Todo perfecto, le damos luz verde
    return res.json({ success: true, maquinaId: licencia.maquinaId })
  } catch (error) {
    console.error('Error en el servidor:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`🚀 API de Máquinas RELANT corriendo en http://localhost:${PORT}`)
})
