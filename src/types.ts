export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface MenuItemOption {
  name: string;
  choices: {
    name: string;
    extraPrice: number;
  }[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  options?: MenuItemOption[];
}

export interface CartItem {
  id: string; // unique cart item id (combines itemId + selected options)
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: { [optionName: string]: string };
  notes?: string;
  addedPrice: number; // base price + selected options extra costs
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  type: 'takeaway' | 'delivery' | 'table';
  customerName: string;
  customerPhone: string;
  address?: string;
  tableNumber?: string;
  paymentMethod: 'mpesa' | 'emola' | 'cash';
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO string
  notes?: string;
}

export interface RestaurantStats {
  totalRevenue: number;
  activeOrdersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  minLimit: number;
  unit: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  tableNumber?: string;
  customerName: string;
  amount: number;
  paymentMethod: 'mpesa' | 'emola' | 'cash';
  paidAt: string;
}
