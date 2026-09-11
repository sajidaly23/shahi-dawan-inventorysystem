import {
  RawMaterial,
  Recipe,
  MenuItem,
  OrderItem,
  UnitType,
} from '../types';
import {
  toBaseUnitQuantity,
  fromBaseUnitQuantity,
  smartFormatBaseQuantity,
  formatQuantityWithUnit,
  UNIT_DEFINITIONS,
} from './unitConverter';

export interface IngredientCostCalculation {
  rawMaterialId: string;
  rawMaterialName: string;
  sku: string;
  quantity: number;
  unit: UnitType;
  baseUnitQty: number;
  availableBaseQty: number;
  availableDisplayFormatted: string;
  unitCost: number;       // Raw material purchase price per display unit
  costPerBaseUnit: number;// Calculated price per canonical base unit
  totalCost: number;      // Cost for this portion amount
  isSufficient: boolean;  // Stock availability check for recipe definition
  stockStatus: 'available' | 'low_stock' | 'out_of_stock';
}

export interface RecipeCostBreakdown {
  totalFoodCost: number;         // Total food cost for the whole recipe/batch
  foodCostPerServing: number;    // Food cost per 1 serving (totalFoodCost / yieldServings)
  sellingPrice: number;
  grossMarginRs: number;         // Selling Price - foodCostPerServing
  foodCostPercentage: number;    // (foodCostPerServing / Selling Price) * 100
  grossMarginPercentage: number; // (grossMarginRs / Selling Price) * 100
  yieldServings: number;
  ingredients: IngredientCostCalculation[];
}

/**
 * Calculates the exact food cost for a recipe based on current raw material purchase prices and yield.
 */
export function calculateRecipeCost(
  ingredients: Array<{ rawMaterialId: string; quantity: number; unit: UnitType }>,
  rawMaterialsMap: Map<string, RawMaterial>,
  sellingPrice: number = 0,
  yieldServings: number = 1
): RecipeCostBreakdown {
  const yieldCount = Math.max(1, yieldServings || 1);
  let totalFoodCost = 0;
  const ingredientsCalculated: IngredientCostCalculation[] = [];

  for (const ing of ingredients) {
    const rawMaterial = rawMaterialsMap.get(ing.rawMaterialId);
    if (!rawMaterial) {
      ingredientsCalculated.push({
        rawMaterialId: ing.rawMaterialId,
        rawMaterialName: 'Unknown Material',
        sku: 'N/A',
        quantity: ing.quantity,
        unit: ing.unit,
        baseUnitQty: toBaseUnitQuantity(ing.quantity, ing.unit),
        availableBaseQty: 0,
        availableDisplayFormatted: '0',
        unitCost: 0,
        costPerBaseUnit: 0,
        totalCost: 0,
        isSufficient: false,
        stockStatus: 'out_of_stock',
      });
      continue;
    }

    // Determine purchase price per base unit
    // E.g. Raw material is priced Rs. 800 per KG (1000 g) => Rs. 0.8 per gram
    const rawDef = UNIT_DEFINITIONS[rawMaterial.unit];
    const baseFactor = rawDef ? rawDef.toBaseFactor : 1;
    const costPerBaseUnit = rawMaterial.purchasePrice / baseFactor;

    // Convert recipe ingredient quantity to base unit
    const ingBaseQty = toBaseUnitQuantity(ing.quantity, ing.unit);
    const ingredientTotalCost = Math.round(ingBaseQty * costPerBaseUnit * 100) / 100;

    totalFoodCost += ingredientTotalCost;

    const availableBaseQty = rawMaterial.currentQty;
    const isSufficient = availableBaseQty >= ingBaseQty;

    let stockStatus: 'available' | 'low_stock' | 'out_of_stock' = 'available';
    if (availableBaseQty <= 0) {
      stockStatus = 'out_of_stock';
    } else if (rawMaterial.status === 'low_stock' || availableBaseQty < ingBaseQty) {
      stockStatus = 'low_stock';
    }

    ingredientsCalculated.push({
      rawMaterialId: rawMaterial.id,
      rawMaterialName: rawMaterial.name,
      sku: rawMaterial.sku,
      quantity: ing.quantity,
      unit: ing.unit,
      baseUnitQty: ingBaseQty,
      availableBaseQty,
      availableDisplayFormatted: smartFormatBaseQuantity(availableBaseQty, rawMaterial.baseUnit),
      unitCost: rawMaterial.purchasePrice,
      costPerBaseUnit,
      totalCost: ingredientTotalCost,
      isSufficient,
      stockStatus,
    });
  }

  totalFoodCost = Math.round(totalFoodCost * 100) / 100;
  const foodCostPerServing = Math.round((totalFoodCost / yieldCount) * 100) / 100;
  const grossMarginRs = Math.round((sellingPrice - foodCostPerServing) * 100) / 100;
  const foodCostPercentage =
    sellingPrice > 0 ? Math.round((foodCostPerServing / sellingPrice) * 1000) / 10 : 0;
  const grossMarginPercentage =
    sellingPrice > 0 ? Math.round((grossMarginRs / sellingPrice) * 1000) / 10 : 0;

  return {
    totalFoodCost,
    foodCostPerServing,
    sellingPrice,
    grossMarginRs,
    foodCostPercentage,
    grossMarginPercentage,
    yieldServings: yieldCount,
    ingredients: ingredientsCalculated,
  };
}

/**
 * Intelligent Dish Ingredient Template Engine:
 * When creating a BOM recipe for a dish, this automatically loads all raw materials/ingredients
 * normally required for that dish from the inventory master data.
 */
export function getDishDefaultIngredients(
  menuItem: MenuItem,
  rawMaterials: RawMaterial[],
  existingRecipesMap?: Map<string, Recipe>
): Array<{ rawMaterialId: string; quantity: number; unit: UnitType }> {
  // 1. If an existing recipe for this dish already exists, return its saved ingredients
  if (existingRecipesMap) {
    if (menuItem.recipeId && existingRecipesMap.has(menuItem.recipeId)) {
      const existing = existingRecipesMap.get(menuItem.recipeId)!;
      return existing.ingredients.map((i) => ({
        rawMaterialId: i.rawMaterialId,
        quantity: i.quantity,
        unit: i.unit,
      }));
    }

    // Check by menuItemId or matching name
    for (const r of existingRecipesMap.values()) {
      if (r.menuItemId === menuItem.id || r.menuItemName.toLowerCase() === menuItem.name.toLowerCase()) {
        return r.ingredients.map((i) => ({
          rawMaterialId: i.rawMaterialId,
          quantity: i.quantity,
          unit: i.unit,
        }));
      }
    }
  }

  // 2. Helper to find raw material by SKU or keyword
  const findMat = (keywords: string[]): RawMaterial | undefined => {
    return rawMaterials.find((m) => {
      const name = m.name.toLowerCase();
      const sku = m.sku.toLowerCase();
      return keywords.some((kw) => name.includes(kw.toLowerCase()) || sku.includes(kw.toLowerCase()));
    });
  };

  const dishName = menuItem.name.toLowerCase();
  const category = menuItem.category;
  const result: Array<{ rawMaterialId: string; quantity: number; unit: UnitType }> = [];

  const add = (mat: RawMaterial | undefined, quantity: number, unit: UnitType) => {
    if (mat && !result.some((r) => r.rawMaterialId === mat.id)) {
      result.push({ rawMaterialId: mat.id, quantity, unit });
    }
  };

  // 3. Category & Dish Specific Ingredient Mapping
  if (dishName.includes('biryani') || category === 'Biryani') {
    add(findMat(['rice', 'basmati']), 250, 'Gram');
    add(findMat(['chicken']), 180, 'Gram');
    add(findMat(['sunflower', 'oil']), 30, 'ML');
    add(findMat(['biryani masala', 'spc-bry']), 15, 'Gram');
    add(findMat(['onion', 'veg-oni']), 60, 'Gram');
    add(findMat(['tomato', 'veg-tom']), 40, 'Gram');
    add(findMat(['yogurt', 'dahi']), 50, 'Gram');
    add(findMat(['ginger & garlic', 'paste', 'veg-ggp']), 15, 'Gram');
    add(findMat(['pink salt', 'salt']), 5, 'Gram');
    add(findMat(['red chili', 'chili']), 5, 'Gram');
    add(findMat(['garam masala']), 3, 'Gram');
  } else if (dishName.includes('karahi') || category === 'Karahi') {
    if (dishName.includes('mutton')) {
      add(findMat(['mutton', 'goat']), 500, 'Gram');
    } else if (dishName.includes('beef')) {
      add(findMat(['beef']), 500, 'Gram');
    } else {
      add(findMat(['chicken']), 500, 'Gram');
    }
    add(findMat(['tomato', 'veg-tom']), 200, 'Gram');
    add(findMat(['desi ghee', 'ghee']), 60, 'Gram');
    add(findMat(['ginger & garlic', 'paste']), 30, 'Gram');
    add(findMat(['garam masala']), 10, 'Gram');
    add(findMat(['pink salt', 'salt']), 8, 'Gram');
    add(findMat(['red chili', 'chili']), 6, 'Gram');
  } else if (dishName.includes('tikka') || dishName.includes('bbq') || category === 'BBQ') {
    add(findMat(['chicken']), 280, 'Gram');
    add(findMat(['yogurt', 'dahi']), 60, 'Gram');
    add(findMat(['milk']), 30, 'ML');
    add(findMat(['desi ghee', 'ghee']), 15, 'Gram');
    add(findMat(['ginger & garlic', 'paste']), 15, 'Gram');
    add(findMat(['garam masala']), 8, 'Gram');
    add(findMat(['red chili', 'chili']), 6, 'Gram');
    add(findMat(['pink salt', 'salt']), 5, 'Gram');
  } else if (dishName.includes('burger') || category === 'Burgers') {
    add(findMat(['beef', 'boneless']), 180, 'Gram');
    add(findMat(['bun', 'brioche', 'bak-bun']), 1, 'Piece');
    add(findMat(['cheese', 'mozzarella']), 35, 'Gram');
    add(findMat(['onion']), 25, 'Gram');
    add(findMat(['tomato']), 20, 'Gram');
    add(findMat(['sunflower', 'oil']), 15, 'ML');
    add(findMat(['pink salt', 'salt']), 3, 'Gram');
  } else if (dishName.includes('pizza') || category === 'Pizza') {
    add(findMat(['flour', 'maida', 'flr-mai']), 220, 'Gram');
    add(findMat(['cheese', 'mozzarella']), 200, 'Gram');
    add(findMat(['chicken']), 150, 'Gram');
    add(findMat(['tomato']), 60, 'Gram');
    add(findMat(['onion']), 40, 'Gram');
    add(findMat(['sunflower', 'oil']), 20, 'ML');
    add(findMat(['pink salt', 'salt']), 4, 'Gram');
  } else if (dishName.includes('fries') || category === 'Fries & Appetizers') {
    add(findMat(['potato', 'russet', 'veg-pot']), 300, 'Gram');
    add(findMat(['sunflower', 'oil']), 40, 'ML');
    add(findMat(['red chili', 'chili']), 6, 'Gram');
    add(findMat(['pink salt', 'salt']), 5, 'Gram');
  } else if (dishName.includes('chai') || dishName.includes('tea') || category === 'Tea & Coffee') {
    add(findMat(['milk', 'dry-mlk']), 200, 'ML');
    add(findMat(['tea', 'danedar', 'bev-tea']), 12, 'Gram');
    add(findMat(['sugar', 'groc-sug']), 15, 'Gram');
    add(findMat(['garam masala']), 2, 'Gram');
  } else if (dishName.includes('gulab jamun') || category === 'Desserts') {
    add(findMat(['khoya', 'mawa', 'dry-khy']), 70, 'Gram');
    add(findMat(['flour', 'maida', 'flr-mai']), 15, 'Gram');
    add(findMat(['sugar', 'groc-sug']), 80, 'Gram');
    add(findMat(['desi ghee', 'ghee']), 25, 'Gram');
    add(findMat(['garam masala']), 2, 'Gram');
  } else if (category === 'Handi & Curries') {
    add(findMat(['chicken']), 350, 'Gram');
    add(findMat(['desi ghee', 'ghee']), 40, 'Gram');
    add(findMat(['yogurt', 'dahi']), 60, 'Gram');
    add(findMat(['milk']), 50, 'ML');
    add(findMat(['onion']), 50, 'Gram');
    add(findMat(['ginger & garlic', 'paste']), 20, 'Gram');
    add(findMat(['garam masala']), 6, 'Gram');
    add(findMat(['pink salt', 'salt']), 5, 'Gram');
  } else {
    // Generic fallback: primary meat or grain + oil + basic seasonings
    const chickenMat = findMat(['chicken', 'beef', 'rice', 'flour']);
    const oilMat = findMat(['oil', 'ghee']);
    const saltMat = findMat(['salt']);
    if (chickenMat) add(chickenMat, 200, 'Gram');
    if (oilMat) add(oilMat, 30, 'ML');
    if (saltMat) add(saltMat, 5, 'Gram');
  }

  // If still empty, supply the first available raw material as a placeholder
  if (result.length === 0 && rawMaterials.length > 0) {
    result.push({
      rawMaterialId: rawMaterials[0].id,
      quantity: rawMaterials[0].unit === 'KG' ? 100 : 1,
      unit: rawMaterials[0].unit === 'KG' ? 'Gram' : rawMaterials[0].unit,
    });
  }

  return result;
}

export interface StockRequirement {
  rawMaterialId: string;
  rawMaterialName: string;
  sku: string;
  unit: UnitType;
  baseUnit: UnitType;
  requiredBaseQty: number;
  availableBaseQty: number;
  remainingBaseQty: number;
  deficitBaseQty: number;
  requiredFormatted: string;
  availableFormatted: string;
  remainingFormatted: string;
  deficitFormatted: string;
  isSufficient: boolean;
  costImpact: number;
}

export interface StockValidationResult {
  isValid: boolean;
  requirements: StockRequirement[];
  insufficientItems: StockRequirement[];
  totalEstimatedCost: number;
}

/**
 * Validates whether there is sufficient raw material inventory to fulfill a restaurant order.
 * Considers recipe yield (servings).
 */
export function validateOrderStock(
  orderItems: Array<{ menuItemId: string; quantity: number }>,
  menuItemsMap: Map<string, MenuItem>,
  recipesMap: Map<string, Recipe>,
  rawMaterialsMap: Map<string, RawMaterial>
): StockValidationResult {
  // 1. Aggregate required base quantities across all ordered items
  const aggregatedBaseRequirements = new Map<string, { rawMaterialId: string; baseQty: number }>();

  for (const item of orderItems) {
    const menuItem = menuItemsMap.get(item.menuItemId);
    if (!menuItem || !menuItem.recipeId) continue;

    const recipe = recipesMap.get(menuItem.recipeId);
    if (!recipe) continue;

    const yieldFactor = Math.max(1, recipe.yieldServings || 1);
    const multiplier = item.quantity;

    for (const ing of recipe.ingredients) {
      const ingBaseQty = ing.baseUnitQty || toBaseUnitQuantity(ing.quantity, ing.unit);
      // Consume exact quantity per portion (batch base qty / yield * ordered portions)
      const portionBaseQty = ingBaseQty / yieldFactor;
      const totalIngBaseQty = portionBaseQty * multiplier;

      const current = aggregatedBaseRequirements.get(ing.rawMaterialId) || {
        rawMaterialId: ing.rawMaterialId,
        baseQty: 0,
      };
      current.baseQty += totalIngBaseQty;
      aggregatedBaseRequirements.set(ing.rawMaterialId, current);
    }
  }

  // 2. Compare against current inventory
  const requirements: StockRequirement[] = [];
  const insufficientItems: StockRequirement[] = [];
  let totalEstimatedCost = 0;

  aggregatedBaseRequirements.forEach((req, rawId) => {
    const rawMaterial = rawMaterialsMap.get(rawId);
    if (!rawMaterial) return;

    const availableBaseQty = rawMaterial.currentQty;
    const isSufficient = availableBaseQty >= req.baseQty;
    const deficitBaseQty = isSufficient ? 0 : req.baseQty - availableBaseQty;
    const remainingBaseQty = Math.max(0, availableBaseQty - req.baseQty);

    const rawDef = UNIT_DEFINITIONS[rawMaterial.unit];
    const baseFactor = rawDef ? rawDef.toBaseFactor : 1;
    const costPerBaseUnit = rawMaterial.purchasePrice / baseFactor;
    const costImpact = Math.round(req.baseQty * costPerBaseUnit * 100) / 100;
    totalEstimatedCost += costImpact;

    const itemRequirement: StockRequirement = {
      rawMaterialId: rawMaterial.id,
      rawMaterialName: rawMaterial.name,
      sku: rawMaterial.sku,
      unit: rawMaterial.unit,
      baseUnit: rawMaterial.baseUnit,
      requiredBaseQty: req.baseQty,
      availableBaseQty,
      remainingBaseQty,
      deficitBaseQty,
      requiredFormatted: smartFormatBaseQuantity(req.baseQty, rawMaterial.baseUnit),
      availableFormatted: smartFormatBaseQuantity(availableBaseQty, rawMaterial.baseUnit),
      remainingFormatted: smartFormatBaseQuantity(remainingBaseQty, rawMaterial.baseUnit),
      deficitFormatted: smartFormatBaseQuantity(deficitBaseQty, rawMaterial.baseUnit),
      isSufficient,
      costImpact,
    };

    requirements.push(itemRequirement);

    if (!isSufficient) {
      insufficientItems.push(itemRequirement);
    }
  });

  return {
    isValid: insufficientItems.length === 0,
    requirements,
    insufficientItems,
    totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
  };
}

export interface ConsumptionDeductionItem {
  rawMaterialId: string;
  rawMaterialName: string;
  sku: string;
  displayUnit: UnitType;
  baseUnit: UnitType;
  baseQtyToDeduct: number;
  displayQtyToDeduct: number;
  unitCost: number;
  totalCost: number;
}

/**
 * Calculates the exact deductions per raw material when an order is completed.
 * Formula: Actual Consumption = (BOM Quantity in base units / Recipe Yield) * Quantity Sold/Produced
 */
export function calculateOrderDeductions(
  orderItems: OrderItem[],
  menuItemsMap: Map<string, MenuItem>,
  recipesMap: Map<string, Recipe>,
  rawMaterialsMap: Map<string, RawMaterial>
): ConsumptionDeductionItem[] {
  const aggregated = new Map<string, number>();

  for (const item of orderItems) {
    const menuItem = menuItemsMap.get(item.menuItemId);
    const recipeId = item.recipeId || menuItem?.recipeId;
    if (!recipeId) continue;

    const recipe = recipesMap.get(recipeId);
    if (!recipe) continue;

    const yieldFactor = Math.max(1, recipe.yieldServings || 1);
    const multiplier = item.quantity;

    for (const ing of recipe.ingredients) {
      const ingBaseQty = ing.baseUnitQty || toBaseUnitQuantity(ing.quantity, ing.unit);
      const portionBaseQty = ingBaseQty / yieldFactor;
      const totalIngBaseQty = portionBaseQty * multiplier;

      const current = aggregated.get(ing.rawMaterialId) || 0;
      aggregated.set(ing.rawMaterialId, current + totalIngBaseQty);
    }
  }

  const result: ConsumptionDeductionItem[] = [];

  aggregated.forEach((baseQty, rawId) => {
    const rawMaterial = rawMaterialsMap.get(rawId);
    if (!rawMaterial) return;

    const rawDef = UNIT_DEFINITIONS[rawMaterial.unit];
    const baseFactor = rawDef ? rawDef.toBaseFactor : 1;
    const costPerBaseUnit = rawMaterial.purchasePrice / baseFactor;
    const totalCost = Math.round(baseQty * costPerBaseUnit * 100) / 100;
    const displayQty = fromBaseUnitQuantity(baseQty, rawMaterial.unit);

    result.push({
      rawMaterialId: rawMaterial.id,
      rawMaterialName: rawMaterial.name,
      sku: rawMaterial.sku,
      displayUnit: rawMaterial.unit,
      baseUnit: rawMaterial.baseUnit,
      baseQtyToDeduct: baseQty,
      displayQtyToDeduct: displayQty,
      unitCost: rawMaterial.purchasePrice,
      totalCost,
    });
  });

  return result;
}
