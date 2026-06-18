import React, { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import { Plus, Edit3, Trash2, Search, Filter, AlertTriangle } from 'lucide-react';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Notification States
  const [notify, setNotify] = useState({ message: '', type: '' });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/menu');
      setItems(res.data);
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to retrieve menu items from backend server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerNotification = (message, type) => {
    setNotify({ message, type });
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      available: true
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      available: item.available
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Menu item name is required.';
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Price must be a positive number greater than 0.';
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: parseFloat(formData.price),
      category: formData.category.trim(),
      available: formData.available
    };

    try {
      if (editingItem) {
        const res = await api.put(`/menu/${editingItem.id}`, payload);
        setItems(items.map(item => item.id === editingItem.id ? res.data : item));
        triggerNotification(`Updated menu item: "${res.data.name}"`, 'success');
      } else {
        const res = await api.post('/menu', payload);
        setItems([...items, res.data]);
        triggerNotification(`Created new menu item: "${res.data.name}"`, 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || 'An error occurred during submission.';
      triggerNotification(msg, 'error');
    }
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will delete the item from the menu database.`)) return;

    try {
      await api.delete(`/menu/${id}`);
      setItems(items.filter(item => item.id !== id));
      triggerNotification(`Deleted menu item: "${name}"`, 'success');
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to delete menu item. Enforce that it is not in use.', 'error');
    }
  };

  const categories = ['All', ...new Set(items.map(item => item.category))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Notification message={notify.message} type={notify.type} onClose={() => setNotify({ message: '', type: '' })} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-wide">Menu Management</h2>
          <p className="text-xs text-slate-400 mt-1">Add, update, or remove menu items with full validation controls.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 active:bg-orange-750 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-150 shadow-sm shadow-orange-600/10 self-start sm:self-center"
        >
          <Plus size={14} />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/30 border border-slate-800/60 focus:outline-none focus:border-orange-500/40 text-slate-200 text-xs font-semibold placeholder-slate-600 transition-colors"
          />
        </div>

        {/* Categories filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none select-none">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mr-1 flex items-center gap-1">
            <Filter size={10} />
            Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all duration-150 border ${
                selectedCategory === cat
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                  : 'bg-slate-900/10 border-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-3">
          <div className="w-8 h-8 border-2 border-t-orange-500 border-slate-800 rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800/30">
          <div className="p-3 bg-slate-900/40 text-slate-600 rounded-xl inline-block mb-3">
            <Search size={22} />
          </div>
          <h4 className="font-bold text-slate-300 text-sm">No items found</h4>
          <p className="text-slate-500 text-xs mt-1">Try a different search query or select another category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl border border-slate-800/30 overflow-hidden flex flex-col justify-between">
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900/50 text-orange-400 tracking-wider border border-orange-500/10">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-slate-100 text-sm mt-2 leading-snug">{item.name}</h3>
                  </div>
                  <span className="text-xs font-black text-orange-400 bg-orange-500/5 px-2.5 py-1 rounded-lg border border-orange-500/10">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[2.5rem]">
                  {item.description || 'No ingredients or descriptions listed.'}
                </p>
              </div>

              {/* Card Actions Footer */}
              <div className="px-5 py-2.5 border-t border-slate-800/40 bg-slate-900/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 border border-transparent transition-all duration-150"
                    title="Edit Item"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all duration-150"
                    title="Delete Item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Menu Item Details' : 'Create New Menu Item'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">
          {/* Name field */}
          <div className="space-y-1">
            <label className="text-slate-400 uppercase tracking-wider text-[10px]">Item Name *</label>
            <input
              type="text"
              placeholder="e.g. Lobster Thermidor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-700 focus:outline-none ${
                formErrors.name ? 'border-rose-500/50' : 'border-slate-800 focus:border-orange-500/30'
              }`}
            />
            {formErrors.name && (
              <p className="text-rose-450 text-[10px] mt-0.5 font-bold uppercase tracking-wider">{formErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-slate-400 uppercase tracking-wider text-[10px]">Category *</label>
              <input
                type="text"
                placeholder="e.g. Entrées"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-700 focus:outline-none ${
                  formErrors.category ? 'border-rose-500/50' : 'border-slate-800 focus:border-orange-500/30'
                }`}
              />
              {formErrors.category && (
                <p className="text-rose-450 text-[10px] mt-0.5 font-bold uppercase tracking-wider">{formErrors.category}</p>
              )}
            </div>

            {/* Price field */}
            <div className="space-y-1">
              <label className="text-slate-400 uppercase tracking-wider text-[10px]">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-700 focus:outline-none ${
                  formErrors.price ? 'border-rose-500/50' : 'border-slate-800 focus:border-orange-500/30'
                }`}
              />
              {formErrors.price && (
                <p className="text-rose-450 text-[10px] mt-0.5 font-bold uppercase tracking-wider">{formErrors.price}</p>
              )}
            </div>
          </div>

          {/* Description field */}
          <div className="space-y-1">
            <label className="text-slate-400 uppercase tracking-wider text-[10px]">Description</label>
            <textarea
              placeholder="List allergens, serving size, cooking specifications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-orange-500/30 resize-none font-normal"
            />
          </div>

          {/* Availability field */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 select-none">
            <div>
              <p className="text-slate-200 text-xs font-bold uppercase tracking-wider">Available for Order</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Toggle availability status for POS clients</p>
            </div>
            <input
              type="checkbox"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-4 h-4 rounded text-orange-650 bg-slate-900 border-slate-800 focus:ring-orange-500 focus:ring-offset-slate-950"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/40">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-all duration-150 text-[10px] font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-all duration-150 text-[10px] font-bold uppercase tracking-wider"
            >
              {editingItem ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
