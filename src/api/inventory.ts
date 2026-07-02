// Definición de las interfaces para que TypeScript reconozca la estructura de refacciones
export interface Pieza {
  id_refaccion?: string
  nombre_refaccion?: string
  nombre?: string
  sku: string
  stock?: number
  imagen_url?: string
  img?: string
}

export interface Kit {
  id?: string | number
  nombre_kit?: string
  nombre?: string
  refacciones?: Pieza[]
  piezas?: Pieza[]
}

export interface Producto {
  id?: string
  ID?: string
  Producto: string
  Precio: number | string
  Categoria?: string
  Imagen_URL?: string
  imagen?: string
  // NUEVOS CAMPOS: Dejamos la puerta abierta en el molde para recibir planos desde la Base de Datos
  Imagen_Explosionada_URL?: string
  imagen_explosionada?: string
  Kits?: Kit[]
  kits?: Kit[]
  [key: string]: unknown
}

interface ProductoBackend {
  codigo?: string
  descripcion?: string
  ubicacion?: string
  skuAlterno?: string
  cantidad?: number
  minStock?: number
  [key: string]: unknown
}

// Función auxiliar para obtener el JWT del usuario autenticado actual
const obtenerTokenJWT = async (): Promise<string | null> => {
  console.log('Generando JWT simulado para enviar a Spring Boot...')
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SIMULADO'
}

export const fetchProductos = async (query = '', categoria = 'Todas'): Promise<Producto[]> => {
  try {
    const url = 'https://demo-3u7k.onrender.com/api/v1/products'
    const response = await fetch(url)

    if (!response.ok) throw new Error('Error de red al obtener productos')

    const data: ProductoBackend[] = await response.json()

    // Mapeamos los campos del backend (Material) al modelo del frontend (Producto)
    let productosLimpios: Producto[] = data.map((item: ProductoBackend) => ({
      id: item.codigo,
      Producto: item.descripcion || '',
      Precio: 0.0,
      Categoria: item.ubicacion || 'General',
      Imagen_URL:
        'https://via.placeholder.com/150/ffffff/000000?text=' +
        encodeURIComponent(item.skuAlterno || item.codigo || ''),
      sku: item.skuAlterno || item.codigo,
      cantidad: item.cantidad,
      minStock: item.minStock,
      ...item,
    }))

    if (categoria !== 'Todas') {
      productosLimpios = productosLimpios.filter((p: Producto) => p.Categoria === categoria)
    }
    if (query.trim() !== '') {
      const busqueda = query.toLowerCase().trim()
      productosLimpios = productosLimpios.filter(
        (p: Producto) =>
          String(p.Producto || '')
            .toLowerCase()
            .includes(busqueda) ||
          String(p.id || '')
            .toLowerCase()
            .includes(busqueda) ||
          String(p.sku || '')
            .toLowerCase()
            .includes(busqueda),
      )
    }
    return productosLimpios
  } catch (error) {
    console.error('Error en fetchProductos:', error)
    return []
  }
}

export const procesarOrdenDeCompra = async (carritoPayload: { id: string; cantidad: number }[]) => {
  const token = await obtenerTokenJWT()
  console.log('Enviando petición a Spring Boot con JWT y este Payload:', token, carritoPayload)

  // --- ARREGLO: CÁLCULO DINÁMICO DEL TOTAL ---
  // Obtenemos la lista de productos real para buscar sus costos
  const productosBaseDeDatos = await fetchProductos()
  let totalCalculado = 0

  carritoPayload.forEach((itemCarrito) => {
    // Buscamos el producto en la lista por su ID o Nombre para extraer su precio real
    const productoDb = productosBaseDeDatos.find(
      (p) => String(p.id || p.ID) === itemCarrito.id || p.Producto === itemCarrito.id,
    )

    if (productoDb && productoDb.Precio) {
      // Limpiamos y convertimos el precio a número por si viene como texto
      const precioNumerico = parseFloat(String(productoDb.Precio)) || 0
      totalCalculado += precioNumerico * itemCarrito.cantidad
    }
  })

  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          success: true,
          mensaje: 'Orden procesada y cotización enviada correctamente.',
          totalCalculadoEnBackend: totalCalculado, // Enviamos la suma matemática real
        }),
      1500,
    )
  })
}
