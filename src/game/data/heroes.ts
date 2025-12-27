import { HeroDefinition } from '@/types';

export const HEROES: Record<string, HeroDefinition> = {
  // 1. Warrior (Strength, Melee)
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    title: 'The Berserker',
    primaryAttribute: 'strength',
    attackType: 'melee',
    baseAttributes: {
      strength: 25,
      agility: 15,
      intelligence: 14,
    },
    attributeGain: {
      strength: 3.2,
      agility: 1.5,
      intelligence: 1.4,
    },
    baseStats: {
      health: 200,
      mana: 75,
      healthRegen: 1.0,
      manaRegen: 0.5,
      armor: 2,
      magicResistance: 25,
      attackDamage: [52, 60],
      attackSpeed: 1.0,
      attackRange: 32,
      movementSpeed: 290,
    },
    abilities: ['warrior_battle_cry', 'warrior_fury', 'warrior_counter', 'warrior_execute'],
    portrait: '/assets/sprites/heroes/warrior/portrait.png',
    spriteSheet: '/assets/sprites/heroes/warrior/spritesheet.png',
  },

  // 2. Archer (Agility, Ranged)
  archer: {
    id: 'archer',
    name: 'Archer',
    title: 'The Frost Ranger',
    primaryAttribute: 'agility',
    attackType: 'ranged',
    baseAttributes: {
      strength: 16,
      agility: 26,
      intelligence: 15,
    },
    attributeGain: {
      strength: 1.7,
      agility: 3.3,
      intelligence: 1.4,
    },
    baseStats: {
      health: 200,
      mana: 75,
      healthRegen: 0.75,
      manaRegen: 0.6,
      armor: 1,
      magicResistance: 25,
      attackDamage: [44, 50],
      attackSpeed: 1.4,
      attackRange: 192,
      movementSpeed: 300,
    },
    abilities: ['archer_frost_arrows', 'archer_silence', 'archer_precision_aura', 'archer_snipe'],
    portrait: '/assets/sprites/heroes/archer/portrait.png',
    spriteSheet: '/assets/sprites/heroes/archer/spritesheet.png',
  },

  // 3. Ice Mage (Intelligence, Ranged)
  ice_mage: {
    id: 'ice_mage',
    name: 'Ice Mage',
    title: 'The Cryomancer',
    primaryAttribute: 'intelligence',
    attackType: 'ranged',
    baseAttributes: {
      strength: 18,
      agility: 14,
      intelligence: 27,
    },
    attributeGain: {
      strength: 1.5,
      agility: 1.4,
      intelligence: 3.5,
    },
    baseStats: {
      health: 200,
      mana: 150,
      healthRegen: 0.5,
      manaRegen: 1.5,
      armor: 0,
      magicResistance: 25,
      attackDamage: [40, 46],
      attackSpeed: 1.0,
      attackRange: 160,
      movementSpeed: 280,
    },
    abilities: ['ice_mage_freeze', 'ice_mage_ice_blast', 'ice_mage_mana_aura', 'ice_mage_blizzard'],
    portrait: '/assets/sprites/heroes/ice_mage/portrait.png',
    spriteSheet: '/assets/sprites/heroes/ice_mage/spritesheet.png',
  },

  // 4. Assassin (Agility, Melee)
  assassin: {
    id: 'assassin',
    name: 'Assassin',
    title: 'The Shadow',
    primaryAttribute: 'agility',
    attackType: 'melee',
    baseAttributes: {
      strength: 18,
      agility: 29,
      intelligence: 14,
    },
    attributeGain: {
      strength: 1.9,
      agility: 3.4,
      intelligence: 1.2,
    },
    baseStats: {
      health: 200,
      mana: 75,
      healthRegen: 0.6,
      manaRegen: 0.5,
      armor: 3,
      magicResistance: 25,
      attackDamage: [48, 54],
      attackSpeed: 1.5,
      attackRange: 32,
      movementSpeed: 310,
    },
    abilities: ['assassin_dagger', 'assassin_evasion', 'assassin_crit', 'assassin_backstab'],
    portrait: '/assets/sprites/heroes/assassin/portrait.png',
    spriteSheet: '/assets/sprites/heroes/assassin/spritesheet.png',
  },

  // 5. Tank (Strength, Melee)
  tank: {
    id: 'tank',
    name: 'Tank',
    title: 'The Bulwark',
    primaryAttribute: 'strength',
    attackType: 'melee',
    baseAttributes: {
      strength: 30,
      agility: 12,
      intelligence: 16,
    },
    attributeGain: {
      strength: 3.8,
      agility: 1.0,
      intelligence: 1.2,
    },
    baseStats: {
      health: 300,
      mana: 100,
      healthRegen: 1.5,
      manaRegen: 0.4,
      armor: 5,
      magicResistance: 25,
      attackDamage: [45, 50],
      attackSpeed: 0.8,
      attackRange: 32,
      movementSpeed: 270,
    },
    abilities: ['tank_taunt', 'tank_thorns', 'tank_thick_skin', 'tank_charge'],
    portrait: '/assets/sprites/heroes/tank/portrait.png',
    spriteSheet: '/assets/sprites/heroes/tank/spritesheet.png',
  },

  // 6. Support (Intelligence, Ranged)
  support: {
    id: 'support',
    name: 'Support',
    title: 'The Enchanter',
    primaryAttribute: 'intelligence',
    attackType: 'ranged',
    baseAttributes: {
      strength: 16,
      agility: 16,
      intelligence: 24,
    },
    attributeGain: {
      strength: 1.6,
      agility: 1.6,
      intelligence: 3.2,
    },
    baseStats: {
      health: 200,
      mana: 120,
      healthRegen: 0.6,
      manaRegen: 1.2,
      armor: 0,
      magicResistance: 25,
      attackDamage: [38, 44],
      attackSpeed: 1.0,
      attackRange: 160,
      movementSpeed: 285,
    },
    abilities: ['support_hex', 'support_mana_drain', 'support_stun', 'support_finger'],
    portrait: '/assets/sprites/heroes/support/portrait.png',
    spriteSheet: '/assets/sprites/heroes/support/spritesheet.png',
  },

  // 7. Swordsman (Agility, Melee)
  swordsman: {
    id: 'swordsman',
    name: 'Swordsman',
    title: 'The Blade Master',
    primaryAttribute: 'agility',
    attackType: 'melee',
    baseAttributes: {
      strength: 20,
      agility: 24,
      intelligence: 14,
    },
    attributeGain: {
      strength: 2.2,
      agility: 2.8,
      intelligence: 1.4,
    },
    baseStats: {
      health: 200,
      mana: 75,
      healthRegen: 0.8,
      manaRegen: 0.5,
      armor: 2,
      magicResistance: 25,
      attackDamage: [50, 56],
      attackSpeed: 1.2,
      attackRange: 32,
      movementSpeed: 295,
    },
    abilities: ['swordsman_spin', 'swordsman_heal', 'swordsman_crit', 'swordsman_omnislash'],
    portrait: '/assets/sprites/heroes/swordsman/portrait.png',
    spriteSheet: '/assets/sprites/heroes/swordsman/spritesheet.png',
  },

  // 8. Thunderer (Intelligence, Ranged)
  thunderer: {
    id: 'thunderer',
    name: 'Thunderer',
    title: 'The Storm Lord',
    primaryAttribute: 'intelligence',
    attackType: 'ranged',
    baseAttributes: {
      strength: 19,
      agility: 15,
      intelligence: 28,
    },
    attributeGain: {
      strength: 1.8,
      agility: 1.5,
      intelligence: 3.6,
    },
    baseStats: {
      health: 200,
      mana: 140,
      healthRegen: 0.5,
      manaRegen: 1.4,
      armor: 0,
      magicResistance: 25,
      attackDamage: [42, 48],
      attackSpeed: 1.0,
      attackRange: 160,
      movementSpeed: 285,
    },
    abilities: ['thunderer_bolt', 'thunderer_chain', 'thunderer_static', 'thunderer_wrath'],
    portrait: '/assets/sprites/heroes/thunderer/portrait.png',
    spriteSheet: '/assets/sprites/heroes/thunderer/spritesheet.png',
  },

  // 9. Earth Shaman (Strength, Melee)
  earth_shaman: {
    id: 'earth_shaman',
    name: 'Earth Shaman',
    title: 'The Earthshaker',
    primaryAttribute: 'strength',
    attackType: 'melee',
    baseAttributes: {
      strength: 24,
      agility: 12,
      intelligence: 18,
    },
    attributeGain: {
      strength: 2.9,
      agility: 1.3,
      intelligence: 1.8,
    },
    baseStats: {
      health: 200,
      mana: 100,
      healthRegen: 0.9,
      manaRegen: 0.7,
      armor: 2,
      magicResistance: 25,
      attackDamage: [48, 54],
      attackSpeed: 0.9,
      attackRange: 32,
      movementSpeed: 280,
    },
    abilities: ['shaman_fissure', 'shaman_totem', 'shaman_bash', 'shaman_echo'],
    portrait: '/assets/sprites/heroes/earth_shaman/portrait.png',
    spriteSheet: '/assets/sprites/heroes/earth_shaman/spritesheet.png',
  },

  // 10. Druid (Intelligence, Ranged)
  druid: {
    id: 'druid',
    name: 'Druid',
    title: "Nature's Prophet",
    primaryAttribute: 'intelligence',
    attackType: 'ranged',
    baseAttributes: {
      strength: 19,
      agility: 18,
      intelligence: 25,
    },
    attributeGain: {
      strength: 1.8,
      agility: 1.8,
      intelligence: 3.0,
    },
    baseStats: {
      health: 200,
      mana: 130,
      healthRegen: 0.6,
      manaRegen: 1.0,
      armor: 1,
      magicResistance: 25,
      attackDamage: [40, 48],
      attackSpeed: 1.1,
      attackRange: 160,
      movementSpeed: 290,
    },
    abilities: ['druid_treants', 'druid_teleport', 'druid_sprout', 'druid_wrath'],
    portrait: '/assets/sprites/heroes/druid/portrait.png',
    spriteSheet: '/assets/sprites/heroes/druid/spritesheet.png',
  },
};

export function getHeroDefinition(id: string): HeroDefinition | undefined {
  return HEROES[id];
}

export function getAllHeroes(): HeroDefinition[] {
  return Object.values(HEROES);
}
