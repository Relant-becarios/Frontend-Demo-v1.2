const API_URL = 'https://relantmarketplace-default-rtdb.firebaseio.com'

export interface Producto {
  id?: string
  ID?: string
  Producto: string
  Precio: number | string
  Categoria?: string
  Imagen_URL?: string
  imagen?: string
  [key: string]: unknown
}

// Función auxiliar para obtener el JWT del usuario autenticado actual
const obtenerTokenJWT = async (): Promise<string | null> => {
  console.log('Generando JWT simulado para enviar a Spring Boot...')
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SIMULADO'
}

export const fetchProductos = async (query = '', categoria = 'Todas'): Promise<Producto[]> => {
  try {
    // 1. PETICIÓN TEMPORAL A FIREBASE (Sin Token para evitar el Error 401)
    const response = await fetch(`${API_URL}/productos.json`)

    /*
        // -----------------------------------------------------------------
        // 2. PETICIÓN REAL A SPRING BOOT (Para cuando esté listo el backend)
        // Cuando me pasen el backend, BORRAR el fetch de arriba y DESCOMENTAR esto:
        // -----------------------------------------------------------------
        const url = `http://localhost:8080/api/productos?search=${query}&categoria=${categoria}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        */

    if (!response.ok) throw new Error('Error de red al obtener productos')

    const data = await response.json()
    let productosLimpios = data
      ? (Object.values(data).filter((item) => item !== null && item !== undefined) as Producto[])
      : []

    // --- INICIO DE SIMULACIÓN DE FILTRADO (Se borrará cuando uses Spring Boot) ---
    if (categoria !== 'Todas') {
      productosLimpios = productosLimpios.filter((p) => p.Categoria === categoria)
    }
    if (query.trim() !== '') {
      const busqueda = query.toLowerCase().trim()
      productosLimpios = productosLimpios.filter(
        (p) =>
          String(p.Producto || '')
            .toLowerCase()
            .includes(busqueda) ||
          String(p.id || p.ID || '')
            .toLowerCase()
            .includes(busqueda),
      )
    }
    return productosLimpios
    // --- FIN DE SIMULACIÓN ---
  } catch (error) {
    console.error('Error en fetchProductos:', error)
    return []
  }
}

export const procesarOrdenDeCompra = async (carritoPayload: { id: string; cantidad: number }[]) => {
  const token = await obtenerTokenJWT()
  console.log('Enviando petición a Spring Boot con JWT y este Payload:', token, carritoPayload)

  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          success: true,
          mensaje: 'Orden procesada correctamente.',
          totalCalculadoEnBackend: 256.0,
        }),
      1500,
    )
  })
}
