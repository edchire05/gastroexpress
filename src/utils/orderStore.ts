import { Order, OrderStatus, MenuItem, StockItem, PaymentRecord } from '../types';
import { INITIAL_MENU_ITEMS } from '../data/menu';

const ORDERS_KEY = 'takeaway_orders_list';
const MENU_KEY = 'takeaway_menu_items_list';
const STOCK_KEY = 'takeaway_stock_list';
const PAYMENTS_KEY = 'takeaway_payments_list';
const CUSTOM_SYNC_EVENT = 'takeaway_orders_sync_event';

const INITIAL_STOCK: StockItem[] = [
  { id: 'st-01', name: 'Pão de Brioche', quantity: 45, minLimit: 10, unit: 'unidades' },
  { id: 'st-02', name: 'Carne Angus (Smash 80g)', quantity: 98, minLimit: 20, unit: 'unidades' },
  { id: 'st-03', name: 'Queijo Cheddar Fatiado', quantity: 82, minLimit: 15, unit: 'fatias' },
  { id: 'st-04', name: 'Carne Angus (150g)', quantity: 36, minLimit: 10, unit: 'unidades' },
  { id: 'st-05', name: 'Bacon Fatiado', quantity: 140, minLimit: 30, unit: 'fatias' },
  { id: 'st-06', name: 'Massa de Pizza Artesanal', quantity: 24, minLimit: 5, unit: 'unidades' },
  { id: 'st-07', name: 'Molho de Tomate Pelati', quantity: 18, minLimit: 4, unit: 'litros' },
  { id: 'st-08', name: 'Muçarela de Búfala', quantity: 22, minLimit: 5, unit: 'kg' },
  { id: 'st-09', name: 'Refrigerante Lata 350ml', quantity: 65, minLimit: 15, unit: 'latas' },
  { id: 'st-10', name: 'Soda Italiana (Xarope Maçã)', quantity: 8, minLimit: 2, unit: 'garrafas' },
  { id: 'st-11', name: 'Batata Rústica Congelada', quantity: 25, minLimit: 5, unit: 'kg' },
  { id: 'st-12', name: 'Coxinha de Frango Gourmet', quantity: 100, minLimit: 24, unit: 'unidades' },
  { id: 'st-13', name: 'Chocolate & Nutella', quantity: 15, minLimit: 3, unit: 'kg' },
];

const getPreseededPayments = (): PaymentRecord[] => {
  return [
    {
      id: 'pay-01',
      orderId: 'ord-pre-2',
      orderNumber: '0012',
      customerName: 'Renato Silva',
      amount: 89.70,
      paymentMethod: 'mpesa',
      paidAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'pay-02',
      orderId: 'ord-pre-1',
      orderNumber: '0013',
      tableNumber: 'Mesa 05',
      customerName: 'Mariana Duarte',
      amount: 84.90,
      paymentMethod: 'emola',
      paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    }
  ];
};

// Generate realistic past orders so the Admin stats look professional on startup
const getPreseededOrders = (): Order[] => {
  const now = new Date();
  
  const hourAgo = (h: number) => {
    const d = new Date(now.getTime() - h * 60 * 60 * 1000);
    return d.toISOString();
  };

  return [
    {
      id: 'ord-pre-2',
      orderNumber: '0012',
      items: [
        {
          id: 'burger-01-opt-0',
          menuItem: INITIAL_MENU_ITEMS[0], // Smash Clássico
          quantity: 2,
          selectedOptions: { 'Ponto da Carne': 'Ao ponto', 'Extras': 'Sem extras' },
          notes: 'Por favor, caprichar no molho especial!',
          addedPrice: 28.90
        },
        {
          id: 'side-01',
          menuItem: INITIAL_MENU_ITEMS[4], // Batata Rústica
          quantity: 1,
          selectedOptions: {},
          notes: '',
          addedPrice: 18.90
        },
        {
          id: 'drink-01-opt-0',
          menuItem: INITIAL_MENU_ITEMS[6], // Refrigerante
          quantity: 2,
          selectedOptions: { 'Sabor': 'Coca-Cola Zero' },
          notes: '',
          addedPrice: 6.50
        }
      ],
      type: 'delivery',
      customerName: 'Renato Silva',
      customerPhone: '(11) 98765-4321',
      address: 'Av. Paulista, 1000 - Apt 142 - Bela Vista, São Paulo - SP',
      paymentMethod: 'mpesa',
      total: 89.70,
      status: 'delivered',
      createdAt: hourAgo(4.5),
      notes: 'Entregar na portaria se possível.'
    },
    {
      id: 'ord-pre-1',
      orderNumber: '0013',
      items: [
        {
          id: 'pizza-01-opt-0',
          menuItem: INITIAL_MENU_ITEMS[2], // Pizza Margherita Suprema
          quantity: 1,
          selectedOptions: { 'Tamanho': 'Grande (8 fatias) (+ 15,00 MT)', 'Borda': 'Borda de Catupiry (+ 8,00 MT)' },
          notes: '',
          addedPrice: 72.90 // 49.90 + 15.00 + 8.00
        },
        {
          id: 'drink-02',
          menuItem: INITIAL_MENU_ITEMS[7], // Soda Italiana
          quantity: 1,
          selectedOptions: {},
          notes: '',
          addedPrice: 12.00
        }
      ],
      type: 'table',
      customerName: 'Mariana Duarte',
      customerPhone: '(11) 99123-4567',
      tableNumber: 'Mesa 05',
      paymentMethod: 'emola',
      total: 84.90,
      status: 'delivered',
      createdAt: hourAgo(2),
    },
    {
      id: 'ord-pre-3',
      orderNumber: '0014',
      items: [
        {
          id: 'burger-02-opt-0',
          menuItem: INITIAL_MENU_ITEMS[1], // Double Bacon Tasty
          quantity: 1,
          selectedOptions: { 'Ponto da Carne': 'Bem passado', 'Adicionais': 'Cebola Caramelizada (+ 3,50 MT)' },
          notes: 'Sem picles',
          addedPrice: 40.40 // 36.90 + 3.50
        },
        {
          id: 'sweet-01',
          menuItem: INITIAL_MENU_ITEMS[8], // Petit Gateau
          quantity: 1,
          selectedOptions: {},
          notes: '',
          addedPrice: 24.95
        }
      ],
      type: 'takeaway',
      customerName: 'Lucas Oliveira',
      customerPhone: '(11) 97766-5544',
      paymentMethod: 'cash',
      total: 65.35,
      status: 'preparing',
      createdAt: hourAgo(0.4), // 24 mins ago
    }
  ];
};

export const getStoredMenu = (): MenuItem[] => {
  const data = localStorage.getItem(MENU_KEY);
  if (!data) {
    localStorage.setItem(MENU_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
    return INITIAL_MENU_ITEMS;
  }
  return JSON.parse(data);
};

export const saveStoredMenu = (menu: MenuItem[]) => {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
  window.dispatchEvent(new CustomEvent(CUSTOM_SYNC_EVENT));
};

export const getStoredOrders = (): Order[] => {
  const data = localStorage.getItem(ORDERS_KEY);
  if (!data) {
    const preseeded = getPreseededOrders();
    localStorage.setItem(ORDERS_KEY, JSON.stringify(preseeded));
    return preseeded;
  }
  return JSON.parse(data);
};

export const saveOrder = (order: Order) => {
  const orders = getStoredOrders();
  orders.unshift(order); // Add to the top
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  
  // Trigger events for real time sync
  window.dispatchEvent(new CustomEvent(CUSTOM_SYNC_EVENT));
  // In addition, standard storage event triggers on other tabs
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): Order[] => {
  const orders = getStoredOrders();
  const updated = orders.map(ord => {
    if (ord.id === orderId) {
      return { ...ord, status };
    }
    return ord;
  });
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  
  // Trigger events for real time sync
  window.dispatchEvent(new CustomEvent(CUSTOM_SYNC_EVENT));
  
  return updated;
};

// Clear all orders and reset config
export const resetAllOrders = () => {
  localStorage.removeItem(ORDERS_KEY);
  localStorage.removeItem(MENU_KEY);
  window.dispatchEvent(new CustomEvent(CUSTOM_SYNC_EVENT));
};

export const subscribeToSync = (callback: () => void): () => void => {
  const handleSync = () => {
    callback();
  };

  // Listen to both our custom active tab sync and standard cross-tab storage synchronizer
  window.addEventListener(CUSTOM_SYNC_EVENT, handleSync);
  window.addEventListener('storage', handleSync);

  return () => {
    window.removeEventListener(CUSTOM_SYNC_EVENT, handleSync);
    window.removeEventListener('storage', handleSync);
  };
};

export const getStoredStock = (): StockItem[] => {
  const data = localStorage.getItem(STOCK_KEY);
  if (!data) {
    localStorage.setItem(STOCK_KEY, JSON.stringify(INITIAL_STOCK));
    return INITIAL_STOCK;
  }
  return JSON.parse(data);
};

export const saveStoredStock = (stock: StockItem[]) => {
  localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
  window.dispatchEvent(new CustomEvent(CUSTOM_SYNC_EVENT));
};

export const getStoredPayments = (): PaymentRecord[] => {
  const data = localStorage.getItem(PAYMENTS_KEY);
  if (!data) {
    const preseeded = getPreseededPayments();
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(preseeded));
    return preseeded;
  }
  return JSON.parse(data);
};

export const savePaymentRecord = (record: PaymentRecord) => {
  const payments = getStoredPayments();
  payments.unshift(record);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  window.dispatchEvent(new CustomEvent(CUSTOM_SYNC_EVENT));
};

export const decrementStockForOrder = (order: Order) => {
  const stock = getStoredStock();
  order.items.forEach(item => {
    const qty = item.quantity;
    const itemId = item.menuItem.id;
    if (itemId === 'burger-01') {
      updateQty(stock, 'st-01', qty * 1);
      updateQty(stock, 'st-02', qty * 2);
      updateQty(stock, 'st-03', qty * 1);
    } else if (itemId === 'burger-02') {
      updateQty(stock, 'st-01', qty * 1);
      updateQty(stock, 'st-04', qty * 2);
      updateQty(stock, 'st-05', qty * 3);
    } else if (itemId === 'pizza-01') {
      updateQty(stock, 'st-06', qty * 1);
      updateQty(stock, 'st-07', qty * 0.2);
      updateQty(stock, 'st-08', qty * 0.3);
    } else if (itemId === 'pizza-02') {
      updateQty(stock, 'st-06', qty * 1);
      updateQty(stock, 'st-07', qty * 0.2);
    } else if (itemId === 'side-01') {
      updateQty(stock, 'st-11', qty * 0.25);
    } else if (itemId === 'side-02') {
      updateQty(stock, 'st-12', qty * 6);
    } else if (itemId === 'drink-01') {
      updateQty(stock, 'st-09', qty * 1);
    } else if (itemId === 'drink-02') {
      updateQty(stock, 'st-10', qty * 0.1);
    } else if (itemId === 'sweet-01') {
      updateQty(stock, 'st-13', qty * 0.15);
    }
  });
  saveStoredStock(stock);
};

const updateQty = (stockList: StockItem[], stockId: string, value: number) => {
  const found = stockList.find(s => s.id === stockId);
  if (found) {
    found.quantity = Math.max(0, parseFloat((found.quantity - value).toFixed(2)));
  }
};
