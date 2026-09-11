import { UnitType, UnitDimension } from '../types';

export interface UnitDefinition {
  type: UnitType;
  dimension: UnitDimension;
  baseUnit: UnitType;
  toBaseFactor: number; // Multiplier to convert from this unit to base unit
  label: string;
  shortLabel: string;
  step: number;
}

export const UNIT_DEFINITIONS: Record<UnitType, UnitDefinition> = {
  KG: {
    type: 'KG',
    dimension: 'mass',
    baseUnit: 'Gram',
    toBaseFactor: 1000,
    label: 'Kilogram (KG)',
    shortLabel: 'kg',
    step: 0.01,
  },
  Gram: {
    type: 'Gram',
    dimension: 'mass',
    baseUnit: 'Gram',
    toBaseFactor: 1,
    label: 'Gram (g)',
    shortLabel: 'g',
    step: 1,
  },
  Liter: {
    type: 'Liter',
    dimension: 'volume',
    baseUnit: 'ML',
    toBaseFactor: 1000,
    label: 'Liter (L)',
    shortLabel: 'L',
    step: 0.01,
  },
  ML: {
    type: 'ML',
    dimension: 'volume',
    baseUnit: 'ML',
    toBaseFactor: 1,
    label: 'Milliliter (ml)',
    shortLabel: 'ml',
    step: 1,
  },
  Cup: {
    type: 'Cup',
    dimension: 'volume',
    baseUnit: 'ML',
    toBaseFactor: 250, // 1 Standard Cup = 250 ML
    label: 'Cup (cup = 250ml)',
    shortLabel: 'cup',
    step: 0.5,
  },
  Piece: {
    type: 'Piece',
    dimension: 'count',
    baseUnit: 'Piece',
    toBaseFactor: 1,
    label: 'Piece (pcs)',
    shortLabel: 'pcs',
    step: 1,
  },
  Pack: {
    type: 'Pack',
    dimension: 'count',
    baseUnit: 'Piece',
    toBaseFactor: 1,
    label: 'Packet / Pack (pk)',
    shortLabel: 'pk',
    step: 1,
  },
  Box: {
    type: 'Box',
    dimension: 'count',
    baseUnit: 'Piece',
    toBaseFactor: 1,
    label: 'Box (bx)',
    shortLabel: 'bx',
    step: 1,
  },
  Bottle: {
    type: 'Bottle',
    dimension: 'count',
    baseUnit: 'Piece',
    toBaseFactor: 1,
    label: 'Bottle (btl)',
    shortLabel: 'btl',
    step: 1,
  },
  Dozen: {
    type: 'Dozen',
    dimension: 'count',
    baseUnit: 'Piece',
    toBaseFactor: 12, // 1 Dozen = 12 Pieces
    label: 'Dozen (dz = 12 pcs)',
    shortLabel: 'dz',
    step: 1,
  },
  Plate: {
    type: 'Plate',
    dimension: 'count',
    baseUnit: 'Piece',
    toBaseFactor: 1,
    label: 'Plate (plt)',
    shortLabel: 'plt',
    step: 1,
  },
  Portion: {
    type: 'Portion',
    dimension: 'count',
    baseUnit: 'Piece',
    toBaseFactor: 1,
    label: 'Portion (prt)',
    shortLabel: 'prt',
    step: 1,
  },
  Other: {
    type: 'Other',
    dimension: 'count',
    baseUnit: 'Piece',
    toBaseFactor: 1,
    label: 'Other Unit (unit)',
    shortLabel: 'unit',
    step: 1,
  },
};

/**
 * Gets the canonical base unit for a given unit type.
 */
export function getBaseUnit(unit: UnitType): UnitType {
  return UNIT_DEFINITIONS[unit]?.baseUnit || unit;
}

/**
 * Gets the dimension category (mass, volume, count) of a unit.
 */
export function getUnitDimension(unit: UnitType): UnitDimension {
  return UNIT_DEFINITIONS[unit]?.dimension || 'count';
}

/**
 * Checks if two units are dimensionally compatible (e.g. KG and Gram are compatible, KG and Liter are not).
 */
export function areUnitsCompatible(unitA: UnitType, unitB: UnitType): boolean {
  if (unitA === unitB) return true;
  return getUnitDimension(unitA) === getUnitDimension(unitB);
}

/**
 * Converts a quantity from one unit to another.
 * Throws an error or returns null if units are dimensionally incompatible.
 */
export function convertUnit(
  quantity: number,
  fromUnit: UnitType,
  toUnit: UnitType
): number {
  if (fromUnit === toUnit) return quantity;

  const defFrom = UNIT_DEFINITIONS[fromUnit];
  const defTo = UNIT_DEFINITIONS[toUnit];

  if (!defFrom || !defTo) {
    throw new Error(`Unknown unit conversion: ${fromUnit} -> ${toUnit}`);
  }

  if (defFrom.dimension !== defTo.dimension) {
    throw new Error(
      `Cannot convert between incompatible dimensions: ${fromUnit} (${defFrom.dimension}) and ${toUnit} (${defTo.dimension})`
    );
  }

  // 1. Convert from source unit to base unit
  const baseQty = quantity * defFrom.toBaseFactor;

  // 2. Convert from base unit to target unit
  const result = baseQty / defTo.toBaseFactor;

  // Return rounded to 4 decimal places to prevent floating point noise
  return Math.round(result * 10000) / 10000;
}

/**
 * Converts a quantity into the canonical base unit (e.g. 2.5 KG -> 2500 Grams).
 */
export function toBaseUnitQuantity(quantity: number, unit: UnitType): number {
  const def = UNIT_DEFINITIONS[unit];
  if (!def) return quantity;
  return Math.round(quantity * def.toBaseFactor * 10000) / 10000;
}

/**
 * Converts a quantity from base unit to a target display unit (e.g. 2500 Grams -> 2.5 KG).
 */
export function fromBaseUnitQuantity(baseQty: number, targetUnit: UnitType): number {
  const def = UNIT_DEFINITIONS[targetUnit];
  if (!def) return baseQty;
  return Math.round((baseQty / def.toBaseFactor) * 10000) / 10000;
}

/**
 * Formats a quantity nicely with unit label.
 * E.g. (1500, 'Gram', 'KG') -> "1.5 kg"
 */
export function formatQuantityWithUnit(
  quantity: number,
  unit: UnitType,
  showFullLabel: boolean = false
): string {
  const def = UNIT_DEFINITIONS[unit];
  const label = showFullLabel ? (def ? def.label : unit) : (def ? def.shortLabel : unit);
  
  // Format clean decimal (remove trailing zeros)
  const numStr = Number(quantity.toFixed(3)).toString();
  return `${numStr} ${label}`;
}

/**
 * Smart automatic formatting:
 * If mass > 1000 g, display as KG. If < 1000 g, display as g.
 * If volume > 1000 ml, display as L. If < 1000 ml, display as ml.
 */
export function smartFormatBaseQuantity(baseQty: number, baseUnit: UnitType): string {
  if (baseUnit === 'Gram') {
    if (Math.abs(baseQty) >= 1000) {
      const kg = baseQty / 1000;
      return `${Number(kg.toFixed(2))} kg`;
    }
    return `${Number(baseQty.toFixed(1))} g`;
  }

  if (baseUnit === 'ML') {
    if (Math.abs(baseQty) >= 1000) {
      const l = baseQty / 1000;
      return `${Number(l.toFixed(2))} L`;
    }
    return `${Number(baseQty.toFixed(1))} ml`;
  }

  return `${Number(baseQty.toFixed(1))} ${baseUnit.toLowerCase()}`;
}

/**
 * Returns allowed units for a given dimension or base unit.
 */
export function getCompatibleUnits(unit: UnitType): UnitType[] {
  const dimension = getUnitDimension(unit);
  return (Object.keys(UNIT_DEFINITIONS) as UnitType[]).filter(
    (u) => UNIT_DEFINITIONS[u].dimension === dimension
  );
}
