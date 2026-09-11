import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import { MenuItem, MenuCategory } from '../../../types';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { StatCard } from '../../common/StatCard';

const MENU_CATEGORIES: MenuCategory[] = [
  'Biryani',
  'Karahi',
  'BBQ',
  'Handi & Curries',
  'Burgers',
  'Pizza',
  'Fries & Appetizers',
  'Drinks',
  'Tea & Coffee',
  'Desserts',
];

interface MenuViewProps {
  onNavigateToRecipes: () => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ onNavigateToRecipes }) => {
  const {
    menuItems,
    recipes,
    saveMenuItem,
    toggleMenuItemAvailability,
    deleteMenuItem,
    settings,
  } = useDb();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Form State
  const [formId, setFormId] = useState<string | undefined>(undefined);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MenuCategory>('Biryani');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(750);
  const [formRecipeId, setFormRecipeId] = useState<string>('');
  const [formPrepTime, setFormPrepTime] = useState<number>(15);
  const [formImage, setFormImage] = useState('');

  // Filtered Menu Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const handleOpenAddModal = () => {
    setFormId(undefined);
    setFormName('');
    setFormCategory('Biryani');
    setFormDescription('');
    setFormPrice(750);
    setFormRecipeId(recipes[0]?.id || '');
    setFormPrepTime(15);
    setFormImage('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setFormId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormPrice(item.sellingPrice);
    setFormRecipeId(item.recipeId || '');
    setFormPrepTime(item.preparationTime);
    setFormImage(item.image);
    setIsEditModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    saveMenuItem({
      id: formId,
      name: formName,
      category: formCategory,
      description: formDescription,
      sellingPrice: formPrice,
      recipeId: formRecipeId || undefined,
      preparationTime: formPrepTime,
      image: formImage,
      isAvailable: true,
      status: 'active',
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            Restaurant Menu Catalog & Pricing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage culinary dishes, prices, preparation times, and link to Recipe BOMs for automated ingredient deduction.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Dish</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Menu Items"
          value={menuItems.length}
          subtitle="Active restaurant offerings"
          icon={<UtensilsCrossed className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Dishes with Linked BOM"
          value={`${menuItems.filter((m) => m.recipeId).length} / ${menuItems.length}`}
          subtitle="Automated ingredient deduction ready"
          icon={<BookOpen className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Available Now"
          value={menuItems.filter((m) => m.isAvailable).length}
          subtitle="Ready to order in POS"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Filters & Category Pills */}
      <div className="space-y-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search menu dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({menuItems.length})
          </button>
          {MENU_CATEGORIES.map((cat) => {
            const count = menuItems.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const hasRecipe = !!item.recipeId;

          return (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-xl flex flex-col justify-between group transition-all duration-200"
            >
              {/* Dish Image */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-950/80 text-amber-300 backdrop-blur-md border border-amber-500/30">
                  {item.category}
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-slate-950/90 text-white">
                  {item.preparationTime} mins
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-amber-400 transition">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Price & BOM Status */}
                <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-750 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Selling Price</span>
                    <span className="text-base font-extrabold text-amber-400 font-mono">
                      {settings.currencySymbol} {item.sellingPrice.toLocaleString()}
                    </span>
                  </div>
                  {hasRecipe ? (
                    <button
                      onClick={onNavigateToRecipes}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>BOM Linked</span>
                    </button>
                  ) : (
                    <button
                      onClick={onNavigateToRecipes}
                      className="text-[11px] font-bold text-amber-400 hover:underline"
                    >
                      + Link BOM
                    </button>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleMenuItemAvailability(item.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] uppercase transition ${
                      item.isAvailable
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Available
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Unavailable
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                      title="Edit Dish"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete dish "${item.name}"?`)) {
                          deleteMenuItem(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MENU ITEM MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={formId ? `Edit Menu Dish: ${formName}` : 'Add New Menu Item'}
        subtitle="Catalog new culinary dish and connect to Recipe BOM"
        maxWidth="2xl"
        icon={<UtensilsCrossed className="w-5 h-5 text-amber-400" />}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Dish Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Shahi Chicken Dum Biryani"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as MenuCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {MENU_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Selling Price ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={formPrice}
                onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Prep Time (Minutes)
              </label>
              <input
                type="number"
                min="1"
                value={formPrepTime}
                onChange={(e) => setFormPrepTime(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Linked BOM Recipe
              </label>
              <select
                value={formRecipeId}
                onChange={(e) => setFormRecipeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">No Recipe (Manual)</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.menuItemName} (Food Cost: {settings.currencySymbol} {r.totalFoodCost.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Image URL
              </label>
              <input
                type="url"
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Description & Flavor Notes
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief mouth-watering description..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition"
            >
              Save Menu Dish
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
