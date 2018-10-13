/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/views/layout/Layout'

const dadaRouter = [
  {
    path: '/',
    component: Layout,
    redirect: '/dadasos/order',
    name: 'Order',
    meta: {
      title: 'order',
      icon: 'order',
      roles: ['company']
    },
    children: [
      {
        path: 'order-manage',
        component: () => import('@/views/dadasos/order'),
        name: 'OrderManage',
        meta: { title: 'OrderManage', icon: 'list',roles: ['company'] }
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    redirect: 'noredirect',
    name: 'car-manager',
    meta: {
      title: 'car-manager',
      icon: 'car-manager',
      roles: ['company']
    },
    children: [
      {
        path: 'car-manage',
        component: () => import('@/views/dadasos/car-manager'),
        name: 'CarManage',
        meta: { title: 'CarManage', icon: 'nested',roles: ['company'] }
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    redirect: 'noredirect',
    name: 'company-review',
    meta: {
      title: 'company-review',
      icon: 'company-review',
      roles: ['admin']
    },
    children: [
      {
        path: 'company-review',
        component: () => import('@/views/dadasos/company-review'),
        name: 'CompanyReview',
        meta: { title: 'CompanyReview', icon: 'people', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    redirect: 'noredirect',
    name: 'money-review',
    meta: {
      title: 'money-review',
      icon: 'money-review'
    },
    children: [
      {
        path: 'money-review',
        component: () => import('@/views/dadasos/money-review'),
        name: 'MoneyReview',
        meta: { title: 'MoneyReview', icon: 'money' }
      }
    ]
  }
]

export default dadaRouter
