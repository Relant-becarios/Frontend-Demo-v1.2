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
  Imagen_Front_URL?: string
  Imagen_Back_URL?: string
  Imagen_Explosionada_URL?: string
  imagen?: string
  Stock?: number
  Kits?: Kit[]
  kits?: Kit[]
  [key: string]: unknown
}

const TASAS_USD: Record<string, number> = {
  MXN: 0.05,
  MXP: 0.05,
  EUR: 1.1,
  USD: 1.0,
}

export const convertirADolares = (valor: unknown): number => {
  if (valor === undefined || valor === null) return 0
  if (typeof valor === 'number') return valor

  const texto = String(valor).toUpperCase().trim()
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

            // Detección flexible de fotos
            const imgFront = obtenerCampo(item, [
              'Imagen_Front_URL',
              'Photo_front_url',
              'Photo_front',
              'Imagen_Front',
            ])
            const imgBack = obtenerCampo(item, [
              'Imagen_Back_URL',
              'Photo_back_url',
              'Photo_back',
              'Imagen_Back',
            ])
            const imgExplosionada = obtenerCampo(item, [
              'Imagen_Explosionada_URL',
              'imagen_explosionada',
              'Diagrama',
            ])
            const imagenVal =
              obtenerCampo(item, ['Imagen_URL', 'imagen', 'Imagen']) || imgFront || imgBack

            const categoriaVal = obtenerCampo(item, ['Categoria', 'categoria']) || 'General'
            const stockVal = obtenerCampo(item, ['Stock', 'stock'])
            const precioUSD = convertirADolares(precioBruto)

            return {
              ...item,
              id: idVal,
              ID: idVal,
              Producto: nombreVal,
              Precio: precioUSD,
              Categoria: categoriaVal,
              Imagen_URL:
                imagenVal ||
                `https://via.placeholder.com/150?text=${encodeURIComponent(nombreVal)}`,
              Imagen_Front_URL: imgFront || imagenVal,
              Imagen_Back_URL: imgBack,
              Imagen_Explosionada_URL: imgExplosionada,
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
