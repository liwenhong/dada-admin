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
  }
]

export default dadaRouter
