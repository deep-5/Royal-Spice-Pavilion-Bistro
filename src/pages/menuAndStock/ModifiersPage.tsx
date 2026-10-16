import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Save,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ModifierGroup, ModifierOption } from '../../types';

export const ModifiersPage: React.FC = () => {
  const { modifierGroups, addModifierGroup, updateModifierGroup } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);

  // Form State
  const [groupName, setGroupName] = useState('');
  const [required, setRequired] = useState(false);
  const [minSelections, setMinSelections] = useState(0);
  const [maxSelections, setMaxSelections] = useState(1);
  const [options, setOptions] = useState<ModifierOption[]>([]);

  // Option input state
  const [optName, setOptName] = useState('');
  const [optPrice, setOptPrice] = useState(0);

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setGroupName('');
    setRequired(false);
    setMinSelections(0);
    setMaxSelections(1);
    setOptions([
      { id: 'opt-1', name: 'Option 1', price: 0, isDefault: true },
      { id: 'opt-2', name: 'Option 2', price: 50 }
    ]);
    setModalOpen(true);
  };

  const handleOpenEdit = (grp: ModifierGroup) => {
    setEditingGroup(grp);
    setGroupName(grp.name);
    setRequired(grp.required);
    setMinSelections(grp.minSelections);
    setMaxSelections(grp.maxSelections);
    setOptions(grp.options);
    setModalOpen(true);
  };

  const handleAddOption = () => {
    if (!optName.trim()) return;
    setOptions(prev => [
      ...prev,
      {
        id: `opt-${Date.now()}`,
        name: optName.trim(),
        price: optPrice,
        isDefault: prev.length === 0
      }
    ]);
    setOptName('');
    setOptPrice(0);
  };

  const handleRemoveOption = (id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || options.length === 0) {
      alert('Group name and at least one modifier option are required.');
      return;
    }

    if (editingGroup) {
      updateModifierGroup({
        ...editingGroup,
        name: groupName.trim(),
        required,
        minSelections,
        maxSelections,
        options
      });
    } else {
      addModifierGroup({
        name: groupName.trim(),
        required,
        minSelections,
        maxSelections,
        options
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
            Modifiers & Add-ons
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure choice sets (Spice levels, bread pairings, extra cheese, portion sizes) with pricing rules
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Modifier Group</span>
        </button>
      </div>

      {/* Grid of Modifier Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modifierGroups.map(group => (
          <div
            key={group.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-sm text-gray-900">{group.name}</h3>
                <p className="text-[11px] text-gray-500">
                  {group.required ? 'Mandatory selection' : 'Optional selection'} • Select {group.minSelections} - {group.maxSelections}
                </p>
              </div>
              <button
                onClick={() => handleOpenEdit(group)}
                className="text-xs font-bold text-[#f5764b] hover:text-orange-950"
              >
                Edit Group →
              </button>
            </div>

            {/* Options list */}
            <div className="space-y-2 text-xs">
              {group.options.map(opt => (
                <div
                  key={opt.id}
                  className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{opt.name}</span>
                    {opt.isDefault && (
                      <span className="px-1.5 py-0.2 rounded bg-green-100 text-green-800 text-[9px] font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">
                    {opt.price === 0 ? 'Free' : `+₹${opt.price.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modifier Group Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900">
              {editingGroup ? 'Edit Modifier Group' : 'Add Modifier Group'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Choice of Bread, Spice Level"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Required?</label>
                  <select
                    value={required ? 'yes' : 'no'}
                    onChange={(e) => setRequired(e.target.value === 'yes')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                  >
                    <option value="yes">Yes (Mandatory)</option>
                    <option value="no">No (Optional)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Min Select</label>
                  <input
                    type="number"
                    min={0}
                    value={minSelections}
                    onChange={(e) => setMinSelections(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Max Select</label>
                  <input
                    type="number"
                    min={1}
                    value={maxSelections}
                    onChange={(e) => setMaxSelections(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Options list editor */}
              <div className="pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-800 block mb-2">Options in this Group</span>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={optName}
                    onChange={(e) => setOptName(e.target.value)}
                    placeholder="Option name (e.g. Garlic Naan)"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg outline-none text-xs"
                  />
                  <input
                    type="number"
                    value={optPrice}
                    onChange={(e) => setOptPrice(Number(e.target.value))}
                    placeholder="Extra Price"
                    className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-3 py-1.5 bg-[#f5764b] text-white rounded-lg font-bold"
                  >
                    + Add
                  </button>
                </div>

                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {options.map((opt, idx) => (
                    <div key={opt.id} className="p-2 rounded bg-gray-50 border border-gray-200 flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{opt.name} (+₹{opt.price})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
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
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
