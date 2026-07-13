import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StlView from '../views/StlView.vue'
import CalculadoraView from '../views/CalculadoraView.vue'
import MaquinaView from '../views/MaquinaView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/catalogo',
      name: 'catalogo',
      component: () => import('../views/CatalogoView.vue'),
    },
    {
      // NUEVA RUTA DINÁMICA PARA MÚLTIPLES MÁQUINAS
      path: '/maquina/:id',
      name: 'maquina',
      component: MaquinaView,
    },
    {
      path: '/stl',
      name: 'stl',
      component: StlView,
    },
    {
      path: '/calculadora',
      name: 'calculadora',
      component: CalculadoraView,
    },
    {
      path: '/refacciones/:id',
      name: 'refacciones',
      component: () => import('../views/RefaccionesView.vue'),
    },
  ],
})

export default router
