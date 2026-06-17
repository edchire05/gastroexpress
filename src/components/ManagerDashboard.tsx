import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat, Wifi, Volume2, Info, ArrowRight, Plus, Minus, Trash2, 
  Clock, CreditCard, Search, RotateCcw, Check, X, AlertTriangle, 
  TrendingUp, DollarSign, Calendar, Printer, FileText, CheckCircle2, 
  Layers, ChevronRight, CheckSquare, Sparkles, Filter, Database
} from 'lucide-react';
import { 
  Order, OrderStatus, MenuItem, StockItem, PaymentRecord, CartItem 
} from '../types';
import { 
  getStoredOrders, getStoredMenu, getStoredStock, getStoredPayments,
  saveOrder, updateOrderStatus, saveStoredStock, savePaymentRecord,
  decrementStockForOrder, subscribeToSync, resetAllOrders
} from '../utils/orderStore';
import { playNotificationChime } from '../utils/sound';

export default function ManagerDashboard() {
  // Navigation Tabs: 'pedidos' | 'pagamentos' | 'estoque' | 'cardapio'
  const [activeTab, setActiveTab] = useState<'pedidos' | 'pagamentos' | 'estoque' | 'cardapio'>('pedidos');
  
  // App States
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getStoredMenu());
  const [stockItems, setStockItems] = useState<StockItem[]>(() => getStoredStock());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => getStoredPayments());
  
  // Active selection states
  const [selectedTable, setSelectedTable] = useState<string>('Mesa 01');
  const [searchStock, setSearchStock] = useState<string>('');
  const [searchPayment, setSearchPayment] = useState<string>('');
  
  // Notification states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'info' } | null>(null);
  
  // New Order Creation States (per-table temporary cart)
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Custom Options Modal or selection state for launching orders
  const [activeCustomizingItem, setActiveCustomizingItem] = useState<MenuItem | null>(null);
  const [modalOptions, setModalOptions] = useState<{ [optionName: string]: { choice: string; extraPrice: number } }>({});
  
  // Checkout Billing States
  const [checkoutTable, setCheckoutTable] = useState<string | null>(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState<'mpesa' | 'emola' | 'cash'>('mpesa');
  const [receivedCash, setReceivedCash] = useState<string>('');
  const [closedReceipt, setClosedReceipt] = useState<PaymentRecord | null>(null);

  // Stock editor states
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [addStockAmount, setAddStockAmount] = useState<string>('10');
  const [newStockName, setNewStockName] = useState<string>('');
  const [newStockUnit, setNewStockUnit] = useState<string>('unidades');
  const [newStockMin, setNewStockMin] = useState<string>('10');
  const [newStockQty, setNewStockQty] = useState<string>('50');

  // Sync state with storage
  useEffect(() => {
    const handleSync = () => {
      setOrders(getStoredOrders());
      setMenuItems(getStoredMenu());
      setStockItems(getStoredStock());
      setPayments(getStoredPayments());
    };

    const unsubscribe = subscribeToSync(handleSync);
    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'warn' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Helper: check if a specific table has an active (non-delivered, non-cancelled) order
  const activeOrderForTable = useMemo(() => {
    return (tableName: string) => {
      return orders.find(o => o.tableNumber === tableName && o.status !== 'delivered' && o.status !== 'cancelled');
    };
  }, [orders]);

  // List of pre-configured tables
  const TABLES = useMemo(() => [
    'Mesa 01', 'Mesa 02', 'Mesa 03', 'Mesa 04', 'Mesa 05',
    'Mesa 06', 'Mesa 07', 'Mesa 08', 'Mesa 09', 'Mesa 10',
    'Takeaway'
  ], []);

  // Filter categories
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category));
    return ['Todos', ...Array.from(cats)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Todos') return menuItems;
    return menuItems.filter(item => item.category === selectedCategory);
  }, [menuItems, selectedCategory]);

  // Stock status evaluation helper
  const getStockStatus = (item: StockItem) => {
    if (item.quantity <= 0) return { label: 'Esgotado', color: 'bg-red-100 text-red-700 border-red-200' };
    if (item.quantity <= item.minLimit) return { label: 'Crítico', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Normal', color: 'bg-green-100 text-green-700 border-green-200' };
  };

  // Verify stock availability for an item
  const checkStockForMenuItem = (menuItem: MenuItem, qtyNeeded: number = 1): { available: boolean; reason?: string } => {
    const stock = getStoredStock();
    
    // Mapping of menu item recipe consumption
    const checkItemStock = (id: string, qty: number): { available: boolean; reason?: string } => {
      const found = stock.find(s => s.id === id);
      if (!found) return { available: true };
      if (found.quantity < qty) {
        return { available: false, reason: `Estoque insuficiente de "${found.name}" (${found.quantity} ${found.unit} disponíveis, necessário ${qty})` };
      }
      return { available: true };
    };

    if (menuItem.id === 'burger-01') {
      const p1 = checkItemStock('st-01', qtyNeeded * 1);
      if (!p1.available) return p1;
      const p2 = checkItemStock('st-02', qtyNeeded * 2);
      if (!p2.available) return p2;
      const p3 = checkItemStock('st-03', qtyNeeded * 1);
      if (!p3.available) return p3;
    } else if (menuItem.id === 'burger-02') {
      const p1 = checkItemStock('st-01', qtyNeeded * 1);
      if (!p1.available) return p1;
      const p2 = checkItemStock('st-04', qtyNeeded * 2);
      if (!p2.available) return p2;
      const p3 = checkItemStock('st-05', qtyNeeded * 3);
      if (!p3.available) return p3;
    } else if (menuItem.id === 'pizza-01') {
      const p1 = checkItemStock('st-06', qtyNeeded * 1);
      if (!p1.available) return p1;
      const p2 = checkItemStock('st-07', qtyNeeded * 0.2);
      if (!p2.available) return p2;
      const p3 = checkItemStock('st-08', qtyNeeded * 0.3);
      if (!p3.available) return p3;
    } else if (menuItem.id === 'pizza-02') {
      const p1 = checkItemStock('st-06', qtyNeeded * 1);
      if (!p1.available) return p1;
      const p2 = checkItemStock('st-07', qtyNeeded * 0.2);
      if (!p2.available) return p2;
    } else if (menuItem.id === 'side-01') {
      const p1 = checkItemStock('st-11', qtyNeeded * 0.25);
      if (!p1.available) return p1;
    } else if (menuItem.id === 'side-02') {
      const p = checkItemStock('st-12', qtyNeeded * 6);
      if (!p.available) return p;
    } else if (menuItem.id === 'drink-01') {
      const p = checkItemStock('st-09', qtyNeeded * 1);
      if (!p.available) return p;
    } else if (menuItem.id === 'drink-02') {
      const p = checkItemStock('st-10', qtyNeeded * 0.1);
      if (!p.available) return p;
    } else if (menuItem.id === 'sweet-01') {
      const p = checkItemStock('st-13', qtyNeeded * 0.15);
      if (!p.available) return p;
    }

    return { available: true };
  };

  // Add Item to cart with options config
  const handleOpenCustomizer = (item: MenuItem) => {
    const stockVerification = checkStockForMenuItem(item, 1);
    if (!stockVerification.available) {
      showToast(stockVerification.reason || 'Sem estoque do ingrediente principal', 'warn');
      return;
    }

    // Set default option value selection
    const defaults: { [name: string]: { choice: string; extraPrice: number } } = {};
    if (item.options) {
      item.options.forEach(opt => {
        if (opt.choices.length > 0) {
          defaults[opt.name] = { 
            choice: opt.choices[0].name, 
            extraPrice: opt.choices[0].extraPrice 
          };
        }
      });
    }
    setModalOptions(defaults);
    setActiveCustomizingItem(item);
  };

  const handleConfirmCustomization = () => {
    if (!activeCustomizingItem) return;

    const basePrice = activeCustomizingItem.price;
    const optionArray = Object.values(modalOptions) as { choice: string; extraPrice: number }[];
    const extrasTotal = optionArray.reduce((sum, opt) => sum + opt.extraPrice, 0);
    const finalPrice = basePrice + extrasTotal;

    const optionLabels: { [key: string]: string } = {};
    Object.entries(modalOptions).forEach(([name, val]) => {
      optionLabels[name] = (val as { choice: string; extraPrice: number }).choice;
    });

    const optionString = Object.entries(optionLabels)
      .map(([name, choice]) => `${name}: ${choice}`)
      .join(', ');

    const uniqueId = `${activeCustomizingItem.id}-${Object.values(optionLabels).join('-')}`;

    // Verify if already in cart
    const existingIndex = cartItems.findIndex(i => i.id === uniqueId);
    if (existingIndex > -1) {
      const currentQty = cartItems[existingIndex].quantity;
      const stockVerification = checkStockForMenuItem(activeCustomizingItem, currentQty + 1);
      if (!stockVerification.available) {
        showToast(stockVerification.reason || 'Sem estoque suficiente', 'warn');
        return;
      }
      
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        id: uniqueId,
        menuItem: activeCustomizingItem,
        quantity: 1,
        selectedOptions: optionLabels,
        addedPrice: finalPrice
      };
      setCartItems([...cartItems, newItem]);
    }

    setActiveCustomizingItem(null);
    showToast(`${activeCustomizingItem.name} adicionado ao rascunho.`, 'success');
  };

  const updateCartQty = (id: string, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    if (delta > 0) {
      const stockCheck = checkStockForMenuItem(item.menuItem, item.quantity + 1);
      if (!stockCheck.available) {
        showToast(stockCheck.reason || 'Estoque insuficiente desse prato.', 'warn');
        return;
      }
    }

    const updated = cartItems.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    });
    setCartItems(updated);
  };

  const removeCartItem = (id: string) => {
    setCartItems(cartItems.filter(i => i.id !== id));
  };

  // Launch the order onto the table officially
  const handleLaunchOrder = () => {
    if (cartItems.length === 0) {
      showToast('Selecione ao menos um produto para lançar o pedido.', 'warn');
      return;
    }

    // Secondary validation checking for all items in cart before saving
    for (const item of cartItems) {
      const check = checkStockForMenuItem(item.menuItem, item.quantity);
      if (!check.available) {
        showToast(`Falha no lançamento: ${check.reason}`, 'warn');
        return;
      }
    }

    const orderNumStr = String(Math.floor(1000 + Math.random() * 9000));
    const totalAmount = cartItems.reduce((curr, item) => curr + (item.addedPrice * item.quantity), 0);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNumStr,
      items: cartItems,
      type: selectedTable === 'Takeaway' ? 'takeaway' : 'table',
      customerName: customerName.trim() || `Mesa ${selectedTable.replace('Mesa ', '')} Cliente`,
      customerPhone: customerPhone.trim() || '(Gerente)',
      tableNumber: selectedTable,
      paymentMethod: 'mpesa',
      total: parseFloat(totalAmount.toFixed(2)),
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: orderNotes
    };

    // Save order & decrement inventory
    saveOrder(newOrder);
    decrementStockForOrder(newOrder);
    
    // Play POS action Sound
    playNotificationChime();

    // Reset temporary variables
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
    
    // Alert
    showToast(`Pedido registrado com sucesso na ${selectedTable}! Enviado para a cozinha.`, 'success');
  };

  // Cooking state changes
  const advanceOrderState = (orderId: string, currentStatus: OrderStatus) => {
    let next: OrderStatus = 'pending';
    if (currentStatus === 'pending') {
      next = 'preparing';
      showToast('Preparo iniciado na cozinha.', 'info');
    } else if (currentStatus === 'preparing') {
      next = 'ready';
      showToast('Prato concluído! Aguardando servir.', 'success');
      playNotificationChime();
    } else if (currentStatus === 'ready') {
      next = 'delivered';
      showToast('Entregue e finalizado com sucesso.', 'success');
    }

    updateOrderStatus(orderId, next);
  };

  const cancelOrderState = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
    showToast('Pedido cancelado pelo gerente.', 'warn');
  };

  // Processing closing and checkout
  const handleOpenCheckout = (tableName: string) => {
    const active = activeOrderForTable(tableName);
    if (!active) {
      showToast('Essa mesa não possui consumo ativo.', 'warn');
      return;
    }
    setCheckoutTable(tableName);
    setSelectedPayMethod('mpesa');
    setReceivedCash('');
    setClosedReceipt(null);
    setActiveTab('pagamentos');
  };

  const handleFinalizePayment = () => {
    if (!checkoutTable) return;
    const active = activeOrderForTable(checkoutTable);
    if (!active) return;

    let receivedValue = active.total;
    if (selectedPayMethod === 'cash') {
      const parsed = parseFloat(receivedCash.replace(',', '.'));
      if (isNaN(parsed) || parsed < active.total) {
        showToast(`Valor em dinheiro insuficiente. Subtotal: ${active.total.toFixed(2)} MT`, 'warn');
        return;
      }
      receivedValue = parsed;
    }

    const receipt: PaymentRecord = {
      id: `pay-${Date.now()}`,
      orderId: active.id,
      orderNumber: active.orderNumber,
      tableNumber: active.tableNumber,
      customerName: active.customerName,
      amount: active.total,
      paymentMethod: selectedPayMethod,
      paidAt: new Date().toISOString()
    };

    // Save payment
    savePaymentRecord(receipt);

    // Update order state to delivered / processed
    updateOrderStatus(active.id, 'delivered');

    setClosedReceipt(receipt);
    setOrders(getStoredOrders());
    setPayments(getStoredPayments());
    showToast(`Pagamento da ${checkoutTable} processado! Mesa liberada.`, 'success');
  };

  // Reset demo databases
  const handleRestartDatabase = () => {
    if (confirm('Deseja realmente redefinir todos os pedidos, histórico de pagamentos e estoque ao padrão inicial?')) {
      localStorage.removeItem('takeaway_stock_list');
      localStorage.removeItem('takeaway_payments_list');
      resetAllOrders();
      showToast('Banco de dados local restaurado com sucesso!', 'info');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Stock Increase replenishment
  const handleReplenishStock = (item: StockItem) => {
    const qtyToAdd = parseFloat(addStockAmount);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      showToast('Por favor, informe uma quantidade válida maior que zero.', 'warn');
      return;
    }

    const updated = stockItems.map(s => {
      if (s.id === item.id) {
        return { ...s, quantity: parseFloat((s.quantity + qtyToAdd).toFixed(2)) };
      }
      return s;
    });

    setStockItems(updated);
    saveStoredStock(updated);
    setSelectedStockId(null);
    showToast(`Abastecido: +${qtyToAdd} ${item.unit} de "${item.name}" adicionados!`, 'success');
  };

  const handleCreateStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockName.trim()) {
      showToast('Digite o nome do ingrediente.', 'warn');
      return;
    }

    const newId = `st-custom-${Date.now()}`;
    const newItem: StockItem = {
      id: newId,
      name: newStockName.trim(),
      quantity: parseFloat(newStockQty) || 0,
      minLimit: parseFloat(newStockMin) || 10,
      unit: newStockUnit
    };

    const updated = [...stockItems, newItem];
    setStockItems(updated);
    saveStoredStock(updated);

    // Reset fields
    setNewStockName('');
    setNewStockUnit('unidades');
    setNewStockQty('50');
    setNewStockMin('10');
    showToast(`Ingrediente "${newItem.name}" cadastrado no estoque!`, 'success');
  };

  // Computations for Payments view Metrics
  const calculatedMetrics = useMemo(() => {
    const totalRev = payments.reduce((sum, p) => sum + p.amount, 0);
    const count = payments.length;
    const averageVal = count > 0 ? totalRev / count : 0;

    // payment methods distribution
    const counts = { mpesa: 0, emola: 0, cash: 0 };
    payments.forEach(p => {
      if (p.paymentMethod in counts) {
        counts[p.paymentMethod as 'mpesa' | 'emola' | 'cash'] += 1;
      }
    });

    const totalMethods = Math.max(1, count);
    const mpesaPercent = Math.round((counts.mpesa / totalMethods) * 100);
    const emolaPercent = Math.round((counts.emola / totalMethods) * 100);
    const cashPercent = Math.round((counts.cash / totalMethods) * 100);

    return {
      totalRev,
      count,
      averageVal,
      mpesaPercent,
      emolaPercent,
      cashPercent
    };
  }, [payments]);

  // Filters
  const filteredStockList = useMemo(() => {
    return stockItems.filter(item => 
      item.name.toLowerCase().includes(searchStock.toLowerCase())
    );
  }, [stockItems, searchStock]);

  const filteredPaymentHistory = useMemo(() => {
    return payments.filter(p => 
      p.customerName.toLowerCase().includes(searchPayment.toLowerCase()) ||
      (p.tableNumber && p.tableNumber.toLowerCase().includes(searchPayment.toLowerCase())) ||
      p.orderNumber.includes(searchPayment)
    );
  }, [payments, searchPayment]);

  const criticalStockItems = useMemo(() => {
    return stockItems.filter(s => s.quantity <= s.minLimit);
  }, [stockItems]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans" id="manager_app_viewport">
      
      {/* ENTERPRISE REAL-TIME STATUS BAR HEADER */}
      <header className="bg-white border-b border-gray-100 shadow-xs sticky top-0 z-40 transition-all duration-200" id="manager_navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Operational Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-xs shrink-0">
              <ChefHat className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight font-display text-orange-500">
                  GASTRO<span className="text-gray-900 font-medium">EXPRESS</span>
                </h1>
                <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-orange-100 uppercase tracking-wider">
                  Painel do Gerente (Takeaway)
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-green-500" />
                  Operação Local Sincronizada Instantâneo
                </span>
              </div>
            </div>
          </div>

          {/* Quick Active metrics badge info */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            {criticalStockItems.length > 0 && (
              <div className="bg-amber-50 text-amber-800 border border-amber-250 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-3xs animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{criticalStockItems.length} insumos baixos no estoque!</span>
              </div>
            )}

            <button
              onClick={handleRestartDatabase}
              title="Redefinir banco de dados local"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 bg-white hover:text-red-500 hover:border-red-200 transition-all cursor-pointer shadow-3xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* POS SEAMLESS MENU TABS */}
      <div className="bg-white border-b border-gray-100 py-1 sticky top-[68px] z-30 shadow-4xs" id="navigation_menu_tabs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => { setActiveTab('pedidos'); setClosedReceipt(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                activeTab === 'pedidos'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              📋 Pedidos por Mesa
            </button>

            <button
              onClick={() => { setActiveTab('pagamentos'); setClosedReceipt(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer relative ${
                activeTab === 'pagamentos'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              💳 Pagamentos & Terminal
              {orders.filter(o => o.status === 'ready').length > 0 && (
                <span className="w-2.5 h-2.5 bg-amber-500 border border-white rounded-full absolute top-1.5 right-1 animate-bounce"></span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('estoque'); setClosedReceipt(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                activeTab === 'estoque'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Database className="w-4 h-4" />
              📦 Controle de Estoque
              {criticalStockItems.length > 0 && (
                <span className="bg-red-500 text-white font-extrabold text-[8px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white shadow-xs">
                  {criticalStockItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('cardapio'); setClosedReceipt(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                activeTab === 'cardapio'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              🍕 Disponibilidade Cardápio
            </button>
          </div>
        </div>
      </div>

      {/* CORE OPERATIONAL SCREEN VIEWPORT */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col" id="operational_view">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PEDIDOS POR MESA */}
          {activeTab === 'pedidos' && (
            <motion.div
              key="tab_pedidos_key"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Left 4 Cols: Grid of Tables */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
                    <span>Mesas de Atendimento</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold">TOTAL: {TABLES.length}</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    {TABLES.map(tableName => {
                      const active = activeOrderForTable(tableName);
                      const isSelected = selectedTable === tableName;
                      
                      return (
                        <button
                          key={tableName}
                          onClick={() => {
                            setSelectedTable(tableName);
                            setCartItems([]);
                          }}
                          className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between h-[96px] cursor-pointer relative ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20'
                              : active
                                ? 'border-amber-250 bg-amber-50/30 hover:bg-amber-50/50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <span className="font-extrabold text-sm text-gray-900">{tableName}</span>
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              active ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                            }`} />
                          </div>

                          <div className="mt-2 text-left">
                            {active ? (
                              <div>
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-sm capitalize">
                                  {active.status === 'pending' ? 'NOVO' : active.status === 'preparing' ? 'PRODUZINDO' : 'PRONTO'}
                                </span>
                                <p className="text-xs font-black text-gray-800 mt-1">{active.total.toFixed(2)} MT</p>
                              </div>
                            ) : (
                              <p className="text-[11px] text-gray-400 font-medium">🟢 Livre / Sem consumo</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Extra Kitchen Queue Quickview */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
                    <span>Fila da Cozinha</span>
                    <span className="bg-orange-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                      {orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length} ativos
                    </span>
                  </h3>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">Nenhum pedido ativamente na preparação.</p>
                    ) : (
                      orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').map(orderItem => (
                        <div key={orderItem.id} className="p-2 bg-gray-50 rounded-lg border border-gray-200/60 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-900 truncate">#{orderItem.orderNumber} - {orderItem.tableNumber}</span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-sm uppercase tracking-wider ${
                                orderItem.status === 'pending' ? 'bg-indigo-100 text-indigo-700' :
                                orderItem.status === 'preparing' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {orderItem.status === 'pending' ? 'Novo' : orderItem.status === 'preparing' ? 'Cozinha' : 'Pronto'}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">
                              {orderItem.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                            </p>
                          </div>

                          <button
                            onClick={() => advanceOrderState(orderItem.id, orderItem.status)}
                            className="p-1 px-2.5 rounded-md bg-white border border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all text-[10px] font-extrabold cursor-pointer shrink-0"
                          >
                            Avançar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right 8 Cols: Selected Table Details & Action */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Active Consumption / Launch Order Tab */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-3xs p-6 flex flex-col min-h-[450px]">
                  
                  {/* Table Title and Status Info */}
                  <div className="border-b border-gray-100 pb-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold font-display text-gray-900">{selectedTable}</h2>
                        {activeOrderForTable(selectedTable) ? (
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md">
                            ⚠️ Ocupada - Consumo Ativo
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-md">
                            🟢 Livre / Disponível para Pedido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Gerencie os pedidos, adicione itens ou feche a conta desta mesa.</p>
                    </div>

                    {activeOrderForTable(selectedTable) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenCheckout(selectedTable)}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          💸 Cobrar e Fechar Conta
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Case A: Table has Consuming Session */}
                  {activeOrderForTable(selectedTable) ? (
                    (() => {
                      const activeOrder = activeOrderForTable(selectedTable)!;
                      return (
                        <div className="space-y-6 flex-1 flex flex-col">
                          
                          {/* Live Bill Break down */}
                          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200/50">
                              <div>
                                <span className="text-xs text-gray-400">Identificação do Cliente</span>
                                <h4 className="text-sm font-extrabold text-gray-900">{activeOrder.customerName}</h4>
                                {activeOrder.customerPhone && (
                                  <p className="text-[11px] text-gray-400 mt-0.5">Telefone: {activeOrder.customerPhone}</p>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <span className="text-xs text-gray-400">Total Acumulado</span>
                                <p className="text-lg font-black text-orange-500">{activeOrder.total.toFixed(2)} MT</p>
                              </div>
                            </div>

                            {/* Consumed Items */}
                            <div className="space-y-3">
                              {activeOrder.items.map((it: CartItem) => (
                                <div key={it.id} className="flex items-start justify-between gap-4 text-xs">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-gray-800 bg-gray-150 px-1.5 py-0.5 rounded-sm">{it.quantity}x</span>
                                      <span className="font-bold text-gray-900 truncate">{it.menuItem.name}</span>
                                    </div>
                                    {Object.keys(it.selectedOptions).length > 0 && (
                                      <p className="text-[10px] text-gray-400 ml-7 mt-0.5">
                                        {Object.entries(it.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                      </p>
                                    )}
                                    {it.notes && (
                                      <p className="text-[10px] text-amber-700 italic ml-7 mt-0.5 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                                        Obs: {it.notes}
                                      </p>
                                    )}
                                  </div>

                                  <span className="font-semibold text-gray-900 shrink-0">
                                    {((it.addedPrice) * it.quantity).toFixed(2)} MT
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Status Timeline Control */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-orange-50/30 p-4 border border-orange-100 rounded-xl">
                            <div className="sm:col-span-7">
                              <span className="text-[10px] uppercase font-black text-orange-600 tracking-wider">Status na Cozinha</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`h-2.5 w-2.5 rounded-full ${
                                  activeOrder.status === 'pending' ? 'bg-indigo-500' :
                                  activeOrder.status === 'preparing' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                                }`} />
                                <h4 className="text-sm font-semibold capitalize text-gray-800">
                                  {activeOrder.status === 'pending' && 'Recebido (Pendente)'}
                                  {activeOrder.status === 'preparing' && 'Na Cozinha (Preparando)'}
                                  {activeOrder.status === 'ready' && 'Pronto na Mesa / Balcão'}
                                </h4>
                              </div>
                            </div>

                            <div className="sm:col-span-5 flex flex-wrap gap-2 sm:justify-end">
                              {activeOrder.status !== 'ready' && (
                                <button
                                  onClick={() => advanceOrderState(activeOrder.id, activeOrder.status)}
                                  className="w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800 font-extrabold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-3xs"
                                >
                                  {activeOrder.status === 'pending' ? '🚀 Iniciar Preparo' : '🔔 Marcar como Pronto'}
                                </button>
                              )}
                              <button
                                onClick={() => cancelOrderState(activeOrder.id)}
                                className="w-full sm:w-auto bg-white hover:bg-red-50 text-red-650 hover:text-red-700 font-bold text-xs px-3 py-2.5 rounded-lg border border-gray-200 hover:border-red-250 transition-all cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>

                          {/* Guide banner */}
                          <div className="text-xs text-amber-800 bg-amber-50/70 border border-amber-100 p-3 rounded-lg flex items-start gap-2 mt-auto">
                            <Info className="w-4 h-4 text-amber-600 shrink-0" />
                            <p className="leading-snug">
                              Para adicionar novos produtos ao consumo da mesa, selecione outra mesa ou finalize o pagamento para liberar e reabrir o lançamento nesta mesa.
                            </p>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    
                    /* Case B: Table is Free, Lançar Novo Pedido */
                    <div className="flex-1 flex flex-col gap-6">
                      
                      <div className="bg-indigo-50/30 border border-indigo-100/50 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1 space-y-1.5">
                          <h4 className="text-xs font-bold uppercase text-orange-500 tracking-wider">Identificar Cliente (Opcional)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Nome do cliente (Ex: André)"
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-hidden"
                            />
                            <input
                              type="text"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Telefone ou Marcador adicional"
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Main Add products workspace */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1">
                        
                        {/* Selector Catalog (8 cols) */}
                        <div className="md:col-span-7 flex flex-col gap-3">
                          
                          {/* Mini Category bar */}
                          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1 border-b border-gray-100">
                            {categories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                                  selectedCategory === cat
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-150'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          {/* Menu items list */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                            {filteredItems.map(item => {
                              const check = checkStockForMenuItem(item, 1);
                              
                              return (
                                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col justify-between hover:border-orange-500 transition-all p-3">
                                  <div>
                                    <div className="flex items-center justify-between gap-1">
                                      <h4 className="font-extrabold text-xs text-gray-900 truncate">{item.name}</h4>
                                      <span className="font-black text-orange-500 text-xs shrink-0">{item.price.toFixed(2)} MT</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-normal">{item.description}</p>
                                  </div>

                                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                                    <div className="text-[9px] font-medium text-gray-400">
                                      {check.available ? (
                                        <span className="text-green-600 font-semibold">🟢 Em estoque</span>
                                      ) : (
                                        <span className="text-red-500 font-bold">⚠️ Sem insumo</span>
                                      )}
                                    </div>

                                    <button
                                      disabled={!check.available}
                                      onClick={() => handleOpenCustomizer(item)}
                                      className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-medium transition-all cursor-pointer ${
                                        check.available
                                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      + Lançar
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Rascunho / Temp Cart (5 cols) */}
                        <div className="md:col-span-5 bg-gray-50 rounded-xl p-4 border border-gray-200/80 flex flex-col justify-between">
                          
                          <div>
                            <div className="border-b border-gray-200 pb-2 mb-3">
                              <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <span>🛒 Rascunho de Lançamento</span>
                              </h4>
                            </div>

                            {cartItems.length === 0 ? (
                              <div className="text-center py-12 px-2">
                                <p className="text-xs text-gray-400">Nenhum item selecionado.</p>
                                <p className="text-[11px] text-gray-300 mt-1">Clique em "+ Lançar" nos produtos ao lado para montar o pedido.</p>
                              </div>
                            ) : (
                              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                                {cartItems.map(cartIt => (
                                  <div key={cartIt.id} className="text-xs border-b border-gray-200/50 pb-2 flex flex-col gap-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="font-extrabold text-gray-900 truncate">{cartIt.menuItem.name}</p>
                                      <span className="font-bold text-gray-800 shrink-0">{((cartIt.addedPrice) * cartIt.quantity).toFixed(2)} MT</span>
                                    </div>

                                    {/* options label list */}
                                    {Object.keys(cartIt.selectedOptions).length > 0 && (
                                      <p className="text-[10px] text-gray-400 leading-normal">
                                        {Object.entries(cartIt.selectedOptions).map(([key, val]) => `${key}: ${val}`).join(', ')}
                                      </p>
                                    )}

                                    {/* Cart controls */}
                                    <div className="flex items-center justify-between mt-1 pt-1">
                                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md p-0.5">
                                        <button
                                          onClick={() => updateCartQty(cartIt.id, -1)}
                                          className="p-1 rounded-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="px-2 text-xs font-bold text-gray-800">{cartIt.quantity}</span>
                                        <button
                                          onClick={() => updateCartQty(cartIt.id, 1)}
                                          className="p-1 rounded-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>

                                      <button
                                        onClick={() => removeCartItem(cartIt.id)}
                                        className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
                                      >
                                        Excluir
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* total cost & official send */}
                          <div className="pt-3 border-t border-gray-200 mt-4">
                            <textarea
                              value={orderNotes}
                              onChange={(e) => setOrderNotes(e.target.value)}
                              placeholder="Observações do pedido (ex: Sem cebola)"
                              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs mb-3 focus:ring-1 focus:ring-orange-500 outline-hidden min-h-[50px] resize-none"
                            />

                            <div className="flex items-center justify-between mb-3.5">
                              <span className="text-xs font-bold text-gray-500">Valor Total</span>
                              <span className="text-lg font-black text-orange-500">
                                {cartItems.reduce((curr, item) => curr + (item.addedPrice * item.quantity), 0).toFixed(2)} MT
                              </span>
                            </div>

                            <button
                              onClick={handleLaunchOrder}
                              disabled={cartItems.length === 0}
                              className={`w-full py-3 rounded-lg text-center font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 ${
                                cartItems.length > 0
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                  : 'bg-gray-250 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Confirmar & Enviar p/ Cozinha
                            </button>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: PAGAMENTOS & CAIXA */}
          {activeTab === 'pagamentos' && (
            <motion.div
              key="tab_pagamentos_key"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Left Column (8 cols): Checkout workspace or Receipt */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Checkout selection card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                    <div>
                      <h2 className="text-lg font-bold font-display text-gray-950 flex items-center gap-2">
                        <span>💳 Fechamento de Conta & Terminal PDV</span>
                      </h2>
                      <p className="text-xs text-gray-400">Selecione uma mesa ativa para finalizar o pagamento.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-bold">Mesa para encerrar:</span>
                      <select
                        value={checkoutTable || ''}
                        onChange={(e) => {
                          const table = e.target.value;
                          setCheckoutTable(table || null);
                          setClosedReceipt(null);
                        }}
                        className="bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold p-1.5 px-3 rounded-lg outline-hidden cursor-pointer"
                      >
                        <option value="">-- Selecione uma mesa ativa --</option>
                        {TABLES.filter(t => activeOrderForTable(t)).map(t => (
                          <option key={t} value={t}>{t} ({activeOrderForTable(t)?.total.toFixed(2)} MT)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {checkoutTable && activeOrderForTable(checkoutTable) ? (
                    (() => {
                      const active = activeOrderForTable(checkoutTable)!;
                      const change = parseFloat(receivedCash.replace(',', '.')) - active.total;
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          
                          {/* Details breakdown (6 cols) */}
                          <div className="md:col-span-6 bg-gray-50 p-4 border border-gray-200 rounded-xl flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between border-b border-gray-250 pb-2 mb-3">
                                <div>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cupom Fiscal</span>
                                  <h4 className="text-sm font-extrabold text-gray-800">Pedido #{active.orderNumber}</h4>
                                </div>
                                <span className="bg-orange-50 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-orange-100">
                                  {checkoutTable}
                                </span>
                              </div>

                              <div className="space-y-2.5 max-h-[180px] overflow-y-auto mb-4 pr-1">
                                {active.items.map((it: CartItem) => (
                                  <div key={it.id} className="flex justify-between text-xs text-gray-600 gap-4">
                                    <span className="font-semibold truncate">{it.quantity}x {it.menuItem.name}</span>
                                    <span className="font-bold shrink-0">{((it.addedPrice) * it.quantity).toFixed(2)} MT</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-gray-250 pt-3 flex items-center justify-between">
                              <span className="text-xs font-extrabold text-gray-500">VALOR COBRADO</span>
                              <span className="text-xl font-black text-orange-500">{active.total.toFixed(2)} MT</span>
                            </div>
                          </div>

                          {/* Checkout Payments process (6 cols) */}
                          <div className="md:col-span-6 space-y-4">
                            
                            {/* Choose Method */}
                            <div>
                              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block mb-2">Forma de Pagamento</label>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedPayMethod('mpesa')}
                                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                                    selectedPayMethod === 'mpesa'
                                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-extrabold shadow-3xs'
                                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                  }`}
                                >
                                  <span className="text-sm">🇲🇿</span>
                                  <span className="text-[10px]">M-Pesa</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedPayMethod('emola')}
                                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                                    selectedPayMethod === 'emola'
                                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-extrabold shadow-3xs'
                                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                  }`}
                                >
                                  <span className="text-sm">🍊</span>
                                  <span className="text-[10px]">e-Mola</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => { setSelectedPayMethod('cash'); setReceivedCash(active.total.toFixed(2)); }}
                                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                                    selectedPayMethod === 'cash'
                                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-extrabold shadow-3xs'
                                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                  }`}
                                >
                                  <span className="text-sm">💵</span>
                                  <span className="text-[10px]">Dinheiro</span>
                                </button>
                              </div>
                            </div>

                            {/* Conditional cash calculator */}
                            {selectedPayMethod === 'cash' && (
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <label className="text-[11px] font-bold text-gray-600">Valor Entregue:</label>
                                  <input
                                    type="text"
                                    value={receivedCash}
                                    onChange={(e) => setReceivedCash(e.target.value)}
                                    placeholder="0,00 MT"
                                    className="bg-white border border-gray-300 rounded-md px-2 py-1 text-right text-xs font-bold focus:ring-1 focus:ring-orange-500 outline-hidden w-28"
                                  />
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                                  <span className="text-gray-500">Troco a devolver:</span>
                                  <span className={`font-black ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {change >= 0 ? `${change.toFixed(2)} MT` : 'Incompleto'}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Finalize checkout triggers Payment Record saving */}
                            <button
                              onClick={handleFinalizePayment}
                              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              Registrar Pagamento & Liberar Mesa
                            </button>

                          </div>

                        </div>
                      );
                    })()
                  ) : (
                    <div className="py-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center">
                      <span className="text-3xl mb-2">🍽️</span>
                      <p className="text-xs font-bold text-gray-800">Sem mesa de cobrança selecionada</p>
                      <p className="text-[11px] text-gray-450 mt-1">Utilize a caixa de seleção acima ou mude para "Pedidos por mesa" para acionar.</p>
                    </div>
                  )}
                </div>

                {/* Print thermal receipt simulator */}
                {closedReceipt && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-6 rounded-xl border border-dashed border-orange-350 shadow-md relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-500"></div>
                    
                    <div className="text-center font-mono text-xs text-gray-800 space-y-1 mb-4">
                      <h4 className="text-sm font-black tracking-widest text-orange-500">*** GASTROEXPRESS ***</h4>
                      <p>RUA OPERACIONAL TAKEAWAY, 3000</p>
                      <p>MOCK FISCAL - FECHAMENTO DE CONTA</p>
                      <p className="border-b border-dashed border-gray-300 py-1" />
                    </div>

                    <div className="font-mono text-xs text-gray-700 space-y-1.5">
                      <p><strong>CUPOM:</strong> {closedReceipt.orderNumber}</p>
                      <p><strong>MESA/LOCAL:</strong> {closedReceipt.tableNumber || 'Takeaway'}</p>
                      <p><strong>CLIENTE:</strong> {closedReceipt.customerName}</p>
                      <p><strong>DATA:</strong> {new Date(closedReceipt.paidAt).toLocaleString('pt-BR')}</p>
                      
                      <div className="border-b border-dashed border-gray-300 py-1" />
                      
                      <div className="flex justify-between font-bold text-gray-900 text-sm mt-2">
                        <span>PAGO INTEGRAL:</span>
                        <span>{closedReceipt.amount.toFixed(2)} MT</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>FORMA:</span>
                        <span className="uppercase">{closedReceipt.paymentMethod === 'mpesa' ? 'M-Pesa Celular' : closedReceipt.paymentMethod === 'emola' ? 'e-Mola Celular' : 'Dinheiro Físico'}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-dashed border-gray-300 text-center font-mono text-[10px] text-gray-400">
                      <p>Obrigado pela preferência e volte sempre!</p>
                      <p>GastroExpress Systems v2.0</p>
                      
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            window.print();
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-1.5 px-3 rounded-md font-sans text-[10px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Imprimir Simulação
                        </button>

                        <button
                          onClick={() => setClosedReceipt(null)}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-1.5 px-3 rounded-md font-sans text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Limpar Tela
                        </button>
                      </div>
                    </div>

                  </motion.div>
                )}

              </div>

              {/* Right Column (4 cols): Fast pdv stats & search Payment History */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Statistics panel */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span>Faturamento Geral</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] text-gray-400">Caixa Registrado Hoje</span>
                      <p className="text-2xl font-black text-gray-900">{calculatedMetrics.totalRev.toFixed(2)} MT</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-y border-gray-100 py-3">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Encerrados</span>
                        <span className="font-extrabold text-sm text-gray-800">{calculatedMetrics.count}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Média p/ Conta</span>
                        <span className="font-extrabold text-sm text-gray-800">{calculatedMetrics.averageVal.toFixed(2)} MT</span>
                      </div>
                    </div>

                    {/* Method share percent bars */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Distribuição do Caixa</span>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-gray-750">
                          <span>M-Pesa</span>
                          <span>{calculatedMetrics.mpesaPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: `${calculatedMetrics.mpesaPercent}%` }}></div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-gray-750">
                          <span>e-Mola</span>
                          <span>{calculatedMetrics.emolaPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${calculatedMetrics.emolaPercent}%` }}></div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-gray-750">
                          <span>Dinheiro</span>
                          <span>{calculatedMetrics.cashPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full" style={{ width: `${calculatedMetrics.cashPercent}%` }}></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* History Database list */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs flex-1 flex flex-col min-h-[300px]">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400 mb-3 block">Histórico de Contas</h3>
                  
                  {/* Search box */}
                  <div className="relative mb-3.5">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchPayment}
                      onChange={(e) => setSearchPayment(e.target.value)}
                      placeholder="Pesquisar cupom, mesa ou cliente..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-[350px] pr-1 flex-1">
                    {filteredPaymentHistory.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-12">Nenhum pagamento correspondente.</p>
                    ) : (
                      filteredPaymentHistory.map(pay => (
                        <div key={pay.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200/50 flex flex-col gap-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-gray-900">Cupom #{pay.orderNumber}</span>
                            <span className="font-black text-green-600">{pay.amount.toFixed(2)} MT</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>{pay.tableNumber || 'Takeaway'} - {pay.customerName}</span>
                            <span className="uppercase font-bold text-gray-500">{pay.paymentMethod === 'mpesa' ? 'M-Pesa' : pay.paymentMethod === 'emola' ? 'e-Mola' : 'Dinheiro'}</span>
                          </div>
                          <p className="text-[9px] text-gray-350 text-right mt-0.5">
                            {new Date(pay.paidAt).toLocaleTimeString('pt-BR')}  - {new Date(pay.paidAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 3: CONTROLE DE ESTOQUE */}
          {activeTab === 'estoque' && (
            <motion.div
              key="tab_estoque_key"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Left Column (8 cols): Ingredient database list */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs">
                  
                  {/* Top search & Filter info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
                    <div>
                      <h2 className="text-lg font-bold font-display text-gray-950 flex items-center gap-1.5">
                        <span>📦 Gestão de Insumos & Receitas</span>
                      </h2>
                      <p className="text-xs text-gray-400">Monitore o estoque disponível. Os insumos diminuem automaticamente a cada venda consumada.</p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchStock}
                        onChange={(e) => setSearchStock(e.target.value)}
                        placeholder="Filtrar ou buscar ingrediente..."
                        className="w-full bg-gray-150 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Stock Grid table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-250/60 pb-2 text-gray-400 font-extrabold uppercase tracking-wide text-[10px]">
                          <th className="py-2.5">Insumo</th>
                          <th className="py-2.5 text-center">Nível Atual</th>
                          <th className="py-2.5 text-center">Estoque de Segurança</th>
                          <th className="py-2.5 text-center">Ações de Reforço</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {filteredStockList.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-gray-450">Nenhum insumo localizado.</td>
                          </tr>
                        ) : (
                          filteredStockList.map(stockItem => {
                            const status = getStockStatus(stockItem);
                            const fillPercent = Math.min(100, (stockItem.quantity / (stockItem.minLimit * 3.5)) * 100);
                            
                            return (
                              <tr key={stockItem.id} className="hover:bg-gray-50/50 transition-all">
                                <td className="py-3">
                                  <span className="font-extrabold text-gray-900 block">{stockItem.name}</span>
                                  <span className="text-[10px] text-gray-400 capitalize">{stockItem.unit}</span>
                                </td>

                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5 justify-center">
                                    <span className="font-black text-gray-800 text-sm">
                                      {stockItem.quantity}
                                    </span>
                                    <span className={`text-[8.5px] font-black px-1.5 rounded-sm uppercase tracking-widest ${status.color}`}>
                                      {status.label}
                                    </span>
                                  </div>
                                  
                                  {/* fill percent bar */}
                                  <div className="w-24 mx-auto bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                                    <div className={`h-full rounded-full ${
                                      status.label === 'Esgotado' ? 'bg-red-500' :
                                      status.label === 'Crítico' ? 'bg-amber-500' : 'bg-green-500'
                                    }`} style={{ width: `${fillPercent}%` }}></div>
                                  </div>
                                </td>

                                <td className="py-3 text-center text-gray-700 font-semibold">
                                  {stockItem.minLimit} <span className="text-[10px] text-gray-400">{stockItem.unit}</span>
                                </td>

                                <td className="py-3 text-center">
                                  <button
                                    onClick={() => {
                                      setSelectedStockId(stockItem.id);
                                      setAddStockAmount('20');
                                    }}
                                    className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-800 hover:border-orange-500 hover:text-orange-600 bg-white font-extrabold text-[10px] transition-all cursor-pointer"
                                  >
                                    ⚡ Reabastecer
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>

              {/* Right Column (4 cols): Quick replenishment modal & New insert */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Instant replenishment popover */}
                {selectedStockId && (() => {
                  const item = stockItems.find(s => s.id === selectedStockId)!;
                  if (!item) return null;
                  
                  return (
                    <div className="bg-white p-5 rounded-xl border border-orange-255 shadow-xs bg-orange-50/20">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-4">
                        <h4 className="text-xs font-black uppercase text-orange-600">⚡ Abastecer Insumo</h4>
                        <button onClick={() => setSelectedStockId(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <p className="text-gray-400 text-[11px]">Produto alvo:</p>
                          <h5 className="font-extrabold text-sm text-gray-900">{item.name}</h5>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-400 block mb-1">Escolha um valor pré-definido:</label>
                          <div className="flex gap-1.5">
                            {['10', '25', '50', '100'].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setAddStockAmount(val)}
                                className={`px-2.5 py-1.5 rounded-md border text-[11px] font-bold ${
                                  addStockAmount === val
                                    ? 'border-orange-500 bg-orange-500 text-white'
                                    : 'border-gray-200 bg-white hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                +{val}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-400 block mb-1">Ou digite o total específico:</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={addStockAmount}
                              onChange={(e) => setAddStockAmount(e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-bold focus:ring-1 focus:ring-orange-500 outline-hidden w-full text-right"
                            />
                            <span className="text-[11px] text-gray-500 flex items-center font-bold capitalize">{item.unit}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleReplenishStock(item)}
                          className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-lg transition-all shadow-xs cursor-pointer text-center"
                        >
                          Confirmar Reabastecimento
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Create Stock custom item */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-3xs">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400 mb-4 block">Cadastrar Novo Insumo</h3>

                  <form onSubmit={handleCreateStockItem} className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Nome do Ingrediente:</label>
                      <input
                        type="text"
                        value={newStockName}
                        onChange={(e) => setNewStockName(e.target.value)}
                        placeholder="Ex: Queijo Coalho / Bacon Cubo"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-orange-500 outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">Unidade:</label>
                        <select
                          value={newStockUnit}
                          onChange={(e) => setNewStockUnit(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-hidden cursor-pointer"
                        >
                          <option value="unidades">Unidades</option>
                          <option value="fatias">Fatias</option>
                          <option value="kg">Quilogramas (kg)</option>
                          <option value="gramas">Gramas (g)</option>
                          <option value="litros">Litros (l)</option>
                          <option value="garrafas">Garrafas</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">Estoque Inicial:</label>
                        <input
                          type="number"
                          value={newStockQty}
                          onChange={(e) => setNewStockQty(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-right focus:ring-1 focus:ring-orange-500 outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">Limite Segurança (Crítico):</label>
                      <input
                        type="number"
                        value={newStockMin}
                        onChange={(e) => setNewStockMin(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-right focus:ring-1 focus:ring-orange-500 outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-extrabold rounded-lg transition-all hover:scale-101 cursor-pointer"
                    >
                      Cadastrar Insumo
                    </button>
                  </form>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 4: DISPONIBILIDADE DO CARDÁPIO */}
          {activeTab === 'cardapio' && (
            <motion.div
              key="tab_cardapio_key"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-3xs"
            >
              <div className="pb-4 border-b border-gray-100 mb-6 col-span-12">
                <h2 className="text-lg font-bold font-display text-gray-950">🍕 Gerenciamento do Cardápio de Vendas</h2>
                <p className="text-xs text-gray-400">Ative ou pause temporariamente produtos para os canais de atendimento por falta ou escolha operacional.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => {
                  const hasStockIssues = !checkStockForMenuItem(item, 1).available;
                  
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all ${
                        item.available
                          ? 'border-gray-200 opacity-100'
                          : 'border-red-200 bg-red-50/5 opacity-80'
                      }`}
                    >
                      <div>
                        <div className="flex gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-150"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{item.category}</span>
                            <h4 className="font-extrabold text-sm text-gray-900 mt-1">{item.name}</h4>
                            <p className="font-black text-orange-500 text-xs">{item.price.toFixed(2)} MT</p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-2.5 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-gray-400">Status dos Insumos</span>
                          {hasStockIssues ? (
                            <span className="text-red-500 font-extrabold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              Ingredientes Críticos!
                            </span>
                          ) : (
                            <span className="text-green-600 font-bold">🟢 Disponível p/ Preparo</span>
                          )}
                        </div>

                        {/* toggle availability logic */}
                        <button
                          onClick={() => {
                            const updated = menuItems.map(m => {
                              if (m.id === item.id) {
                                return { ...m, available: !m.available };
                              }
                              return m;
                            });
                            setMenuItems(updated);
                            // Push back update
                            localStorage.setItem('takeaway_menu_items_list', JSON.stringify(updated));
                            showToast(`Disponibilidade de "${item.name}" atualizada!`, 'success');
                          }}
                          className={`px-3 py-1.5 rounded-lg font-extrabold text-[10px] cursor-pointer transition-all ${
                            item.available
                              ? 'bg-red-50 hover:bg-red-100 text-red-700'
                              : 'bg-green-100 hover:bg-green-150 text-green-700'
                          }`}
                        >
                          {item.available ? 'Pausar Venda' : 'Ativar Venda'}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* MODAL / BOTTOM SLIDE-UP FOR OPTIONS CUSTOMIZER */}
      <AnimatePresence>
        {activeCustomizingItem && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-3xs z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200"
            >
              
              {/* Image banner inside modal */}
              {activeCustomizingItem.image && (
                <div className="h-40 w-full relative">
                  <img
                    src={activeCustomizingItem.image}
                    alt={activeCustomizingItem.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                  <button
                    onClick={() => setActiveCustomizingItem(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800 transition-all cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-orange-400 font-display">Ajustar Detalhes</h3>
                    <h2 className="text-base font-bold truncate leading-tight">{activeCustomizingItem.name}</h2>
                  </div>
                </div>
              )}

              {/* Options selectors content */}
              <div className="p-5 space-y-4">
                {activeCustomizingItem.options && activeCustomizingItem.options.length > 0 ? (
                  activeCustomizingItem.options.map(opt => (
                    <div key={opt.name} className="space-y-1.5 text-xs">
                      <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[10px]">{opt.name}</h4>
                      
                      <div className="grid grid-cols-1 gap-1.5">
                        {opt.choices.map(choiceObj => {
                          const isSelected = modalOptions[opt.name]?.choice === choiceObj.name;
                          return (
                            <button
                              key={choiceObj.name}
                              type="button"
                              onClick={() => {
                                setModalOptions({
                                  ...modalOptions,
                                  [opt.name]: { choice: choiceObj.name, extraPrice: choiceObj.extraPrice }
                                });
                              }}
                              className={`p-2 rounded-lg border text-left flex justify-between items-center cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-orange-500 bg-orange-50/50 text-orange-700 font-bold'
                                  : 'border-gray-200 hover:border-gray-200'
                              }`}
                            >
                              <span>{choiceObj.name}</span>
                              {choiceObj.extraPrice > 0 && (
                                <span className="text-[10px] bg-orange-100 text-orange-850 px-1.5 py-0.2 rounded-sm shrink-0">
                                  + {choiceObj.extraPrice.toFixed(2)} MT
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Este item não possui personalizações adicionais.</p>
                )}

                {/* Final customization price & confirm */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-5">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold">VALOR FINAL</span>
                    <span className="text-lg font-black text-orange-500">
                      {(() => {
                        const basePrice = activeCustomizingItem.price;
                        const optionArr = Object.values(modalOptions) as { choice: string; extraPrice: number }[];
                        const extras = optionArr.reduce((sum, opt) => sum + opt.extraPrice, 0);
                        return (basePrice + extras).toFixed(2);
                      })()} MT
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveCustomizingItem(null)}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCustomization}
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-black transition-all shadow-xs cursor-pointer"
                    >
                      Confirmar Lançamento
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REAL-TIME SYSTEM TOAST NOTIFICATIONS */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none max-w-sm w-full font-sans" id="toast_container">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className={`backdrop-blur-md p-4 rounded-xl shadow-2xl border flex items-start gap-3 pointer-events-auto ${
                toast.type === 'warn'
                  ? 'bg-amber-900/95 border-amber-800 text-white'
                  : toast.type === 'info'
                    ? 'bg-gray-900/95 border-gray-800 text-white'
                    : 'bg-green-950/95 border-green-900 text-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === 'warn' ? 'bg-amber-500' : toast.type === 'info' ? 'bg-orange-500' : 'bg-green-500'
              }`}>
                {toast.type === 'warn' ? (
                  <AlertTriangle className="w-4 h-4 text-white" />
                ) : (
                  <ChefHat className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold">Notificação do Gerente</p>
                <p className="text-gray-200 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* COMPACT FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-5 text-center text-xs text-gray-400 mt-12 shrink-0">
        <p>© 2026 GastroExpress POS & Estoque. Sistema unificado de alta performance com persistência protegida.</p>
      </footer>
    </div>
  );
}
