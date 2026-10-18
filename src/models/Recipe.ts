import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecipeIngredient {
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;
  unit: string;
  baseUnitQty: number;
  calculatedCost: number;
}

export interface IRecipe extends Document {
  menuItemId?: string;
  menuItemName: string;
  code: string;
  category: string;
  portionSize: string;
  version: number;
  yieldServings: number;
  sellingPrice: number;
  ingredients: IRecipeIngredient[];
  totalFoodCost: number;
  grossMarginRs: number;
  foodCostPercentage: number;
  notes?: string;
  preparationInstructions?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeIngredientSchema = new Schema<IRecipeIngredient>(
  {
    rawMaterialId: { type: String, required: true },
    rawMaterialName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    baseUnitQty: { type: Number, required: true },
    calculatedCost: { type: Number, required: true },
  },
  { _id: false }
);

const RecipeSchema = new Schema<IRecipe>(
  {
    menuItemId: { type: String },
    menuItemName: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    category: { type: String, required: true, index: true },
    portionSize: { type: String, default: 'Single' },
    version: { type: Number, default: 1 },
    yieldServings: { type: Number, default: 1 },
    sellingPrice: { type: Number, required: true },
    ingredients: { type: [RecipeIngredientSchema], required: true },
    totalFoodCost: { type: Number, default: 0 },
    grossMarginRs: { type: Number, default: 0 },
    foodCostPercentage: { type: Number, default: 0 },
    notes: { type: String },
    preparationInstructions: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Recipe: Model<IRecipe> =
  mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);
