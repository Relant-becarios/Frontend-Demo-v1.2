import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// 1. OBTENER ESTADO COMPLETO DE LA MÁQUINA (INVENTARIO Y BLOQUEO)
app.get('/api/maquinas/:id', async (req, res) => {
  const { id } = req.params

  try {
    let maquina = await prisma.maquina.findUnique({
      where: { id: id },
      include: { licencia: true, productos: true },
    })

    // SISTEMA AUTO-INICIALIZADOR PARA PRUEBAS: Si la máquina no existe en BD, la creamos con productos base
    if (!maquina) {
      maquina = await prisma.maquina.create({
        data: {
          id: id,
          codigoEquipo: `REQ-${id.slice(0, 5).toUpperCase()}`,
          licencia: {
            create: {
              clave: `LIC-${id.slice(0, 5).toUpperCase()}`,
              activa: true,
            },
          },
          productos: {
            create: [
              { posicion: 'A1', nombre: 'Válvula Dosificadora AX', precio: 150.0, stock: 5 },
              { posicion: 'A2', nombre: 'Kit Sellos Industriales', precio: 45.5, stock: 12 },
              { posicion: 'A3', nombre: 'Pistón de Reemplazo', precio: 85.0, stock: 2 },
              { posicion: 'B1', nombre: 'Sensor Óptico V2', precio: 120.0, stock: 0 },
              { posicion: 'B2', nombre: 'Manguera Teflón (1m)', precio: 15.0, stock: 25 },
              { posicion: 'B3', nombre: 'Boquilla de Precisión', precio: 35.0, stock: 8 },
            ],
          },
        },
        include: { licencia: true, productos: true },
      })
    }

    return res.json(maquina)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al consultar hardware.' })
  }
})

// 2. ACTUALIZACIÓN INSTANTÁNEA DESDE LA CONSOLA DE DUEÑO
app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params
  const { precio, stock } = req.body

  try {
    const prodActualizado = await prisma.producto.update({
      where: { id: id },
      data: {
        precio: parseFloat(precio),
        stock: parseInt(stock),
      },
    })
    return res.json(prodActualizado)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al guardar cambios de hardware.' })
  }
})

// 3. OPERACIONES MASIVAS (RESTOCK FINANCIERO Y COMPONENTES)
app.post('/api/maquinas/:id/operaciones', async (req, res) => {
  const { id } = req.params
  const { accion } = req.body

  try {
    if (accion === 'restock') {
      await prisma.producto.updateMany({
        where: { maquinaId: id, stock: { lt: 10 } },
        data: { stock: 15 },
      })
    } else if (accion === 'reset') {
      await prisma.maquina.update({
        where: { id: id },
        data: { presupuestoUso: 0.0 },
      })
    }

    const maquinaActualizada = await prisma.maquina.findUnique({
      where: { id: id },
      include: { licencia: true, productos: true },
    })
    return res.json(maquinaActualizada)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error operativo masivo.' })
  }
})

// 4. VALIDACIÓN ORIGINAL DE INICIO DE SESIÓN
app.post('/api/validar-licencia', async (req, res) => {
  const { clave, emailUsuario, nombreUsuario } = req.body
  try {
    const licencia = await prisma.licencia.findUnique({
      where: { clave: clave },
      include: { usuarios: true },
    })
    if (!licencia || !licencia.activa) {
      return res.status(401).json({ error: 'Clave inválida o inactiva.' })
    }
    const yaEstaVinculado = licencia.usuarios.some((u) => u.email === emailUsuario)
    if (!yaEstaVinculado) {
      if (licencia.usuarios.length >= licencia.maxUsuarios) {
        return res.status(403).json({ error: 'Límite de usuarios alcanzado.' })
      }
      let usuario = await prisma.user.findUnique({ where: { email: emailUsuario } })
      if (!usuario) {
        usuario = await prisma.user.create({ data: { email: emailUsuario, nombre: nombreUsuario } })
      }
      await prisma.licencia.update({
        where: { id: licencia.id },
        data: { usuarios: { connect: { id: usuario.id } } },
      })
    }
    return res.json({ success: true, maquinaId: licencia.maquinaId })
  } catch (error) {
    console.error(error) // 👈 Corregido aquí: Ahora sí usamos el parámetro 'error'
    return res.status(500).json({ error: 'Error de servidor.' })
  }
})

const PORT = 3000
app.listen(PORT, () => console.log(`🚀 API en puerto ${PORT}`))
