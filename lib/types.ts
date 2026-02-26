export type OrderStatus =
  | 'pending_verification'
  | 'verified'
  | 'kitchen_queue'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type Offer =
  | { type: 'bogo'; label?: string }
  | { type: 'percent'; value: number; label?: string }
  | { type: 'flat'; value: number; label?: string }
  | { type: 'none' };

export interface MenuItem {
  id: string | number;
  name: string;
  description: string;
  price?: number;
  priceLabel?: string;
  image: string;
  category?: string;
  variants?: { name: string; price: number }[];
  offer?: Offer;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantName?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  verifiedAt?: number;
  sentToKitchenAt?: number;
  acceptedAt?: number;
  etaMinutes?: number;
  billRequested?: boolean;
  billRequestAccepted?: boolean;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface Table {
  _id: string;
  number: string;
  createdAt: number;
}
