import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// 1. Obtener catálogo completo con filtros de búsqueda y categoría
app.get('/api/products', async (req, res) => {
  try {
    const { search, category } = req.query
    const whereClause = {}

    if (category && category !== 'Todas') {
      whereClause.categoria = String(category)
    }

    if (search) {
      whereClause.OR = [
        { nombre: { contains: String(search), mode: 'insensitive' } },
        { codigo: { contains: String(search), mode: 'insensitive' } },
      ]
    }

    const productos = await prisma.producto.findMany({
      where: whereClause,
      orderBy: { nombre: 'asc' },
    })

    return res.json(productos)
  } catch (error) {
    console.error('Error al consultar productos:', error)
    return res.status(500).json({ error: 'Error interno al consultar el catálogo' })
  }
})

// 2. Transacción de compra atómica (Descuento de stock en PostgreSQL)
app.post('/api/checkout', async (req, res) => {
  const { items } = req.body // Formato esperado: [{ id: 'REL-VAL-HP01', cantidad: 2 }]

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'El carrito está vacío' })
  }

  try {
    // Garantiza que todas las deducciones ocurran o se reviertan totalmente si falta stock
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const idBuscado = String(item.id).trim()

        // Localiza el producto por su ID o por su Código de referencia
        const producto = await tx.producto.findFirst({
          where: {
            OR: [{ id: idBuscado }, { codigo: idBuscado }],
          },
        })

        if (!producto) {
          throw new Error(`Producto no encontrado en inventario: ${item.id}`)
        }

        if (producto.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para "${producto.nombre}". Stock disponible: ${producto.stock}, Unidades solicitadas: ${item.cantidad}`,
          )
        }

        // Deducción atómica directa en la base de datos PostgreSQL
        await tx.producto.update({
          where: { id: producto.id },
          data: {
            stock: {
              decrement: Number(item.cantidad),
            },
          },
        })
      }
    })

    return res.json({
      success: true,
      mensaje: 'Pago procesado exitosamente y stock descontado en PostgreSQL.',
    })
  } catch (error) {
    console.error('Error durante la transacción de compra:', error.message)
    return res.status(400).json({ success: false, error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor de inventario corriendo en el puerto ${PORT}`)
})

export default app
