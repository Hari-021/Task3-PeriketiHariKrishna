import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import { Plus, Trash2, Eye, ClipboardList, AlertCircle, ShoppingBag, PlusCircle, MinusCircle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState({ message: '', type: '' });

  // Modal controls
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // Array of { menu_id, name, price, quantity }
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchOrdersAndMenu();
  }, []);

  const fetchOrdersAndMenu = async () => {
    try {
      setLoading(true);
      const [ordersRes, menuRes] = await Promise.all([
        api.get('/orders'),
        api.get('/menu')
      ]);
      setOrders(ordersRes.data);
      // Filter menu items to only show available items for order placement
      setMenuItems(menuRes.data.filter(item => item.available));
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to retrieve orders and menu details from the backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerNotification = (message, type) => {
    setNotify({ message, type });
  };

  const handleOpenCreateModal = () => {
    setCustomerName('');
    setTableNumber('');
    setSelectedItems([]);
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleAddItemToOrder = (menuItem) => {
    const existing = selectedItems.find(item => item.menu_id === menuItem.id);
    if (existing) {
      setSelectedItems(selectedItems.map(item => 
        item.menu_id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        menu_id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
  };

  const handleUpdateQuantity = (menuId, delta) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.menu_id === menuId) {
        const newQty = item.quantity + delta;
        return newQty >= 1 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleRemoveItem = (menuId) => {
    setSelectedItems(selectedItems.filter(item => item.menu_id !== menuId));
  };

  const calculateOrderTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const validateOrderForm = () => {
    const errors = {};
    if (!customerName.trim()) {
      errors.customerName = 'Customer name is required.';
    }
    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum <= 0) {
      errors.tableNumber = 'Table number must be positive.';
    }
    if (selectedItems.length === 0) {
      errors.items = 'Select at least one menu item.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (!validateOrderForm()) return;

    const payload = {
      customer_name: customerName.trim(),
      table_number: parseInt(tableNumber),
      items: selectedItems.map(item => ({
        menu_id: item.menu_id,
        quantity: item.quantity
      }))
    };

    try {
      const res = await api.post('/orders', payload);
      setOrders([res.data, ...orders]);
      triggerNotification(`Order #${res.data.id} placed successfully.`, 'success');
      setIsCreateOpen(false);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || 'Failed to place order.';
      triggerNotification(msg, 'error');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? res.data : o));
      triggerNotification(`Order #${orderId} status updated to: ${newStatus}`, 'success');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to update order status.', 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) return;

    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(orders.filter(o => o.id !== orderId));
      triggerNotification(`Order #${orderId} has been deleted.`, 'success');
      setIsDetailsOpen(false);
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to delete order from the database.', 'error');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Preparing':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Served':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Notification message={notify.message} type={notify.type} onClose={() => setNotify({ message: '', type: '' })} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-wide">Order Management</h2>
          <p className="text-xs text-slate-400 mt-1">Create tickets, track kitchen status, and close customer bills.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 active:bg-orange-750 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-150 shadow-sm shadow-orange-600/10 self-start sm:self-center"
        >
          <Plus size={14} />
          <span>New Order</span>
        </button>
      </div>

      {/* Orders List Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-3">
          <div className="w-8 h-8 border-2 border-t-orange-500 border-slate-800 rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading active queue...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800/30">
          <div className="p-3 bg-slate-900/40 text-slate-650 rounded-xl inline-block mb-3">
            <ClipboardList size={22} />
          </div>
          <h4 className="font-bold text-slate-300 text-sm">No orders registered</h4>
          <p className="text-slate-500 text-xs mt-1">Click "New Order" above to place your first ticket.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800/30 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-900/30 text-slate-500 uppercase tracking-widest text-[9px]">
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Table</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Placed At</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30 text-slate-350">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-orange-400">#{order.id}</td>
                    <td className="px-6 py-3.5 text-slate-200">{order.customer_name}</td>
                    <td className="px-6 py-3.5 text-slate-400">Table {order.table_number}</td>
                    <td className="px-6 py-3.5 text-slate-100 font-bold">${order.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide cursor-pointer focus:outline-none ${getStatusStyle(order.status)}`}
                      >
                        <option value="Pending" className="bg-slate-950 text-amber-400">Pending</option>
                        <option value="Preparing" className="bg-slate-950 text-blue-400">Preparing</option>
                        <option value="Served" className="bg-slate-950 text-purple-400">Served</option>
                        <option value="Completed" className="bg-slate-950 text-emerald-400">Completed</option>
                        <option value="Cancelled" className="bg-slate-950 text-rose-450">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-normal">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent transition-all duration-150"
                          title="View Order Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 rounded-lg text-slate-450 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all duration-150"
                          title="Delete Order"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Placement Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Place New Customer Order"
      >
        <form onSubmit={handlePlaceOrderSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 uppercase tracking-wider text-[10px]">Customer Name *</label>
              <input
                type="text"
                placeholder="e.g. Charlie"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-700 focus:outline-none ${
                  formErrors.customerName ? 'border-rose-500/50' : 'border-slate-800 focus:border-orange-500/30'
                }`}
              />
              {formErrors.customerName && (
                <p className="text-rose-450 text-[10px] mt-0.5 font-bold uppercase tracking-wider">{formErrors.customerName}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 uppercase tracking-wider text-[10px]">Table Number *</label>
              <input
                type="number"
                placeholder="e.g. 12"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-700 focus:outline-none ${
                  formErrors.tableNumber ? 'border-rose-500/50' : 'border-slate-800 focus:border-orange-500/30'
                }`}
              />
              {formErrors.tableNumber && (
                <p className="text-rose-450 text-[10px] mt-0.5 font-bold uppercase tracking-wider">{formErrors.tableNumber}</p>
              )}
            </div>
          </div>

          {/* Dishes & Basket */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/40 pt-3.5">
            {/* Dish list picker */}
            <div className="space-y-2">
              <label className="text-slate-400 uppercase tracking-wider text-[10px]">Menu Selection</label>
              {menuItems.length === 0 ? (
                <p className="text-slate-600 font-semibold italic text-[10px] pt-2">No items are currently active. Add menu items first.</p>
              ) : (
                <div className="max-h-[150px] overflow-y-auto border border-slate-800 bg-slate-950 rounded-xl divide-y divide-slate-900 overflow-x-hidden">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddItemToOrder(item)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-900/40 transition-colors flex items-center justify-between text-[11px] group"
                    >
                      <div className="pr-2 truncate">
                        <p className="font-bold text-slate-200 truncate group-hover:text-orange-400 transition-colors">{item.name}</p>
                        <p className="text-[9px] text-slate-550">{item.category}</p>
                      </div>
                      <span className="font-bold text-orange-400 bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10 shrink-0">
                        ${item.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shopping Basket */}
            <div className="space-y-2">
              <label className="text-slate-400 uppercase tracking-wider text-[10px]">Selected Items</label>
              {selectedItems.length === 0 ? (
                <div className="h-[150px] border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 p-4 text-center select-none">
                  <ShoppingBag size={16} className="mb-1 text-slate-600" />
                  <p className="text-[9px] font-bold uppercase tracking-wider">Basket Empty</p>
                </div>
              ) : (
                <div className="max-h-[150px] overflow-y-auto border border-slate-800 bg-slate-950 rounded-xl divide-y divide-slate-900">
                  {selectedItems.map((item) => (
                    <div key={item.menu_id} className="px-3 py-1.5 flex items-center justify-between text-[11px]">
                      <div className="pr-2 truncate">
                        <p className="font-bold text-slate-200 truncate">{item.name}</p>
                        <p className="text-[9px] text-slate-500">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.menu_id, -1)}
                          className="text-slate-500 hover:text-orange-400 transition-colors"
                        >
                          <MinusCircle size={13} />
                        </button>
                        <span className="w-4 text-center font-bold text-slate-200 text-[10px]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.menu_id, 1)}
                          className="text-slate-500 hover:text-orange-400 transition-colors"
                        >
                          <PlusCircle size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.menu_id)}
                          className="ml-1 text-slate-600 hover:text-rose-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {formErrors.items && (
            <p className="text-rose-450 text-[10px] font-bold uppercase tracking-wider">{formErrors.items}</p>
          )}

          {/* Grand total summary */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-slate-450 text-[10px] uppercase tracking-wider font-extrabold">Estimated Total</span>
            <span className="text-base font-black text-orange-400">${calculateOrderTotal().toFixed(2)}</span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/40">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-all duration-150 text-[10px] font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-all duration-150 text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-orange-600/10"
            >
              Place Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedOrder ? `Order Receipt: #${selectedOrder.id}` : ''}
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs font-semibold">
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-3.5 bg-slate-950 p-4 border border-slate-800/80 rounded-xl">
              <div>
                <p className="text-slate-500 uppercase tracking-widest text-[8px]">Client</p>
                <p className="text-slate-200 font-bold text-sm mt-0.5">{selectedOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-widest text-[8px]">Table</p>
                <p className="text-slate-200 font-bold text-sm mt-0.5">Table {selectedOrder.table_number}</p>
              </div>
              <div className="mt-1">
                <p className="text-slate-500 uppercase tracking-widest text-[8px]">Placed At</p>
                <p className="text-slate-400 font-medium text-[11px] mt-0.5">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <div className="mt-1">
                <p className="text-slate-500 uppercase tracking-widest text-[8px]">Current Status</p>
                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase mt-1 ${getStatusStyle(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Selected items receipt */}
            <div className="space-y-1.5">
              <h4 className="text-slate-400 uppercase tracking-widest text-[8px]">Items Bill</h4>
              <div className="border border-slate-850 bg-slate-950 rounded-xl divide-y divide-slate-900/60 overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-[11px]">
                    <div>
                      <p className="font-bold text-slate-200">{item.menu_item?.name || `Dish (ID: ${item.menu_id})`}</p>
                      <p className="text-[9px] text-slate-500">${item.menu_item?.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-200">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total balance */}
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-450 uppercase tracking-wider font-extrabold">Bill Balance</span>
              <span className="text-base font-black text-orange-400">${selectedOrder.total_amount.toFixed(2)}</span>
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800/40">
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-500/20 bg-rose-500/5 text-rose-450 hover:bg-rose-500/10 rounded-xl transition-all duration-150 text-[9px] font-extrabold uppercase tracking-wider"
              >
                <Trash2 size={11} />
                <span>Delete Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all duration-150 text-[10px] font-bold uppercase tracking-wider"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
