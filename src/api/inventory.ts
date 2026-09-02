import Papa from 'papaparse'

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
  Stock?: number
  Imagen_Explosionada_URL?: string
  imagen_explosionada?: string
  Kits?: Kit[]
  kits?: Kit[]
  [key: string]: unknown
}

// 👈 PEGA AQUÍ EL ENLACE QUE COPIASTE EN GOOGLE SHEETS
const GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQd1bWy-8FYDU0CLVSQJ9YqVTtj2edrgbvvVfaeATeb3wHwT7NhBvLSzV_YZ3UM5yZqLzFmqB7HKnnF/pub?output=csv'

export const fetchProductos = async (query = '', categoria = 'Todas'): Promise<Producto[]> => {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL)
    if (!response.ok) throw new Error('No se pudo descargar el archivo de Google Sheets')

    const csvText = await response.text()

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          let productosLimpios: Producto[] = (results.data as Record<string, string>[]).map((item) => {
            const idVal = item.ID || item.id || item.Codigo || ''
            const nombreVal = item.Producto || item.Nombre || item.descripcion || 'Sin nombre'
            const precioVal = parseFloat(String(item.Precio || item.precio || 0)) || 0

            return {
              id: String(idVal),
              ID: String(idVal),
              Producto: nombreVal,
              Precio: precioVal,
              Categoria: item.Categoria || item.categoria || 'General',
              Imagen_URL:
                item.Imagen_URL ||
                item.imagen ||
                `https://via.placeholder.com/150/ffffff/000000?text=${encodeURIComponent(nombreVal)}`,
              Stock: parseInt(String(item.Stock || item.stock || 0)) || 0,
              ...item,
            }
          })

          // Filtrado por categoría
          if (categoria !== 'Todas') {
            productosLimpios = productosLimpios.filter((p: Producto) => p.Categoria === categoria)
          }

          // Filtrado por búsqueda en tiempo real
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
                String(p.Categoria || '')
                  .toLowerCase()
                  .includes(busqueda),
            )
          }

          resolve(productosLimpios)
        },
      })
    })
  } catch (error) {
    console.error('Error al cargar catálogo desde Google Sheets:', error)
    return []
  }
}

export const procesarOrdenDeCompra = async (carritoPayload: { id: string; cantidad: number }[]) => {
  const productosBaseDeDatos = await fetchProductos()
  let totalCalculado = 0

  carritoPayload.forEach((itemCarrito) => {
    const productoDb = productosBaseDeDatos.find(
      (p) => String(p.id || p.ID) === itemCarrito.id || p.Producto === itemCarrito.id,
    )

    if (productoDb && productoDb.Precio) {
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
          totalCalculadoEnBackend: totalCalculado,
        }),
      1500,
    )
  })
}
