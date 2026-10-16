import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Search,
  Filter,
  Edit,
  Copy,
  Eye,
  Archive,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  Flame,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';

export const MenuItemsPage: React.FC = () => {
  const {
    menuItems,
    menuCategories,
    modifierGroups,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDiet, setSelectedDiet] = useState('All');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MenuItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(menuCategories[0]?.id || 'cat-1');
  const [price, setPrice] = useState<number>(350);
  const [taxRate, setTaxRate] = useState<number>(5);
  const [prepStation, setPrepStation] = useState<MenuItem['prepStation']>('Main Kitchen');
  const [isAvailable, setIsAvailable] = useState(true);
  const [dietaryTags, setDietaryTags] = useState<MenuItem['dietaryTags']>(['Vegetarian']);
  const [allergens, setAllergens] = useState<string[]>(['Dairy']);
  const [image, setImage] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [selectedModifierIds, setSelectedModifierIds] = useState<string[]>([]);

  const filteredItems = menuItems.filter(item => {
    if (item.isArchived) return false;
    if (selectedCategory !== 'All' && item.categoryId !== selectedCategory) return false;
    if (selectedDiet !== 'All' && !item.dietaryTags.includes(selectedDiet as any)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setSku(`ITEM-${Math.floor(Math.random() * 900 + 100)}`);
    setDescription('');
    setCategoryId(menuCategories[0]?.id || 'cat-1');
    setPrice(350);
    setTaxRate(5);
    setPrepStation('Main Kitchen');
    setIsAvailable(true);
    setDietaryTags(['Vegetarian']);
    setAllergens([]);
    setImage('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80');
    setPrepTimeMinutes(15);
    setSelectedModifierIds([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setSku(item.sku);
    setDescription(item.description);
    setCategoryId(item.categoryId);
    setPrice(item.price);
    setTaxRate(item.taxRate);
    setPrepStation(item.prepStation);
    setIsAvailable(item.isAvailable);
    setDietaryTags(item.dietaryTags);
    setAllergens(item.allergens);
    setImage(item.image);
    setPrepTimeMinutes(item.prepTimeMinutes);
    setSelectedModifierIds(item.modifierGroupIds || []);
    setIsFormOpen(true);
  };

  const handleDuplicate = (item: MenuItem) => {
    addMenuItem({
      name: `${item.name} (Copy)`,
      sku: `${item.sku}-COPY`,
      description: item.description,
      categoryId: item.categoryId,
      price: item.price,
      taxRate: item.taxRate,
      prepStation: item.prepStation,
      isAvailable: true,
      dietaryTags: item.dietaryTags,
      allergens: item.allergens,
      image: item.image,
      prepTimeMinutes: item.prepTimeMinutes,
      modifierGroupIds: item.modifierGroupIds,
      displayOrder: item.displayOrder + 1
    });
    alert(`Duplicated ${item.name}!`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim(),
        categoryId,
        price,
        taxRate,
        prepStation,
        isAvailable,
        dietaryTags,
        allergens,
        image: image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
        prepTimeMinutes,
        modifierGroupIds: selectedModifierIds
      });
    } else {
      addMenuItem({
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim(),
        categoryId,
        price,
        taxRate,
        prepStation,
        isAvailable,
        dietaryTags,
        allergens,
        image: image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
        prepTimeMinutes,
        modifierGroupIds: selectedModifierIds,
        displayOrder: menuItems.length + 1
      });
    }

    setIsFormOpen(false);
  };

  const toggleDietTag = (tag: MenuItem['dietaryTags'][number]) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter(t => t !== tag));
    } else {
      setDietaryTags([...dietaryTags, tag]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Menu Items Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Maintain culinary inventory, prices, prep stations, recipes, and real-time 86'd sold out toggles
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dish or SKU..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
          >
            <option value="All">All Categories</option>
            {menuCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedDiet}
            onChange={(e) => setSelectedDiet(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none"
          >
            <option value="All">All Diets</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Chef Special">Chef Special</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Prep Station</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Diet & Allergens</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map(item => {
                const catName = menuCategories.find(c => c.id === item.categoryId)?.name || 'General';

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-[10px] text-gray-400 max-w-xs truncate">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500">{item.sku}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{catName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[10px]">
                        {item.prepStation}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-gray-900">₹{item.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.dietaryTags.map(t => (
                          <span
                            key={t}
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              t === 'Vegetarian' ? 'bg-green-50 text-green-800' :
                              t === 'Non-Veg' ? 'bg-red-50 text-red-800' :
                              'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleMenuItemAvailability(item.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.isAvailable
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Sold Out (86)'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded"
                          title="Preview Item Card"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(item)}
                          className="p-1 text-gray-400 hover:text-[#f5764b] rounded"
                          title="Duplicate Item"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 text-[#f5764b] hover:text-orange-950 rounded"
                          title="Edit Item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Archive Dish"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30  overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-base text-gray-900">
                {editingItem ? 'Edit Culinary Menu Item' : 'Add New Menu Item'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Murgh Makhani"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">SKU / Item Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Gourmet dish description for menus..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    {menuCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Prep Station</label>
                  <select
                    value={prepStation}
                    onChange={(e) => setPrepStation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Main Kitchen">Main Kitchen</option>
                    <option value="Tandoor & Grill">Tandoor & Grill</option>
                    <option value="Drinks & Bar">Drinks & Bar</option>
                    <option value="Dessert & Bakery">Dessert & Bakery</option>
                    <option value="Pantry">Pantry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              {/* Dietary Tags */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">Dietary Classifications</label>
                <div className="flex flex-wrap gap-2">
                  {(['Vegetarian', 'Non-Veg', 'Vegan', 'Gluten-Free', 'Chef Special'] as const).map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleDietTag(tag)}
                      className={`px-3 py-1 rounded-full font-bold border transition-colors ${
                        dietaryTags.includes(tag) ? 'bg-[#f5764b] text-white border-[#f5764b]' : 'bg-gray-50 text-gray-600 border-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modifiers Linked */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">Linked Modifier Groups</label>
                <div className="grid grid-cols-2 gap-2">
                  {modifierGroups.map(grp => (
                    <label key={grp.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedModifierIds.includes(grp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModifierIds([...selectedModifierIds, grp.id]);
                          } else {
                            setSelectedModifierIds(selectedModifierIds.filter(id => id !== grp.id));
                          }
                        }}
                      />
                      <span className="font-medium text-gray-800">{grp.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold shadow-xs"
                >
                  Save Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Preview Card Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            <img src={previewItem.image} alt={previewItem.name} className="w-full h-48 object-cover" />
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-extrabold text-sm text-gray-900">{previewItem.name}</h3>
                <span className="font-black text-sm text-orange-950">₹{previewItem.price}</span>
              </div>
              <p className="text-xs text-gray-500">{previewItem.description}</p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-green-50 text-green-800 font-bold text-[10px]">
                  {previewItem.dietaryTags.join(', ')}
                </span>
                <span className="text-gray-400 font-mono text-[10px]">Prep: {previewItem.prepTimeMinutes} mins</span>
              </div>
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50 text-right">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
