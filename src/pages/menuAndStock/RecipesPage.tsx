import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Calculator,
  CheckCircle2,
  Boxes,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Recipe, RecipeIngredient } from '../../types';

export const RecipesPage: React.FC = () => {
  const { recipes, menuItems, inventory, addRecipe, updateRecipe } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Form State
  const [menuItemId, setMenuItemId] = useState(menuItems[0]?.id || '');
  const [servings, setServings] = useState(1);
  const [prepNotes, setPrepNotes] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  // Ingredient picker
  const [selectedStockId, setSelectedStockId] = useState(inventory[0]?.id || '');
  const [ingredientQty, setIngredientQty] = useState(0.1);
  const [ingredientUnit, setIngredientUnit] = useState('kg');

  const handleOpenAdd = () => {
    setEditingRecipe(null);
    setMenuItemId(menuItems[0]?.id || '');
    setServings(1);
    setPrepNotes('');
    setIngredients([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: Recipe) => {
    setEditingRecipe(rec);
    setMenuItemId(rec.menuItemId);
    setServings(rec.yieldServings);
    setPrepNotes(rec.preparationNotes || '');
    setIngredients(rec.ingredients);
    setModalOpen(true);
  };

  const handleAddIngredient = () => {
    const stockItem = inventory.find(i => i.id === selectedStockId);
    if (!stockItem || ingredientQty <= 0) return;

    setIngredients(prev => [
      ...prev,
      {
        inventoryItemId: stockItem.id,
        quantity: ingredientQty,
        unit: stockItem.unit
      }
    ]);
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  // Cost calculator
  const calculateEstimatedCost = (ings: RecipeIngredient[]) => {
    return ings.reduce((sum, ing) => {
      const stock = inventory.find(i => i.id === ing.inventoryItemId);
      if (!stock) return sum;
      return sum + (stock.unitCost * ing.quantity);
    }, 0);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const menuItem = menuItems.find(m => m.id === menuItemId);
    if (!menuItem || ingredients.length === 0) {
      alert('Please select a menu item and add at least one ingredient.');
      return;
    }

    const estimatedCost = +calculateEstimatedCost(ingredients).toFixed(2);

    if (editingRecipe) {
      updateRecipe({
        ...editingRecipe,
        menuItemId,
        menuItemName: menuItem.name,
        yieldServings: servings,
        ingredients,
        preparationNotes: prepNotes,
        estimatedCost
      });
    } else {
      addRecipe({
        menuItemId,
        menuItemName: menuItem.name,
        yieldServings: servings,
        ingredients,
        preparationNotes: prepNotes,
        estimatedCost,
        status: 'Active'
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Recipes & Ingredient Yields
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Map menu items to raw warehouse ingredients for automated inventory depletion and food cost calculation
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Recipe</span>
        </button>
      </div>

      {/* Recipes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map(recipe => {
          const menuItem = menuItems.find(m => m.id === recipe.menuItemId);
          const sellingPrice = menuItem?.price || 0;
          const cost = recipe.estimatedCost || calculateEstimatedCost(recipe.ingredients);
          const margin = sellingPrice > 0 ? Math.round(((sellingPrice - cost) / sellingPrice) * 100) : 0;

          return (
            <div
              key={recipe.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{recipe.menuItemName}</h3>
                  <p className="text-[11px] text-gray-500">
                    Yield: {recipe.yieldServings} portion{recipe.yieldServings > 1 ? 's' : ''} • Selling Price: <span className="font-bold text-gray-800">₹{sellingPrice}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-orange-950">Cost: ₹{cost.toFixed(2)}</span>
                  <span className="block text-[10px] text-green-700 font-bold">{margin}% Gross Margin</span>
                </div>
              </div>

              {/* Ingredients list */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">Raw Ingredients</span>
                {recipe.ingredients.map(ing => {
                  const stock = inventory.find(i => i.id === ing.inventoryItemId);
                  return (
                    <div key={ing.inventoryItemId} className="flex justify-between p-2 rounded bg-gray-50 border border-gray-100">
                      <span className="font-medium text-gray-800">{stock?.name || 'Ingredient'}</span>
                      <span className="font-mono text-gray-600 font-bold">
                        {ing.quantity} {ing.unit} (~₹{((stock?.unitCost || 0) * ing.quantity).toFixed(2)})
                      </span>
                    </div>
                  );
                })}
              </div>

              {recipe.preparationNotes && (
                <p className="text-[11px] text-gray-500 italic bg-amber-50/50 p-2 rounded border border-amber-200/50">
                  {recipe.preparationNotes}
                </p>
              )}

              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleOpenEdit(recipe)}
                  className="text-xs font-bold text-[#f5764b] hover:text-orange-950"
                >
                  Edit Recipe →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Recipe Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
            </h3>

            <form onSubmit={handleSaveRecipe} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Menu Dish *</label>
                  <select
                    value={menuItemId}
                    onChange={(e) => setMenuItemId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    {menuItems.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (₹{m.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Portion Yield</label>
                  <input
                    type="number"
                    min={1}
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Add Ingredient Section */}
              <div className="pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-800 block mb-1.5">Add Raw Ingredient</span>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedStockId}
                    onChange={(e) => setSelectedStockId(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg outline-none bg-white text-xs"
                  >
                    {inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (₹{i.unitCost}/{i.unit})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={ingredientQty}
                    onChange={(e) => setIngredientQty(Number(e.target.value))}
                    placeholder="Qty"
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-3 py-1.5 bg-[#f5764b] text-white rounded-lg font-bold"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {ingredients.map((ing, idx) => {
                    const stock = inventory.find(i => i.id === ing.inventoryItemId);
                    return (
                      <div key={idx} className="p-2 rounded bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                        <span>{stock?.name}: {ing.quantity} {ing.unit}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Chef Cooking Notes</label>
                <textarea
                  value={prepNotes}
                  onChange={(e) => setPrepNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Simmer for 18 hours with white butter..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg font-bold shadow-xs"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
