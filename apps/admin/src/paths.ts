export const paths = {
  login: '/login',
  dashboard: '/dashboard',
  orders: '/orders',
  orderDetail: (id: string) => `/orders/${id}`,
  orderDetailPattern: '/orders/:orderId',
  tickets: '/tickets',
} as const;
