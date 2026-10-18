'use client';

import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import { Recipe, MenuItem, UnitType, RecipePortionSize } from '../../../types';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ChefHat,
  Search,
  Sparkles,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  Boxes,
  CheckCircle2,
  XCircle,
  Clock,
  Utensils,
  Tag,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { StatCard } from '../../common/StatCard';
import {
  getCompatibleUnits,
  UNIT_DEFINITIONS,
  formatQuantityWithUnit,
  smartFormatBaseQuantity,
  toBaseUnitQuantity,
} from '../../../utils/unitConverter';
import {
  calculateRecipeCost,
  getDishDefaultIngredients,
} from '../../../utils/recipeEngine';

const PORTION_SIZES: RecipePortionSize[] = ['Single', 'Half', 'Full', 'Double', 'Family', 'Custom'];

const RECIPE_CATEGORIES = [
  'Biryani',
  'Karahi',
  'Handi & Curries',
  'BBQ',
  'Burgers',
  'Pizza',
  'Fries & Appetizers',
  'Tea & Coffee',
  'Drinks',
  'Desserts',
  'Other',
];

export const RecipesView: React.FC = () => {
  const {
    recipes,
    recipesMap,
    rawMaterials,
    rawMaterialsMap,
    menuItems,
    saveRecipe,
    deleteRecipe,
    duplicateRecipe,
    settings,
  } = useDb();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form State for Creating/Editing Recipe
  const [formRecipeId, setFormRecipeId] = useState<string | undefined>(undefined);
  const [formMenuItemId, setFormMenuItemId] = useState<string>('');
  const [formMenuItemName, setFormMenuItemName] = useState<string>('');
  const [formCode, setFormCode] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Biryani');
  const [formPortionSize, setFormPortionSize] = useState<RecipePortionSize>('Single');
  const [formOutputQuantity, setFormOutputQuantity] = useState<number>(1);
  const [formOutputUnit, setFormOutputUnit] = useState<string>('Portion');
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formPrepTime, setFormPrepTime] = useState<number>(15);
  const [formYieldServings, setFormYieldServings] = useState<number>(1);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formInstructions, setFormInstructions] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formIngredients, setFormIngredients] = useState<
    Array<{ rawMaterialId: string; quantity: number; unit: UnitType }>
  >([]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchesSearch =
        r.menuItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.code && r.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.category && r.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.ingredients.some((ing) => ing.rawMaterialName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchQuery, selectedCategory]);

  // Statistics
  const avgFoodCostPct = useMemo(() => {
    if (recipes.length === 0) return 0;
    const sum = recipes.reduce((acc, r) => acc + r.foodCostPercentage, 0);
    return Math.round((sum / recipes.length) * 10) / 10;
  }, [recipes]);

  const totalRecipesCount = recipes.length;
  const highMarginCount = recipes.filter((r) => r.foodCostPercentage <= 35).length;

  // Real-time live cost calculations while editing form
  const liveCostBreakdown = useMemo(() => {
    return calculateRecipeCost(
      formIngredients,
      rawMaterialsMap,
      formSellingPrice,
      formYieldServings
    );
  }, [formIngredients, rawMaterialsMap, formSellingPrice, formYieldServings]);

  /**
   * Loads ingredients for a selected menu item
   */
  const loadIngredientsForDish = (menuItem: MenuItem) => {
    const existingRecipe = recipes.find(
      (r) => r.menuItemId === menuItem.id || r.menuItemName.toLowerCase() === menuItem.name.toLowerCase()
    );

    if (existingRecipe) {
      setFormRecipeId(existingRecipe.id);
      setFormCode(existingRecipe.code || `BOM-${menuItem.name.slice(0, 3).toUpperCase()}-01`);
      setFormCategory(existingRecipe.category || menuItem.category || 'Biryani');
      setFormPortionSize(existingRecipe.portionSize || 'Single');
      setFormOutputQuantity(existingRecipe.outputQuantity || 1);
      setFormOutputUnit(existingRecipe.outputUnit || 'Portion');
      setFormSellingPrice(existingRecipe.sellingPrice || menuItem.sellingPrice);
      setFormPrepTime(existingRecipe.preparationTime || menuItem.preparationTime || 15);
      setFormYieldServings(existingRecipe.yieldServings || 1);
      setFormNotes(existingRecipe.notes || '');
      setFormInstructions(existingRecipe.preparationInstructions || '');
      setFormIsActive(existingRecipe.isActive ?? true);
      setFormIngredients(
        existingRecipe.ingredients.map((ing) => ({
          rawMaterialId: ing.rawMaterialId,
          quantity: ing.quantity,
          unit: ing.unit,
        }))
      );
    } else {
      setFormRecipeId(undefined);
      setFormCode(`BOM-${menuItem.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`);
      setFormCategory(menuItem.category || 'Biryani');
      setFormPortionSize('Single');
      setFormOutputQuantity(1);
      setFormOutputUnit('Portion');
      setFormSellingPrice(menuItem.sellingPrice);
      setFormPrepTime(menuItem.preparationTime || 15);
      setFormYieldServings(1);
      setFormNotes(`Standard portion BOM recipe formulation for ${menuItem.name}`);
      setFormInstructions('');
      setFormIsActive(true);
      const defaultIngredients = getDishDefaultIngredients(menuItem, rawMaterials, recipesMap);
      setFormIngredients(defaultIngredients);
    }
  };

  const handleOpenCreateModal = () => {
    const initialItem = menuItems[0];
    if (initialItem) {
      setFormMenuItemId(initialItem.id);
      setFormMenuItemName(initialItem.name);
      loadIngredientsForDish(initialItem);
    } else {
      setFormRecipeId(undefined);
      setFormMenuItemId('');
      setFormMenuItemName('Custom Recipe');
      setFormCode(`BOM-${Date.now().toString().slice(-4)}`);
      setFormCategory('Biryani');
      setFormPortionSize('Single');
      setFormOutputQuantity(1);
      setFormOutputUnit('Portion');
      setFormSellingPrice(500);
      setFormPrepTime(15);
      setFormYieldServings(1);
      setFormNotes('');
      setFormInstructions('');
      setFormIsActive(true);
      if (rawMaterials[0]) {
        setFormIngredients([
          {
            rawMaterialId: rawMaterials[0].id,
            quantity: rawMaterials[0].unit === 'KG' ? 250 : 1,
            unit: rawMaterials[0].unit === 'KG' ? 'Gram' : rawMaterials[0].unit,
          },
        ]);
      }
    }
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (recipe: Recipe) => {
    setFormRecipeId(recipe.id);
    setFormMenuItemId(recipe.menuItemId);
    setFormMenuItemName(recipe.menuItemName);
    setFormCode(recipe.code || `BOM-${Date.now().toString().slice(-4)}`);
    setFormCategory(recipe.category || 'Biryani');
    setFormPortionSize(recipe.portionSize || 'Single');
    setFormOutputQuantity(recipe.outputQuantity || 1);
    setFormOutputUnit(recipe.outputUnit || 'Portion');
    setFormSellingPrice(recipe.sellingPrice);
    setFormPrepTime(recipe.preparationTime || 15);
    setFormYieldServings(recipe.yieldServings || 1);
    setFormNotes(recipe.notes || '');
    setFormInstructions(recipe.preparationInstructions || '');
    setFormIsActive(recipe.isActive ?? true);
    setFormIngredients(
      recipe.ingredients.map((ing) => ({
        rawMaterialId: ing.rawMaterialId,
        quantity: ing.quantity,
        unit: ing.unit,
      }))
    );
    setIsEditModalOpen(true);
  };

  const handleSelectMenuItem = (menuItemId: string) => {
    const item = menuItems.find((m) => m.id === menuItemId);
    if (item) {
      setFormMenuItemId(item.id);
      setFormMenuItemName(item.name);
      loadIngredientsForDish(item);
    }
  };

  const handleResetToDefaultIngredients = () => {
    const item = menuItems.find((m) => m.id === formMenuItemId);
    if (item) {
      const defaults = getDishDefaultIngredients(item, rawMaterials);
      setFormIngredients(defaults);
    }
  };

  const handleAddIngredientRow = () => {
    const firstMaterial = rawMaterials[0];
    if (firstMaterial) {
      setFormIngredients((prev) => [
        ...prev,
        {
          rawMaterialId: firstMaterial.id,
          quantity: firstMaterial.unit === 'KG' ? 100 : 1,
          unit: firstMaterial.unit === 'KG' ? 'Gram' : firstMaterial.unit,
        },
      ]);
    }
  };

  const handleUpdateIngredientRow = (
    index: number,
    field: 'rawMaterialId' | 'quantity' | 'unit',
    val: any
  ) => {
    setFormIngredients((prev) => {
      const copy = [...prev];
      const current = { ...copy[index] };

      if (field === 'rawMaterialId') {
        current.rawMaterialId = val;
        const mat = rawMaterialsMap.get(val);
        if (mat) {
          if (mat.baseUnit === 'Gram') current.unit = 'Gram';
          else if (mat.baseUnit === 'ML') current.unit = 'ML';
          else current.unit = mat.unit;
        }
      } else if (field === 'quantity') {
        current.quantity = parseFloat(val) || 0;
      } else if (field === 'unit') {
        current.unit = val;
      }

      copy[index] = current;
      return copy;
    });
  };

  const handleRemoveIngredientRow = (index: number) => {
    setFormIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMenuItemName) return;
    if (formIngredients.length === 0) {
      alert('Please select and add at least one raw material ingredient to the BOM recipe.');
      return;
    }

    const invalidQty = formIngredients.some((i) => i.quantity <= 0);
    if (invalidQty) {
      alert('All ingredient quantities must be strictly greater than 0.');
      return;
    }

    saveRecipe({
      id: formRecipeId,
      menuItemId: formMenuItemId,
      menuItemName: formMenuItemName,
      code: formCode,
      category: formCategory,
      portionSize: formPortionSize,
      outputQuantity: formOutputQuantity,
      outputUnit: formOutputUnit,
      sellingPrice: formSellingPrice,
      preparationTime: formPrepTime,
      yieldServings: formYieldServings || 1,
      ingredients: formIngredients.map((i) => ({
        rawMaterialId: i.rawMaterialId,
        rawMaterialName: rawMaterialsMap.get(i.rawMaterialId)?.name || 'Unknown',
        quantity: i.quantity,
        unit: i.unit,
        baseUnitQty: 0, // Calculated by engine
        calculatedCost: 0,
      })),
      notes: formNotes,
      description: formNotes,
      preparationInstructions: formInstructions,
      isActive: formIsActive,
      version: 1,
    });

    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-amber-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-300">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-royal">
                Recipe & BOM (Bill of Materials) Engineering
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Inventory Linked
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Define the exact raw material ingredients required per portion/recipe. All ingredients reference active inventory records.
              Recipe consumption is automatically deducted in exact grams/ml when customer orders are fulfilled through POS.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New BOM Recipe</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Active BOM Recipes"
          value={totalRecipesCount}
          subtitle="Configured dishes & portions"
          icon={<ChefHat className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Average Food Cost %"
          value={`${avgFoodCostPct}%`}
          subtitle="Target industry benchmark: 25% - 35%"
          icon={<Percent className="w-5 h-5" />}
          color={avgFoodCostPct <= 35 ? 'emerald' : 'rose'}
          trend={{ value: 'Cost control efficiency', isPositive: avgFoodCostPct <= 35 }}
        />
        <StatCard
          title="Optimal Margin Dishes"
          value={`${highMarginCount} / ${totalRecipesCount}`}
          subtitle="Dishes with gross profit margin ≥ 65%"
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredRecipes.length}</span> BOM Recipes
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${selectedCategory === 'All'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
          >
            All Categories ({recipes.length})
          </button>
          {RECIPE_CATEGORIES.map((cat) => {
            const count = recipes.filter((r) => r.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredRecipes.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium">No recipes match the search criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Click "Create New BOM Recipe" to add dishes.</p>
          </div>
        ) : (
          filteredRecipes.map((recipe) => {
            const isHealthy = recipe.foodCostPercentage <= 35;
            const isWarning = recipe.foodCostPercentage > 35 && recipe.foodCostPercentage <= 50;

            // Evaluate ingredient stock statuses
            const ingredientStatuses = recipe.ingredients.map((ing) => {
              const rawMat = rawMaterialsMap.get(ing.rawMaterialId);
              if (!rawMat) return { name: ing.rawMaterialName, status: 'out_of_stock' as const };
              const reqBase = ing.baseUnitQty || toBaseUnitQuantity(ing.quantity, ing.unit);
              if (rawMat.currentQty <= 0) return { name: rawMat.name, status: 'out_of_stock' as const };
              if (rawMat.status === 'low_stock' || rawMat.currentQty < reqBase) return { name: rawMat.name, status: 'low_stock' as const };
              return { name: rawMat.name, status: 'available' as const };
            });

            const hasOutOfStock = ingredientStatuses.some((i) => i.status === 'out_of_stock');
            const hasLowStock = ingredientStatuses.some((i) => i.status === 'low_stock');

            return (
              <div
                key={recipe.id}
                className="rounded-2xl bg-white border border-slate-200 hover:border-slate-300 p-5 shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-amber-600 transition">
                        {recipe.menuItemName}
                      </h3>
                      {recipe.portionSize && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          {recipe.portionSize} Portion
                        </span>
                      )}
                      {recipe.code && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          {recipe.code}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{recipe.notes || recipe.description || 'Standard portion BOM recipe'}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => duplicateRecipe(recipe.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                      title="Duplicate Recipe"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(recipe)}
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition"
                      title="Edit BOM Recipe"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete recipe for "${recipe.menuItemName}"?`)) {
                          deleteRecipe(recipe.id);
                        }
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                      title="Delete Recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Financial Metrics Strip */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Cost</span>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-700 font-mono">
                      {settings.currencySymbol} {recipe.totalFoodCost.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Selling Price</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono">
                      {settings.currencySymbol} {recipe.sellingPrice.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Gross Profit</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-700 font-mono">
                      {settings.currencySymbol} {recipe.grossMarginRs.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Food Cost %</span>
                    <span
                      className={`text-xs sm:text-sm font-extrabold font-mono ${isHealthy ? 'text-emerald-700' : isWarning ? 'text-amber-700' : 'text-rose-700'
                        }`}
                    >
                      {recipe.foodCostPercentage}%
                    </span>
                  </div>
                </div>

                {/* Ingredients & Stock Status Breakdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
                    <span>Raw Material BOM ({recipe.ingredients.length} Ingredients)</span>
                    <span>Ingredient Stock Status</span>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50 max-h-48 overflow-y-auto">
                    {recipe.ingredients.map((ing, idx) => {
                      const rawMat = rawMaterialsMap.get(ing.rawMaterialId);
                      const reqBase = ing.baseUnitQty || toBaseUnitQuantity(ing.quantity, ing.unit);
                      const availDisplay = rawMat
                        ? smartFormatBaseQuantity(rawMat.currentQty, rawMat.baseUnit)
                        : '0';

                      let statusBadge = (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Available ({availDisplay})
                        </span>
                      );

                      if (!rawMat || rawMat.currentQty <= 0) {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700">
                            <XCircle className="w-3 h-3 text-rose-600" /> Out of Stock
                          </span>
                        );
                      } else if (rawMat.status === 'low_stock' || rawMat.currentQty < reqBase) {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock ({availDisplay})
                          </span>
                        );
                      }

                      return (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{ing.rawMaterialName}</span>
                            <span className="text-[11px] text-slate-500 font-mono shrink-0">
                              ({formatQuantityWithUnit(ing.quantity, ing.unit)})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {statusBadge}
                            <span className="font-mono font-semibold text-slate-700">
                              {settings.currencySymbol} {ing.calculatedCost.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Warning & Breakdown Link */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <div>
                    {hasOutOfStock ? (
                      <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> 1+ Ingredients Out of Stock
                      </span>
                    ) : hasLowStock ? (
                      <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> 1+ Ingredients Low Stock
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> All Ingredients In Stock
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setIsDetailsModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-xs transition"
                  >
                    <span>Detailed BOM Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT RECIPE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={formRecipeId ? `Edit Recipe: ${formMenuItemName}` : 'Create New BOM Recipe'}
        subtitle="Select or configure a dish, attach raw materials from inventory, and evaluate live margins"
        maxWidth="4xl"
        icon={<BookOpen className="w-5 h-5 text-amber-600" />}
      >
        <form onSubmit={handleSaveRecipe} className="space-y-6">
          {/* Top Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Target Menu Item / Recipe Name *
              </label>
              {menuItems.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={formMenuItemId}
                    onChange={(e) => handleSelectMenuItem(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="">-- Custom Recipe / New Dish --</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({settings.currencySymbol} {item.sellingPrice})
                      </option>
                    ))}
                  </select>
                  {!formMenuItemId && (
                    <input
                      type="text"
                      value={formMenuItemName}
                      onChange={(e) => setFormMenuItemName(e.target.value)}
                      placeholder="e.g. Pakistani Rice"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                      required
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={formMenuItemName}
                  onChange={(e) => setFormMenuItemName(e.target.value)}
                  placeholder="e.g. Pakistani Rice"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Recipe Code / SKU *
              </label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. BOM-PAK-01"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              >
                {RECIPE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Portion Size
              </label>
              <select
                value={formPortionSize}
                onChange={(e) => setFormPortionSize(e.target.value as RecipePortionSize)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-semibold"
              >
                {PORTION_SIZES.map((p) => (
                  <option key={p} value={p}>
                    {p} Portion
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Selling Price ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={formSellingPrice}
                onChange={(e) => setFormSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Output Quantity & Unit
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formOutputQuantity}
                  onChange={(e) => setFormOutputQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono"
                />
                <input
                  type="text"
                  value={formOutputUnit}
                  onChange={(e) => setFormOutputUnit(e.target.value)}
                  placeholder="Portion"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Preparation Time (Mins)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formPrepTime}
                onChange={(e) => setFormPrepTime(parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Live Dynamic Costing Header Card */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Dynamic Recipe Costing Breakdown
                </h4>
              </div>
              <span className="text-[11px] text-slate-600 font-medium">
                Live computed from raw material inventory purchase rates
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Recipe Cost</span>
                <span className="text-sm font-extrabold text-amber-700 font-mono">
                  {settings.currencySymbol} {liveCostBreakdown.totalFoodCost.toFixed(2)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Selling Price</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  {settings.currencySymbol} {formSellingPrice.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Gross Profit</span>
                <span className="text-sm font-extrabold text-emerald-700 font-mono">
                  {settings.currencySymbol} {liveCostBreakdown.grossMarginRs.toFixed(2)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Food Cost %</span>
                <span
                  className={`text-sm font-extrabold font-mono ${liveCostBreakdown.foodCostPercentage <= 35 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                >
                  {liveCostBreakdown.foodCostPercentage}%
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Profit Margin %</span>
                <span className="text-sm font-extrabold text-emerald-700 font-mono">
                  {liveCostBreakdown.grossMarginPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Ingredient Builder Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Bill of Materials (BOM) Ingredients ({formIngredients.length} Items)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {formMenuItemId && (
                  <button
                    type="button"
                    onClick={handleResetToDefaultIngredients}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition"
                    title="Reload recommended ingredient template"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reload Defaults</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddIngredientRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-amber-700 text-xs font-bold border border-slate-300 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Ingredient Row
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Raw Material (from Inventory) *</th>
                    <th className="py-2.5 px-3 w-32">Current Stock</th>
                    <th className="py-2.5 px-3 w-28">Quantity *</th>
                    <th className="py-2.5 px-3 w-32">Unit *</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Portion Cost</th>
                    <th className="py-2.5 px-3 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">
                        No ingredients added. Click "+ Add Ingredient Row" to select raw materials.
                      </td>
                    </tr>
                  ) : (
                    formIngredients.map((row, index) => {
                      const rawMaterial = rawMaterialsMap.get(row.rawMaterialId);
                      const compatibleUnits = rawMaterial
                        ? getCompatibleUnits(rawMaterial.unit)
                        : (['KG', 'Gram', 'Liter', 'ML', 'Piece', 'Dozen', 'Cup', 'Other'] as UnitType[]);

                      const calculated = liveCostBreakdown.ingredients[index];
                      const availableBase = rawMaterial ? rawMaterial.currentQty : 0;
                      const requiredBase = toBaseUnitQuantity(row.quantity, row.unit);
                      const isShortage = rawMaterial && requiredBase > availableBase;

                      return (
                        <tr key={index} className="hover:bg-slate-50">
                          {/* Raw Material Select */}
                          <td className="py-2.5 px-3">
                            <select
                              value={row.rawMaterialId}
                              onChange={(e) => handleUpdateIngredientRow(index, 'rawMaterialId', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                              required
                            >
                              {rawMaterials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.sku}) — {settings.currencySymbol} {m.purchasePrice}/{m.unit}
                                </option>
                              ))}
                            </select>
                            {isShortage && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold mt-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Current stock ({smartFormatBaseQuantity(availableBase, rawMaterial!.baseUnit)}) is lower than portion quantity</span>
                              </div>
                            )}
                          </td>

                          {/* Available Stock Indicator */}
                          <td className="py-2.5 px-3 font-mono">
                            {rawMaterial ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${rawMaterial.status === 'out_of_stock'
                                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                    : rawMaterial.status === 'low_stock'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  }`}
                              >
                                {smartFormatBaseQuantity(rawMaterial.currentQty, rawMaterial.baseUnit)}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Quantity */}
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min="0.001"
                              step="any"
                              value={row.quantity}
                              onChange={(e) => handleUpdateIngredientRow(index, 'quantity', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
                              required
                            />
                          </td>

                          {/* Unit Select */}
                          <td className="py-2.5 px-3">
                            <select
                              value={row.unit}
                              onChange={(e) => handleUpdateIngredientRow(index, 'unit', e.target.value as UnitType)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                            >
                              {compatibleUnits.map((u) => (
                                <option key={u} value={u}>
                                  {UNIT_DEFINITIONS[u]?.shortLabel || u} ({u})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Purchase Price Display */}
                          <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                            {rawMaterial ? `${settings.currencySymbol} ${rawMaterial.purchasePrice}/${rawMaterial.unit}` : '-'}
                          </td>

                          {/* Portion Cost */}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                            {settings.currencySymbol} {calculated ? calculated.totalCost.toFixed(2) : '0.00'}
                          </td>

                          {/* Delete Button */}
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredientRow(index)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                              title="Remove Ingredient"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Description & Preparation Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Recipe Notes / Description
              </label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Traditional aromatic long-grain rice..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Chef Preparation Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={formInstructions}
                onChange={(e) => setFormInstructions(e.target.value)}
                placeholder="e.g. Rinse rice, temper spices in hot oil, seal lid and steam..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded bg-slate-100 border-slate-300 text-amber-600 focus:ring-0"
              />
              <span>Active for POS Sales & Automated Deduction</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition"
              >
                Save BOM Recipe Formulation
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* DETAILED RECIPE BREAKDOWN MODAL */}
      {selectedRecipe && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`BOM Recipe: ${selectedRecipe.menuItemName}`}
          subtitle={`Code: ${selectedRecipe.code || 'BOM'} | Portion: ${selectedRecipe.portionSize || 'Single'} | Category: ${selectedRecipe.category || 'General'}`}
          maxWidth="3xl"
          icon={<ChefHat className="w-5 h-5 text-amber-600" />}
        >
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Recipe Cost</span>
                <span className="text-sm font-extrabold text-amber-700 font-mono">
                  {settings.currencySymbol} {selectedRecipe.totalFoodCost.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-500 block">Per serving batch</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Selling Price</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  {settings.currencySymbol} {selectedRecipe.sellingPrice.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-500 block">Menu retail price</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Gross Profit</span>
                <span className="text-sm font-extrabold text-emerald-700 font-mono">
                  {settings.currencySymbol} {selectedRecipe.grossMarginRs.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-500 block">Per serving margin</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Food Cost %</span>
                <span className="text-sm font-extrabold text-emerald-700 font-mono">
                  {selectedRecipe.foodCostPercentage}%
                </span>
                <span className="text-[9px] text-slate-500 block">Benchmark target: &lt;35%</span>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Detailed Ingredient Specifications ({selectedRecipe.ingredients.length} Items)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Ingredient</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Raw Material Rate</th>
                      <th className="py-2.5 px-3 text-right">Cost Contribution</th>
                      <th className="py-2.5 px-3 text-center">Stock Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRecipe.ingredients.map((ing, idx) => {
                      const rawMat = rawMaterialsMap.get(ing.rawMaterialId);
                      const reqBase = ing.baseUnitQty || toBaseUnitQuantity(ing.quantity, ing.unit);
                      const availDisplay = rawMat
                        ? smartFormatBaseQuantity(rawMat.currentQty, rawMat.baseUnit)
                        : '0';

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900">{ing.rawMaterialName}</span>
                            {rawMat && (
                              <span className="block font-mono text-[10px] text-slate-500">
                                SKU: {rawMat.sku} | Category: {rawMat.category}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                            {formatQuantityWithUnit(ing.quantity, ing.unit)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            {rawMat
                              ? `${settings.currencySymbol} ${rawMat.purchasePrice}/${rawMat.unit}`
                              : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                            {settings.currencySymbol} {ing.calculatedCost.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {!rawMat || rawMat.currentQty <= 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                                Out of Stock
                              </span>
                            ) : rawMat.currentQty < reqBase || rawMat.status === 'low_stock' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                Low Stock ({availDisplay})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ Available ({availDisplay})
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedRecipe.preparationInstructions && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 uppercase block mb-1">
                  Preparation Instructions:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {selectedRecipe.preparationInstructions}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
