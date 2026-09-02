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
  Precio: number
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

// Tasas de cambio fijas a Dólares (USD)
const TASAS_USD: Record<string, number> = {
  MXN: 0.05, // 1 MXN = 0.05 USD (ej. 8,232.84 MXN ≈ $411.64 USD)
  MXP: 0.05,
  EUR: 1.1, // 1 EUR = 1.10 USD
  USD: 1.0,
}

// Elimina comas y letras, detecta divisa y convierte estrictamente a USD
export const convertirADolares = (valor: unknown): number => {
  if (valor === undefined || valor === null) return 0
  if (typeof valor === 'number') return valor

  const texto = String(valor).toUpperCase().trim()

  // Elimina comas de miles y cualquier carácter que no sea número o punto decimal
  const textoSinComas = texto.replace(/,/g, '')
  const montoNumerico = parseFloat(textoSinComas.replace(/[^0-9.]/g, '')) || 0

  if (texto.includes('EUR') || texto.includes('€')) {
    return Number((montoNumerico * (TASAS_USD.EUR ?? 0)).toFixed(2))
  }
  if (texto.includes('MXN') || texto.includes('MXP')) {
    return Number((montoNumerico * (TASAS_USD.MXN ?? 0)).toFixed(2))
  }

  return Number(montoNumerico.toFixed(2))
}

const obtenerCampo = (item: Record<string, string>, posiblesNombres: string[]): string => {
  const claveEncontrada = Object.keys(item).find((key) =>
    posiblesNombres.map((n) => n.toLowerCase()).includes(key.trim().toLowerCase()),
  )
  return claveEncontrada && item[claveEncontrada] ? String(item[claveEncontrada]).trim() : ''
}

const GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQd1bWy-8FYDU0CLVSQJ9YqVTtj2edrgbvvVfaeATeb3wHwT7NhBvLSzV_YZ3UM5yZqLzFmqB7HKnnF/pub?output=csv'

export const fetchProductos = async (query = '', categoria = 'Todas'): Promise<Producto[]> => {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL)
    if (!response.ok) throw new Error('No se pudo descargar el archivo de Google Sheets')

    const csvText = await response.text()

    return new Promise((resolve) => {
      Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          let productosLimpios: Producto[] = results.data.map((item) => {
            const idVal = obtenerCampo(item, ['Codigo/ID', 'ID', 'id', 'Codigo', 'sku'])
            const nombreVal =
              obtenerCampo(item, ['Descripcion', 'Producto', 'Nombre', 'descripcion']) ||
              'Sin nombre'
            const precioBruto = obtenerCampo(item, ['Precio', 'precio', 'Costo'])
            const imagenVal = obtenerCampo(item, ['Imagen_URL', 'imagen', 'Imagen'])
            const categoriaVal = obtenerCampo(item, ['Categoria', 'categoria']) || 'General'
            const stockVal = obtenerCampo(item, ['Stock', 'stock'])

            const precioUSD = convertirADolares(precioBruto)

            return {
              ...item, // Colocado primero para no sobrescribir los valores procesados
              id: idVal,
              ID: idVal,
              Producto: nombreVal,
              Precio: precioUSD, // Asigna el número limpio e inmune a errores de parseo
              Categoria: categoriaVal,
              Imagen_URL:
                imagenVal ||
                `https://via.placeholder.com/150/ffffff/000000?text=${encodeURIComponent(nombreVal)}`,
              Stock: parseInt(stockVal) || 0,
            }
          })

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
      totalCalculado += productoDb.Precio * itemCarrito.cantidad
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
