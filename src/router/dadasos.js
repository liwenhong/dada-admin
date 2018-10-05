/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/views/layout/Layout'

const dadaRouter = [
  {
    path: '/order',
    component: Layout,
    redirect: '/dadasos/order',
    name: 'Order',
    meta: {
      title: 'order',
      icon: 'order'
    },
    children: [
      {
        path: 'order-manage',
        component: () => import('@/views/dadasos/order'),
        name: 'OrderManage',
        meta: { title: 'OrderManage', icon: 'list' }
      }
    ]
  },
  {
    path: '/car-manage',
    component: Layout,
    redirect: 'noredirect',
    name: 'car-manager',
    meta: {
      title: 'car-manager',
      icon: 'car-manager'
    },
    children: [
      {
        path: 'car-manage',
        component: () => import('@/views/dadasos/car-manager'),
        name: 'CarManage',
        meta: { title: 'CarManage', icon: 'nested' }
      }
    ]
  }
]

export default dadaRouter
