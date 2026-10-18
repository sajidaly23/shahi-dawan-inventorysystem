import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Recipe } from '@/models/Recipe';
import { recipeSchema } from '@/lib/validations/inventory';
import { INITIAL_RECIPES } from '@/data/seedData';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const db = await connectToDatabase();

    if (db) {
      const recipes = await Recipe.find({ isActive: true }).sort({ updatedAt: -1 });
      if (recipes.length > 0) {
        return NextResponse.json({ success: true, count: recipes.length, data: recipes });
      }
    }

    return NextResponse.json({
      success: true,
      count: INITIAL_RECIPES.length,
      data: INITIAL_RECIPES,
    });
  } catch (error: any) {
    console.error('Recipes GET API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (user && (user.role === 'waiter' || user.role === 'cashier')) {
      return NextResponse.json({ error: 'Unauthorized: Role cannot configure BOM recipes' }, { status: 403 });
    }

    const body = await request.json();
    const result = recipeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid recipe data' },
        { status: 400 }
      );
    }

    const recipeData = result.data;
    const db = await connectToDatabase();

    const totalFoodCost = recipeData.ingredients.reduce(
      (sum, i) => sum + (i.calculatedCost || 0),
      0
    );
    const grossMarginRs = recipeData.sellingPrice - totalFoodCost;
    const foodCostPercentage =
      recipeData.sellingPrice > 0
        ? Math.round((totalFoodCost / recipeData.sellingPrice) * 1000) / 10
        : 0;

    if (db) {
      const newRecipe = await Recipe.create({
        ...recipeData,
        code: recipeData.code.toUpperCase(),
        totalFoodCost,
        grossMarginRs,
        foodCostPercentage,
      });

      return NextResponse.json({ success: true, data: newRecipe }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: `rec-${Date.now()}`,
        ...recipeData,
        code: recipeData.code.toUpperCase(),
        totalFoodCost,
        grossMarginRs,
        foodCostPercentage,
        isActive: true,
      },
    });
  } catch (error: any) {
    console.error('Recipes POST API Error:', error);
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}
