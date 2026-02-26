import type { Order, OrderItem, OrderStatus } from '@/lib/types';

let _idCounter = 1;
const nextId = () => String(_idCounter++);

const orders: Order[] = [];

export function createOrder(tableId: string, items: OrderItem[]): Order {
  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const order: Order = {
    id: nextId(),
    tableId,
    items,
    total,
    status: 'pending_verification',
    createdAt: Date.now(),
  };
  orders.unshift(order);
  return order;
}

export function listOrders(status?: OrderStatus): Order[] {
  if (!status) return [...orders];
  return orders.filter((o) => o.status === status);
}

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  extra?: Partial<Order>,
): Order | undefined {
  const order = getOrder(id);
  if (!order) return undefined;
  order.status = status;
  Object.assign(order, extra);
  return order;
}

export function setOrderEta(id: string, minutes: number): Order | undefined {
  const order = getOrder(id);
  if (!order) return undefined;
  order.etaMinutes = minutes;
  return order;
}

export function clearAllOrders() {
  orders.splice(0, orders.length);
}

