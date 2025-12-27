import { ItemDefinition } from '@/types';

export const ITEMS: Record<string, ItemDefinition> = {
  // =====================
  // CONSUMABLES
  // =====================
  healing_salve: {
    id: 'healing_salve',
    name: 'Healing Salve',
    description: 'Restores 100 HP instantly.',
    category: 'consumable',
    cost: 100,
    charges: 1,
    isActive: true,
    activeEffect: {
      targetType: 'no_target',
      effects: [
        { type: 'hot', value: 100 },
      ],
    },
  },
  clarity: {
    id: 'clarity',
    name: 'Clarity',
    description: 'Restores 75 mana instantly.',
    category: 'consumable',
    cost: 50,
    charges: 1,
    isActive: true,
    activeEffect: {
      targetType: 'no_target',
      effects: [
        { type: 'stat_modifier', stat: 'mana', value: 75 },
      ],
    },
  },
  tango: {
    id: 'tango',
    name: 'Tango',
    description: 'Restores 50 HP over 5 seconds.',
    category: 'consumable',
    cost: 90,
    charges: 3,
    isActive: true,
    activeEffect: {
      targetType: 'no_target',
      effects: [
        { type: 'hot', value: 50 },
      ],
    },
  },
  tp_scroll: {
    id: 'tp_scroll',
    name: 'Town Portal Scroll',
    description: 'Teleport to an allied building.',
    category: 'consumable',
    cost: 100,
    charges: 1,
    isActive: true,
    cooldown: 80,
    activeEffect: {
      targetType: 'point',
      effects: [],
    },
  },

  // =====================
  // BASIC ITEMS
  // =====================
  iron_branch: {
    id: 'iron_branch',
    name: 'Iron Branch',
    description: '+1 to all attributes.',
    category: 'basic',
    cost: 50,
    isActive: false,
    bonusAttributes: {
      strength: 1,
      agility: 1,
      intelligence: 1,
    },
  },
  circlet: {
    id: 'circlet',
    name: 'Circlet',
    description: '+2 to all attributes.',
    category: 'basic',
    cost: 155,
    isActive: false,
    bonusAttributes: {
      strength: 2,
      agility: 2,
      intelligence: 2,
    },
  },
  belt_of_strength: {
    id: 'belt_of_strength',
    name: 'Belt of Strength',
    description: '+6 Strength.',
    category: 'basic',
    cost: 450,
    isActive: false,
    bonusAttributes: {
      strength: 6,
    },
  },
  band_of_elvenskin: {
    id: 'band_of_elvenskin',
    name: 'Band of Elvenskin',
    description: '+6 Agility.',
    category: 'basic',
    cost: 450,
    isActive: false,
    bonusAttributes: {
      agility: 6,
    },
  },
  robe_of_magi: {
    id: 'robe_of_magi',
    name: 'Robe of the Magi',
    description: '+6 Intelligence.',
    category: 'basic',
    cost: 450,
    isActive: false,
    bonusAttributes: {
      intelligence: 6,
    },
  },
  boots_of_speed: {
    id: 'boots_of_speed',
    name: 'Boots of Speed',
    description: '+45 Movement Speed.',
    category: 'basic',
    cost: 500,
    isActive: false,
    stats: {
      movementSpeed: 45,
    },
  },
  gloves_of_haste: {
    id: 'gloves_of_haste',
    name: 'Gloves of Haste',
    description: '+20 Attack Speed.',
    category: 'basic',
    cost: 450,
    isActive: false,
    stats: {
      attackSpeed: 0.2,
    },
  },
  broadsword: {
    id: 'broadsword',
    name: 'Broadsword',
    description: '+18 Damage.',
    category: 'basic',
    cost: 1000,
    isActive: false,
    stats: {
      attackDamage: 18,
    },
  },
  chainmail: {
    id: 'chainmail',
    name: 'Chainmail',
    description: '+5 Armor.',
    category: 'basic',
    cost: 500,
    isActive: false,
    stats: {
      armor: 5,
    },
  },

  // =====================
  // UPGRADED ITEMS
  // =====================
  power_treads_str: {
    id: 'power_treads_str',
    name: 'Power Treads (STR)',
    description: '+45 MS, +10 Strength, +25 Attack Speed.',
    category: 'upgraded',
    cost: 1400,
    components: ['boots_of_speed', 'gloves_of_haste', 'belt_of_strength'],
    isActive: false,
    stats: {
      movementSpeed: 45,
      attackSpeed: 0.25,
    },
    bonusAttributes: {
      strength: 10,
    },
  },
  power_treads_agi: {
    id: 'power_treads_agi',
    name: 'Power Treads (AGI)',
    description: '+45 MS, +10 Agility, +25 Attack Speed.',
    category: 'upgraded',
    cost: 1400,
    components: ['boots_of_speed', 'gloves_of_haste', 'band_of_elvenskin'],
    isActive: false,
    stats: {
      movementSpeed: 45,
      attackSpeed: 0.25,
    },
    bonusAttributes: {
      agility: 10,
    },
  },
  power_treads_int: {
    id: 'power_treads_int',
    name: 'Power Treads (INT)',
    description: '+45 MS, +10 Intelligence, +25 Attack Speed.',
    category: 'upgraded',
    cost: 1400,
    components: ['boots_of_speed', 'gloves_of_haste', 'robe_of_magi'],
    isActive: false,
    stats: {
      movementSpeed: 45,
      attackSpeed: 0.25,
    },
    bonusAttributes: {
      intelligence: 10,
    },
  },
  bracer: {
    id: 'bracer',
    name: 'Bracer',
    description: '+5 to all attributes, +3 Strength.',
    category: 'upgraded',
    cost: 505,
    components: ['circlet', 'circlet'],
    recipe: 195,
    isActive: false,
    bonusAttributes: {
      strength: 8,
      agility: 5,
      intelligence: 5,
    },
  },
  wraith_band: {
    id: 'wraith_band',
    name: 'Wraith Band',
    description: '+5 to all attributes, +3 Agility.',
    category: 'upgraded',
    cost: 505,
    components: ['circlet', 'circlet'],
    recipe: 195,
    isActive: false,
    bonusAttributes: {
      strength: 5,
      agility: 8,
      intelligence: 5,
    },
  },
  null_talisman: {
    id: 'null_talisman',
    name: 'Null Talisman',
    description: '+5 to all attributes, +3 Intelligence.',
    category: 'upgraded',
    cost: 505,
    components: ['circlet', 'circlet'],
    recipe: 195,
    isActive: false,
    bonusAttributes: {
      strength: 5,
      agility: 5,
      intelligence: 8,
    },
  },
  blade_mail: {
    id: 'blade_mail',
    name: 'Blade Mail',
    description: 'Active: Reflect damage for 4.5 seconds.',
    category: 'upgraded',
    cost: 2100,
    components: ['broadsword', 'chainmail'],
    recipe: 600,
    isActive: true,
    cooldown: 25,
    stats: {
      attackDamage: 18,
      armor: 5,
    },
    bonusAttributes: {
      intelligence: 6,
    },
    activeEffect: {
      targetType: 'no_target',
      effects: [],
    },
  },

  // =====================
  // ARTIFACTS
  // =====================
  daedalus: {
    id: 'daedalus',
    name: 'Daedalus',
    description: '+88 Damage. 30% chance for 225% critical strike.',
    category: 'artifact',
    cost: 5150,
    components: ['broadsword', 'broadsword'],
    recipe: 1150,
    isActive: false,
    stats: {
      attackDamage: 88,
    },
    passiveEffects: [
      {
        type: 'on_attack',
        chance: 30,
        effect: { type: 'stat_modifier', stat: 'attackDamage', value: 125, isPercentage: true },
      },
    ],
  },
  heart_of_tarrasque: {
    id: 'heart_of_tarrasque',
    name: 'Heart of Tarrasque',
    description: '+45 Strength, +250 Health, +1.6% max HP regen.',
    category: 'artifact',
    cost: 5000,
    components: ['belt_of_strength', 'belt_of_strength'],
    recipe: 3000,
    isActive: false,
    stats: {
      maxHealth: 250,
      healthRegen: 16,
    },
    bonusAttributes: {
      strength: 45,
    },
  },
  eye_of_skadi: {
    id: 'eye_of_skadi',
    name: 'Eye of Skadi',
    description: '+22 to all attributes, +225 Health/Mana. Attacks slow.',
    category: 'artifact',
    cost: 5300,
    components: ['circlet', 'circlet', 'circlet', 'circlet'],
    recipe: 2400,
    isActive: false,
    stats: {
      maxHealth: 225,
      maxMana: 225,
    },
    bonusAttributes: {
      strength: 22,
      agility: 22,
      intelligence: 22,
    },
    passiveEffects: [
      {
        type: 'on_attack',
        effect: { type: 'control', controlEffect: 'slow' },
      },
    ],
  },
  butterfly: {
    id: 'butterfly',
    name: 'Butterfly',
    description: '+30 Agility, +35% Evasion, +25 Damage.',
    category: 'artifact',
    cost: 4975,
    components: ['band_of_elvenskin', 'band_of_elvenskin'],
    recipe: 3075,
    isActive: false,
    stats: {
      attackDamage: 25,
    },
    bonusAttributes: {
      agility: 30,
    },
  },
  blink_dagger: {
    id: 'blink_dagger',
    name: 'Blink Dagger',
    description: 'Active: Teleport to target point.',
    category: 'artifact',
    cost: 2250,
    isActive: true,
    cooldown: 15,
    activeEffect: {
      targetType: 'point',
      castRange: 960,
      effects: [],
    },
  },
  black_king_bar: {
    id: 'black_king_bar',
    name: 'Black King Bar',
    description: '+24 Damage, +10 Strength. Active: Magic Immunity.',
    category: 'artifact',
    cost: 4050,
    components: ['broadsword', 'belt_of_strength'],
    recipe: 1600,
    isActive: true,
    cooldown: 75,
    stats: {
      attackDamage: 24,
    },
    bonusAttributes: {
      strength: 10,
    },
    activeEffect: {
      targetType: 'no_target',
      effects: [],
    },
  },
};

export function getItemDefinition(id: string): ItemDefinition | undefined {
  return ITEMS[id];
}

export function getAllItems(): ItemDefinition[] {
  return Object.values(ITEMS);
}

export function getItemsByCategory(category: ItemDefinition['category']): ItemDefinition[] {
  return Object.values(ITEMS).filter(item => item.category === category);
}
