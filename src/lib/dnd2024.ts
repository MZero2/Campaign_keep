export const DND_2024_CLASSES = [
  { key: "barbarian", label: "Barbarian", hitDie: 12 },
  { key: "bard", label: "Bard", hitDie: 8 },
  { key: "cleric", label: "Cleric", hitDie: 8 },
  { key: "druid", label: "Druid", hitDie: 8 },
  { key: "fighter", label: "Fighter", hitDie: 10 },
  { key: "monk", label: "Monk", hitDie: 8 },
  { key: "paladin", label: "Paladin", hitDie: 10 },
  { key: "ranger", label: "Ranger", hitDie: 10 },
  { key: "rogue", label: "Rogue", hitDie: 8 },
  { key: "sorcerer", label: "Sorcerer", hitDie: 6 },
  { key: "warlock", label: "Warlock", hitDie: 8 },
  { key: "wizard", label: "Wizard", hitDie: 6 },
] as const;

export const DND_2024_CLASS_LABELS = DND_2024_CLASSES.map((entry) => entry.label);

export type DndClassMetadata = {
  primaryAbility: string;
  spellcastingAbility?: string;
  savingThrowProficiencies: string[];
  subclassUnlockLevel: number;
};

export const DND_2024_CLASS_METADATA: Record<string, DndClassMetadata> = {
  Barbarian: {
    primaryAbility: "STR",
    savingThrowProficiencies: ["STR", "CON"],
    subclassUnlockLevel: 3,
  },
  Bard: {
    primaryAbility: "CHA",
    spellcastingAbility: "CHA",
    savingThrowProficiencies: ["DEX", "CHA"],
    subclassUnlockLevel: 3,
  },
  Cleric: {
    primaryAbility: "WIS",
    spellcastingAbility: "WIS",
    savingThrowProficiencies: ["WIS", "CHA"],
    subclassUnlockLevel: 3,
  },
  Druid: {
    primaryAbility: "WIS",
    spellcastingAbility: "WIS",
    savingThrowProficiencies: ["INT", "WIS"],
    subclassUnlockLevel: 3,
  },
  Fighter: {
    primaryAbility: "STR",
    savingThrowProficiencies: ["STR", "CON"],
    subclassUnlockLevel: 3,
  },
  Monk: {
    primaryAbility: "DEX",
    savingThrowProficiencies: ["STR", "DEX"],
    subclassUnlockLevel: 3,
  },
  Paladin: {
    primaryAbility: "STR",
    spellcastingAbility: "CHA",
    savingThrowProficiencies: ["WIS", "CHA"],
    subclassUnlockLevel: 3,
  },
  Ranger: {
    primaryAbility: "DEX",
    spellcastingAbility: "WIS",
    savingThrowProficiencies: ["STR", "DEX"],
    subclassUnlockLevel: 3,
  },
  Rogue: {
    primaryAbility: "DEX",
    savingThrowProficiencies: ["DEX", "INT"],
    subclassUnlockLevel: 3,
  },
  Sorcerer: {
    primaryAbility: "CHA",
    spellcastingAbility: "CHA",
    savingThrowProficiencies: ["CON", "CHA"],
    subclassUnlockLevel: 3,
  },
  Warlock: {
    primaryAbility: "CHA",
    spellcastingAbility: "CHA",
    savingThrowProficiencies: ["WIS", "CHA"],
    subclassUnlockLevel: 3,
  },
  Wizard: {
    primaryAbility: "INT",
    spellcastingAbility: "INT",
    savingThrowProficiencies: ["INT", "WIS"],
    subclassUnlockLevel: 3,
  },
};

export const DND_2024_SUBCLASSES: Record<string, string[]> = {
  Barbarian: ["Path of the Berserker", "Path of the Wild Heart", "Path of the World Tree", "Path of the Zealot"],
  Bard: ["College of Dance", "College of Glamour", "College of Lore", "College of Valor"],
  Cleric: ["Life Domain", "Light Domain", "Trickery Domain", "War Domain"],
  Druid: ["Circle of the Land", "Circle of the Moon", "Circle of the Sea", "Circle of the Stars"],
  Fighter: ["Battle Master", "Champion", "Eldritch Knight", "Psi Warrior"],
  Monk: ["Warrior of Mercy", "Warrior of Shadow", "Warrior of the Elements", "Warrior of the Open Hand"],
  Paladin: ["Oath of Devotion", "Oath of Glory", "Oath of the Ancients", "Oath of Vengeance"],
  Ranger: ["Beast Master", "Fey Wanderer", "Gloom Stalker", "Hunter"],
  Rogue: ["Arcane Trickster", "Assassin", "Soulknife", "Thief"],
  Sorcerer: ["Aberrant Sorcery", "Clockwork Sorcery", "Draconic Sorcery", "Wild Magic Sorcery"],
  Warlock: ["Archfey Patron", "Celestial Patron", "Fiend Patron", "Great Old One Patron"],
  Wizard: ["Abjurer", "Diviner", "Evoker", "Illusionist"],
};

export type DndClassFeatureEntry = {
  className?: string;
  subclassName?: string;
  name: string;
  level: number;
  actionType?: "Action" | "Bonus Action" | "Reaction" | "Passive" | "Free";
  description: string;
};

export const DND_2024_CLASS_FEATURES: DndClassFeatureEntry[] = [
  { className: "Barbarian", name: "Rage", level: 1, actionType: "Bonus Action", description: "Enter rage for combat power and resilience." },
  { className: "Barbarian", name: "Danger Sense", level: 2, actionType: "Passive", description: "Enhanced reflexes against visible hazards." },
  { className: "Barbarian", name: "Weapon Mastery", level: 1, actionType: "Passive", description: "Access weapon mastery options based on training." },
  { className: "Bard", name: "Bardic Inspiration", level: 1, actionType: "Bonus Action", description: "Grant inspiration die to allies." },
  { className: "Bard", name: "Jack of All Trades", level: 2, actionType: "Passive", description: "Add half proficiency to many checks." },
  { className: "Bard", name: "Spellcasting", level: 1, actionType: "Passive", description: "Cast bard spells using Charisma." },
  { className: "Cleric", name: "Divine Order", level: 1, actionType: "Passive", description: "Choose your cleric role emphasis." },
  { className: "Cleric", name: "Channel Divinity", level: 2, actionType: "Action", description: "Invoke divine power for domain effects." },
  { className: "Cleric", name: "Spellcasting", level: 1, actionType: "Passive", description: "Cast cleric spells using Wisdom." },
  { className: "Druid", name: "Druidic", level: 1, actionType: "Passive", description: "Learn and use the druidic language." },
  { className: "Druid", name: "Wild Shape", level: 2, actionType: "Bonus Action", description: "Transform into beast forms." },
  { className: "Druid", name: "Spellcasting", level: 1, actionType: "Passive", description: "Cast druid spells using Wisdom." },
  { className: "Fighter", name: "Fighting Style", level: 1, actionType: "Passive", description: "Adopt a focused combat style." },
  { className: "Fighter", name: "Second Wind", level: 1, actionType: "Bonus Action", description: "Recover hit points in combat." },
  { className: "Fighter", name: "Action Surge", level: 2, actionType: "Free", description: "Take one additional action on your turn." },
  { className: "Monk", name: "Martial Arts", level: 1, actionType: "Passive", description: "Use monk weapon and unarmed techniques." },
  { className: "Monk", name: "Focus Points", level: 2, actionType: "Passive", description: "Spend focus for special monk techniques." },
  { className: "Monk", name: "Unarmored Defense", level: 1, actionType: "Passive", description: "AC based on Dexterity and Wisdom." },
  { className: "Paladin", name: "Lay on Hands", level: 1, actionType: "Action", description: "Heal allies with a restorative pool." },
  { className: "Paladin", name: "Divine Smite", level: 1, actionType: "Passive", description: "Empower melee hits with radiant damage." },
  { className: "Paladin", name: "Spellcasting", level: 1, actionType: "Passive", description: "Cast paladin spells using Charisma." },
  { className: "Ranger", name: "Favored Enemy", level: 1, actionType: "Passive", description: "Specialized bonuses against tracked foes." },
  { className: "Ranger", name: "Deft Explorer", level: 1, actionType: "Passive", description: "Exploration-focused utility training." },
  { className: "Ranger", name: "Spellcasting", level: 1, actionType: "Passive", description: "Cast ranger spells using Wisdom." },
  { className: "Rogue", name: "Sneak Attack", level: 1, actionType: "Passive", description: "Deal bonus damage with tactical advantage." },
  { className: "Rogue", name: "Cunning Action", level: 2, actionType: "Bonus Action", description: "Dash, Disengage, or Hide as bonus action." },
  { className: "Rogue", name: "Expertise", level: 1, actionType: "Passive", description: "Double proficiency for chosen skills." },
  { className: "Sorcerer", name: "Innate Sorcery", level: 1, actionType: "Passive", description: "Tap innate magical origin power." },
  { className: "Sorcerer", name: "Metamagic", level: 2, actionType: "Passive", description: "Modify spell behavior with sorcery points." },
  { className: "Sorcerer", name: "Spellcasting", level: 1, actionType: "Passive", description: "Cast sorcerer spells using Charisma." },
  { className: "Warlock", name: "Pact Magic", level: 1, actionType: "Passive", description: "Use pact slots and patron-based magic." },
  { className: "Warlock", name: "Eldritch Invocations", level: 2, actionType: "Passive", description: "Choose invocations with custom powers." },
  { className: "Warlock", name: "Otherworldly Patron", level: 1, actionType: "Passive", description: "Gain patron-granted features and flavor." },
  { className: "Wizard", name: "Arcane Recovery", level: 1, actionType: "Passive", description: "Recover spell slots during short rest." },
  { className: "Wizard", name: "Spellcasting", level: 1, actionType: "Passive", description: "Prepare and cast wizard spells using Intelligence." },
  { className: "Wizard", name: "Ritual Adept", level: 1, actionType: "Passive", description: "Flexible ritual spell usage from spellbook." },
  { subclassName: "Path of the Berserker", name: "Frenzy", level: 3, actionType: "Passive", description: "Aggressive rage variant for relentless offense." },
  { subclassName: "Path of the Wild Heart", name: "Wild Heart Choice", level: 3, actionType: "Passive", description: "Choose primal spirit expression." },
  { subclassName: "Path of the World Tree", name: "World Tree Vitality", level: 3, actionType: "Passive", description: "Tap world tree resilience and utility." },
  { subclassName: "Path of the Zealot", name: "Divine Fury", level: 3, actionType: "Passive", description: "Radiant or necrotic burst during rage attacks." },
  { subclassName: "College of Dance", name: "Dazzling Footwork", level: 3, actionType: "Passive", description: "Graceful performance-based combat utility." },
  { subclassName: "College of Glamour", name: "Mantle of Inspiration", level: 3, actionType: "Bonus Action", description: "Inspire allies with fey glamour." },
  { subclassName: "College of Lore", name: "Cutting Words", level: 3, actionType: "Reaction", description: "Use inspiration to hinder enemy rolls." },
  { subclassName: "College of Valor", name: "Combat Inspiration", level: 3, actionType: "Passive", description: "Inspiration also aids battle performance." },
];

export type DndFeatCategory = "Origin" | "General" | "Fighting Style" | "Epic Boon";

type DndFeat = {
  name: string;
  category: DndFeatCategory;
};

export const DND_2024_FEATS: DndFeat[] = [
  { name: "Alert", category: "Origin" },
  { name: "Crafter", category: "Origin" },
  { name: "Healer", category: "Origin" },
  { name: "Lucky", category: "Origin" },
  { name: "Magic Initiate", category: "Origin" },
  { name: "Musician", category: "Origin" },
  { name: "Savage Attacker", category: "Origin" },
  { name: "Skilled", category: "Origin" },
  { name: "Tavern Brawler", category: "Origin" },
  { name: "Tough", category: "Origin" },
  { name: "Ability Score Improvement", category: "General" },
  { name: "Actor", category: "General" },
  { name: "Athlete", category: "General" },
  { name: "Charger", category: "General" },
  { name: "Chef", category: "General" },
  { name: "Crossbow Expert", category: "General" },
  { name: "Crusher", category: "General" },
  { name: "Defensive Duelist", category: "General" },
  { name: "Dual Wielder", category: "General" },
  { name: "Durable", category: "General" },
  { name: "Elemental Adept", category: "General" },
  { name: "Fey-Touched", category: "General" },
  { name: "Grappler", category: "General" },
  { name: "Great Weapon Master", category: "General" },
  { name: "Heavily Armored", category: "General" },
  { name: "Heavy Armor Master", category: "General" },
  { name: "Inspiring Leader", category: "General" },
  { name: "Keen Mind", category: "General" },
  { name: "Lightly Armored", category: "General" },
  { name: "Mage Slayer", category: "General" },
  { name: "Martial Weapon Training", category: "General" },
  { name: "Medium Armor Master", category: "General" },
  { name: "Moderately Armored", category: "General" },
  { name: "Mounted Combatant", category: "General" },
  { name: "Observant", category: "General" },
  { name: "Piercer", category: "General" },
  { name: "Poisoner", category: "General" },
  { name: "Polearm Master", category: "General" },
  { name: "Resilient", category: "General" },
  { name: "Ritual Caster", category: "General" },
  { name: "Sentinel", category: "General" },
  { name: "Shadow-Touched", category: "General" },
  { name: "Sharpshooter", category: "General" },
  { name: "Shield Master", category: "General" },
  { name: "Skill Expert", category: "General" },
  { name: "Skulker", category: "General" },
  { name: "Slasher", category: "General" },
  { name: "Speedy", category: "General" },
  { name: "Spell Sniper", category: "General" },
  { name: "Telekinetic", category: "General" },
  { name: "Telepathic", category: "General" },
  { name: "War Caster", category: "General" },
  { name: "Weapon Master", category: "General" },
  { name: "Archery", category: "Fighting Style" },
  { name: "Blind Fighting", category: "Fighting Style" },
  { name: "Defense", category: "Fighting Style" },
  { name: "Dueling", category: "Fighting Style" },
  { name: "Great Weapon Fighting", category: "Fighting Style" },
  { name: "Interception", category: "Fighting Style" },
  { name: "Protection", category: "Fighting Style" },
  { name: "Thrown Weapon Fighting", category: "Fighting Style" },
  { name: "Two-Weapon Fighting", category: "Fighting Style" },
  { name: "Unarmed Fighting", category: "Fighting Style" },
  { name: "Boon of Combat Prowess", category: "Epic Boon" },
  { name: "Boon of Dimensional Travel", category: "Epic Boon" },
  { name: "Boon of Energy Resistance", category: "Epic Boon" },
  { name: "Boon of Fate", category: "Epic Boon" },
  { name: "Boon of Fortitude", category: "Epic Boon" },
  { name: "Boon of Irresistible Offense", category: "Epic Boon" },
  { name: "Boon of Recovery", category: "Epic Boon" },
  { name: "Boon of Skill", category: "Epic Boon" },
  { name: "Boon of Speed", category: "Epic Boon" },
  { name: "Boon of Spell Recall", category: "Epic Boon" },
  { name: "Boon of the Night Spirit", category: "Epic Boon" },
  { name: "Boon of Truesight", category: "Epic Boon" },
];

export const DND_2024_FEATS_BY_CATEGORY: Record<DndFeatCategory, DndFeat[]> = {
  Origin: DND_2024_FEATS.filter((feat) => feat.category === "Origin"),
  General: DND_2024_FEATS.filter((feat) => feat.category === "General"),
  "Fighting Style": DND_2024_FEATS.filter((feat) => feat.category === "Fighting Style"),
  "Epic Boon": DND_2024_FEATS.filter((feat) => feat.category === "Epic Boon"),
};

const FEAT_MAP = new Map(DND_2024_FEATS.map((feat) => [feat.name.toLowerCase(), feat]));

export type DndActionEntry = {
  name: string;
  actionType: "Action" | "Bonus Action" | "Reaction" | "Special";
  description: string;
};

export const DND_2024_ACTIONS: DndActionEntry[] = [
  { name: "Attack", actionType: "Action", description: "Make one attack with a weapon or unarmed strike." },
  { name: "Dash", actionType: "Action", description: "Gain extra movement for the turn." },
  { name: "Disengage", actionType: "Action", description: "Movement does not provoke opportunity attacks." },
  { name: "Dodge", actionType: "Action", description: "Attacks against you have disadvantage; DEX saves have advantage." },
  { name: "Help", actionType: "Action", description: "Grant advantage to an ally on a relevant check or attack." },
  { name: "Hide", actionType: "Action", description: "Attempt to become hidden with a Dexterity (Stealth) check." },
  { name: "Influence", actionType: "Action", description: "Attempt to influence a creature in social interaction." },
  { name: "Magic", actionType: "Action", description: "Cast a spell or use a magical effect requiring your action." },
  { name: "Ready", actionType: "Action", description: "Prepare a trigger and response for later in the round." },
  { name: "Search", actionType: "Action", description: "Attempt to locate hidden creatures, objects, or clues." },
  { name: "Study", actionType: "Action", description: "Analyze a creature, object, or phenomenon." },
  { name: "Utilize", actionType: "Action", description: "Interact with an object requiring focused use." },
  { name: "Opportunity Attack", actionType: "Reaction", description: "Make a melee attack when a creature leaves your reach." },
  { name: "Two-Weapon Extra Attack", actionType: "Bonus Action", description: "Extra light-weapon attack after Attack action." },
];

export type DndSpellEntry = {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  damage?: string;
  damageType?: string;
  saveAbility?: string;
  attackType?: string;
  scaling?: string;
  classes: string[];
};

export const DND_2024_BASE_SPELLS: DndSpellEntry[] = [
  { name: "Acid Splash", level: 0, school: "Conjuration", castingTime: "1 action", range: "60 ft", components: "V,S", duration: "Instantaneous", description: "Hurl acid at one or two targets close to each other.", damage: "1d6", damageType: "Acid", saveAbility: "DEX", scaling: "+1d6 at higher tiers", classes: ["Sorcerer", "Wizard"] },
  { name: "Blade Ward", level: 0, school: "Abjuration", castingTime: "1 action", range: "Self", components: "V,S", duration: "1 round", description: "Gain brief resistance against weapon-like physical harm.", classes: ["Bard", "Sorcerer", "Warlock", "Wizard"] },
  { name: "Chill Touch", level: 0, school: "Necromancy", castingTime: "1 action", range: "120 ft", components: "V,S", duration: "1 round", description: "Necrotic touch at range that hinders healing.", damage: "1d8", damageType: "Necrotic", attackType: "Ranged Spell Attack", scaling: "+1d8 at higher tiers", classes: ["Sorcerer", "Warlock", "Wizard"] },
  { name: "Eldritch Blast", level: 0, school: "Evocation", castingTime: "1 action", range: "120 ft", components: "V,S", duration: "Instantaneous", description: "Force beam attack cantrip scaling with level.", damage: "1d10", damageType: "Force", attackType: "Ranged Spell Attack", scaling: "Additional beams at higher tiers", classes: ["Warlock"] },
  { name: "Fire Bolt", level: 0, school: "Evocation", castingTime: "1 action", range: "120 ft", components: "V,S", duration: "Instantaneous", description: "Ranged fire spell attack.", damage: "1d10", damageType: "Fire", attackType: "Ranged Spell Attack", scaling: "+1d10 at higher tiers", classes: ["Sorcerer", "Wizard"] },
  { name: "Guidance", level: 0, school: "Divination", castingTime: "1 action", range: "Touch", components: "V,S", duration: "Concentration, up to 1 minute", description: "Target adds a bonus to an ability check.", classes: ["Cleric", "Druid"] },
  { name: "Light", level: 0, school: "Evocation", castingTime: "1 action", range: "Touch", components: "V,M", duration: "1 hour", description: "Object shines bright light.", classes: ["Bard", "Cleric", "Sorcerer", "Wizard"] },
  { name: "Mage Hand", level: 0, school: "Conjuration", castingTime: "1 action", range: "30 ft", components: "V,S", duration: "1 minute", description: "Summon spectral hand for simple manipulation.", classes: ["Bard", "Sorcerer", "Warlock", "Wizard"] },
  { name: "Mending", level: 0, school: "Transmutation", castingTime: "1 minute", range: "Touch", components: "V,S,M", duration: "Instantaneous", description: "Repair a small break or tear in an object.", classes: ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"] },
  { name: "Minor Illusion", level: 0, school: "Illusion", castingTime: "1 action", range: "30 ft", components: "S,M", duration: "1 minute", description: "Create a simple sound or image illusion.", classes: ["Bard", "Sorcerer", "Warlock", "Wizard"] },
  { name: "Poison Spray", level: 0, school: "Necromancy", castingTime: "1 action", range: "30 ft", components: "V,S", duration: "Instantaneous", description: "Poison cloud against a nearby creature.", damage: "1d12", damageType: "Poison", saveAbility: "CON", scaling: "+1d12 at higher tiers", classes: ["Druid", "Sorcerer", "Warlock", "Wizard"] },
  { name: "Prestidigitation", level: 0, school: "Transmutation", castingTime: "1 action", range: "10 ft", components: "V,S", duration: "Up to 1 hour", description: "Perform minor magical tricks and utility effects.", classes: ["Bard", "Sorcerer", "Warlock", "Wizard"] },
  { name: "Ray of Frost", level: 0, school: "Evocation", castingTime: "1 action", range: "60 ft", components: "V,S", duration: "Instantaneous", description: "Cold beam that slows the target.", damage: "1d8", damageType: "Cold", attackType: "Ranged Spell Attack", scaling: "+1d8 at higher tiers", classes: ["Sorcerer", "Wizard"] },
  { name: "Sacred Flame", level: 0, school: "Evocation", castingTime: "1 action", range: "60 ft", components: "V,S", duration: "Instantaneous", description: "Radiant burst that ignores cover in many cases.", damage: "1d8", damageType: "Radiant", saveAbility: "DEX", scaling: "+1d8 at higher tiers", classes: ["Cleric"] },
  { name: "Shillelagh", level: 0, school: "Transmutation", castingTime: "Bonus action", range: "Touch", components: "V,S,M", duration: "1 minute", description: "Empower a club or quarterstaff with magic.", classes: ["Druid"] },
  { name: "Shocking Grasp", level: 0, school: "Evocation", castingTime: "1 action", range: "Touch", components: "V,S", duration: "Instantaneous", description: "Lightning touch that impairs reactions.", damage: "1d8", damageType: "Lightning", attackType: "Melee Spell Attack", scaling: "+1d8 at higher tiers", classes: ["Sorcerer", "Wizard"] },
  { name: "Thaumaturgy", level: 0, school: "Transmutation", castingTime: "1 action", range: "30 ft", components: "V", duration: "Up to 1 minute", description: "Manifest minor divine-like sensory effects.", classes: ["Cleric"] },
  { name: "True Strike", level: 0, school: "Divination", castingTime: "1 action", range: "Self", components: "S,M", duration: "Concentration, up to 1 round", description: "Gain insight to improve an imminent attack.", classes: ["Bard", "Sorcerer", "Warlock", "Wizard"] },
  { name: "Vicious Mockery", level: 0, school: "Enchantment", castingTime: "1 action", range: "60 ft", components: "V", duration: "Instantaneous", description: "Psychic insult that can hinder the target.", damage: "1d6", damageType: "Psychic", saveAbility: "WIS", scaling: "+1d6 at higher tiers", classes: ["Bard"] },
  { name: "Bless", level: 1, school: "Enchantment", castingTime: "1 action", range: "30 ft", components: "V,S,M", duration: "Concentration, up to 1 minute", description: "Allies add bonus to attacks and saving throws.", classes: ["Cleric", "Paladin"] },
  { name: "Burning Hands", level: 1, school: "Evocation", castingTime: "1 action", range: "Self (15-ft cone)", components: "V,S", duration: "Instantaneous", description: "Cone of fire damage.", damage: "3d6", damageType: "Fire", saveAbility: "DEX", scaling: "+1d6 per slot level", classes: ["Sorcerer", "Wizard"] },
  { name: "Cure Wounds", level: 1, school: "Evocation", castingTime: "1 action", range: "Touch", components: "V,S", duration: "Instantaneous", description: "Restore hit points to one creature.", classes: ["Bard", "Cleric", "Druid", "Paladin", "Ranger"] },
  { name: "Detect Magic", level: 1, school: "Divination", castingTime: "1 action", range: "Self", components: "V,S", duration: "Concentration, up to 10 minutes", description: "Sense magic in your vicinity.", classes: ["Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"] },
  { name: "Disguise Self", level: 1, school: "Illusion", castingTime: "1 action", range: "Self", components: "V,S", duration: "1 hour", description: "Alter your appearance.", classes: ["Bard", "Sorcerer", "Wizard"] },
  { name: "Faerie Fire", level: 1, school: "Evocation", castingTime: "1 action", range: "60 ft", components: "V", duration: "Concentration, up to 1 minute", description: "Outline creatures in light and grant attack advantage.", classes: ["Bard", "Druid"] },
  { name: "Healing Word", level: 1, school: "Evocation", castingTime: "Bonus action", range: "60 ft", components: "V", duration: "Instantaneous", description: "Quick ranged healing.", damage: "1d4+modifier (healing)", scaling: "+1d4 per slot level", classes: ["Bard", "Cleric", "Druid"] },
  { name: "Magic Missile", level: 1, school: "Evocation", castingTime: "1 action", range: "120 ft", components: "V,S", duration: "Instantaneous", description: "Force darts that automatically hit.", damage: "3 x (1d4+1)", damageType: "Force", scaling: "+1 dart per slot level", classes: ["Sorcerer", "Wizard"] },
  { name: "Shield", level: 1, school: "Abjuration", castingTime: "Reaction", range: "Self", components: "V,S", duration: "1 round", description: "Reactive magical barrier increases AC.", classes: ["Sorcerer", "Wizard"] },
  { name: "Sleep", level: 1, school: "Enchantment", castingTime: "1 action", range: "90 ft", components: "V,S,M", duration: "1 minute", description: "Put creatures into magical slumber.", classes: ["Bard", "Sorcerer", "Wizard"] },
  { name: "Thunderwave", level: 1, school: "Evocation", castingTime: "1 action", range: "Self (15-ft cube)", components: "V,S", duration: "Instantaneous", description: "Wave of force pushes creatures away.", damage: "2d8", damageType: "Thunder", saveAbility: "CON", scaling: "+1d8 per slot level", classes: ["Bard", "Druid", "Sorcerer", "Wizard"] },
];

export type DndItemEntry = {
  name: string;
  category: string;
  rarity?: string;
  costCp?: number;
  weightLb?: number;
  description: string;
  damage?: string;
  damageType?: string;
  acBonus?: number;
  properties?: string[];
};

export const DND_2024_BASE_ITEMS: DndItemEntry[] = [
  { name: "Club", category: "Weapon", costCp: 10, weightLb: 2, damage: "1d4", damageType: "Bludgeoning", properties: ["Light"], description: "Simple one-handed bludgeoning weapon." },
  { name: "Dagger", category: "Weapon", costCp: 200, weightLb: 1, damage: "1d4", damageType: "Piercing", properties: ["Finesse", "Light", "Thrown"], description: "Simple finesse and thrown weapon." },
  { name: "Greatclub", category: "Weapon", costCp: 20, weightLb: 10, damage: "1d8", damageType: "Bludgeoning", properties: ["Two-Handed"], description: "Simple two-handed bludgeoning weapon." },
  { name: "Handaxe", category: "Weapon", costCp: 500, weightLb: 2, damage: "1d6", damageType: "Slashing", properties: ["Light", "Thrown"], description: "Simple light and thrown axe." },
  { name: "Javelin", category: "Weapon", costCp: 50, weightLb: 2, damage: "1d6", damageType: "Piercing", properties: ["Thrown"], description: "Simple thrown piercing weapon." },
  { name: "Light Hammer", category: "Weapon", costCp: 200, weightLb: 2, damage: "1d4", damageType: "Bludgeoning", properties: ["Light", "Thrown"], description: "Simple light thrown hammer." },
  { name: "Mace", category: "Weapon", costCp: 500, weightLb: 4, damage: "1d6", damageType: "Bludgeoning", description: "Simple one-handed bludgeoning weapon." },
  { name: "Quarterstaff", category: "Weapon", costCp: 20, weightLb: 4, damage: "1d6 (1d8 versatile)", damageType: "Bludgeoning", properties: ["Versatile"], description: "Simple versatile bludgeoning weapon." },
  { name: "Spear", category: "Weapon", costCp: 100, weightLb: 3, damage: "1d6 (1d8 versatile)", damageType: "Piercing", properties: ["Thrown", "Versatile"], description: "Simple thrown versatile piercing weapon." },
  { name: "Crossbow, Light", category: "Weapon", costCp: 2500, weightLb: 5, damage: "1d8", damageType: "Piercing", properties: ["Ammunition", "Loading", "Two-Handed"], description: "Simple ranged crossbow." },
  { name: "Longbow", category: "Weapon", costCp: 5000, weightLb: 2, damage: "1d8", damageType: "Piercing", properties: ["Ammunition", "Heavy", "Two-Handed"], description: "Martial ranged bow." },
  { name: "Rapier", category: "Weapon", costCp: 2500, weightLb: 2, damage: "1d8", damageType: "Piercing", properties: ["Finesse"], description: "Martial finesse piercing weapon." },
  { name: "Scimitar", category: "Weapon", costCp: 2500, weightLb: 3, damage: "1d6", damageType: "Slashing", properties: ["Finesse", "Light"], description: "Martial light finesse slashing weapon." },
  { name: "Shortsword", category: "Weapon", costCp: 1000, weightLb: 2, damage: "1d6", damageType: "Piercing", properties: ["Finesse", "Light"], description: "Martial light finesse piercing weapon." },
  { name: "Longsword", category: "Weapon", costCp: 1500, weightLb: 3, damage: "1d8 (1d10 versatile)", damageType: "Slashing", properties: ["Versatile"], description: "Martial versatile slashing weapon." },
  { name: "Chain Shirt", category: "Armor", costCp: 5000, weightLb: 20, acBonus: 3, description: "Medium armor for balanced defense." },
  { name: "Scale Mail", category: "Armor", costCp: 5000, weightLb: 45, acBonus: 4, description: "Medium armor with solid protection." },
  { name: "Half Plate", category: "Armor", costCp: 75000, weightLb: 40, acBonus: 5, description: "High-end medium armor." },
  { name: "Chain Mail", category: "Armor", costCp: 7500, weightLb: 55, acBonus: 6, description: "Heavy armor starting baseline." },
  { name: "Shield", category: "Armor", costCp: 1000, weightLb: 6, acBonus: 2, description: "Shield that boosts Armor Class." },
  { name: "Backpack", category: "Gear", costCp: 200, weightLb: 5, description: "Carry adventuring gear and supplies." },
  { name: "Bedroll", category: "Gear", costCp: 100, weightLb: 7, description: "Basic sleeping setup for travel." },
  { name: "Rations (1 day)", category: "Gear", costCp: 50, weightLb: 2, description: "Dry preserved food for one day." },
  { name: "Rope, Hempen (50 ft)", category: "Gear", costCp: 100, weightLb: 10, description: "Reliable rope for climbing and utility." },
  { name: "Torch", category: "Gear", costCp: 1, weightLb: 1, description: "Basic portable light source." },
  { name: "Tinderbox", category: "Gear", costCp: 50, weightLb: 1, description: "Tool for starting fires." },
  { name: "Thieves' Tools", category: "Tool", costCp: 2500, weightLb: 1, description: "Lock and trap utility set." },
  { name: "Healer's Kit", category: "Gear", costCp: 500, weightLb: 3, description: "Medical supplies for stabilizing and care." },
  { name: "Potion of Healing", category: "Consumable", rarity: "Common", costCp: 5000, weightLb: 0.5, description: "Restore hit points when consumed." },
  { name: "Holy Symbol", category: "Focus", costCp: 500, weightLb: 1, description: "Divine focus for cleric and paladin magic." },
  { name: "Arcane Focus", category: "Focus", costCp: 1000, weightLb: 1, description: "Arcane focus for spellcasting classes." },
  { name: "Spellbook", category: "Book", costCp: 5000, weightLb: 3, description: "Wizard spellbook for prepared spells." },
];

export const DND_2024_SKILLS = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
] as const;

export const DND_2024_SAVES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

const SAVE_ALIASES: Record<string, (typeof DND_2024_SAVES)[number]> = {
  str: "STR",
  strength: "STR",
  dex: "DEX",
  dexterity: "DEX",
  con: "CON",
  constitution: "CON",
  int: "INT",
  intelligence: "INT",
  wis: "WIS",
  wisdom: "WIS",
  cha: "CHA",
  charisma: "CHA",
};

const CLASS_THEMES = {
  Barbarian: {
    cardClass: "border-red-700/50 bg-gradient-to-br from-red-950/60 via-neutral-950/80 to-orange-950/40",
    accentClass: "text-red-300",
    badgeClass: "border-red-400/35 bg-red-500/15 text-red-200",
  },
  Bard: {
    cardClass: "border-fuchsia-700/50 bg-gradient-to-br from-fuchsia-950/55 via-neutral-950/80 to-violet-950/40",
    accentClass: "text-fuchsia-300",
    badgeClass: "border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-200",
  },
  Cleric: {
    cardClass: "border-amber-700/50 bg-gradient-to-br from-amber-950/55 via-neutral-950/80 to-yellow-950/35",
    accentClass: "text-amber-300",
    badgeClass: "border-amber-400/35 bg-amber-500/15 text-amber-200",
  },
  Druid: {
    cardClass: "border-emerald-700/50 bg-gradient-to-br from-emerald-950/55 via-neutral-950/80 to-green-950/35",
    accentClass: "text-emerald-300",
    badgeClass: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
  },
  Fighter: {
    cardClass: "border-slate-600/60 bg-gradient-to-br from-slate-950/70 via-neutral-950/80 to-zinc-900/40",
    accentClass: "text-slate-300",
    badgeClass: "border-slate-400/35 bg-slate-500/15 text-slate-200",
  },
  Monk: {
    cardClass: "border-cyan-700/50 bg-gradient-to-br from-cyan-950/55 via-neutral-950/80 to-sky-950/35",
    accentClass: "text-cyan-300",
    badgeClass: "border-cyan-400/35 bg-cyan-500/15 text-cyan-200",
  },
  Paladin: {
    cardClass: "border-yellow-700/50 bg-gradient-to-br from-yellow-950/55 via-neutral-950/80 to-amber-900/35",
    accentClass: "text-yellow-300",
    badgeClass: "border-yellow-400/35 bg-yellow-500/15 text-yellow-200",
  },
  Ranger: {
    cardClass: "border-lime-700/50 bg-gradient-to-br from-lime-950/55 via-neutral-950/80 to-emerald-950/35",
    accentClass: "text-lime-300",
    badgeClass: "border-lime-400/35 bg-lime-500/15 text-lime-200",
  },
  Rogue: {
    cardClass: "border-zinc-600/60 bg-gradient-to-br from-zinc-950/75 via-neutral-950/80 to-slate-950/45",
    accentClass: "text-zinc-300",
    badgeClass: "border-zinc-400/35 bg-zinc-500/15 text-zinc-200",
  },
  Sorcerer: {
    cardClass: "border-indigo-700/50 bg-gradient-to-br from-indigo-950/60 via-neutral-950/80 to-fuchsia-950/35",
    accentClass: "text-indigo-300",
    badgeClass: "border-indigo-400/35 bg-indigo-500/15 text-indigo-200",
  },
  Warlock: {
    cardClass: "border-violet-700/50 bg-gradient-to-br from-violet-950/60 via-neutral-950/80 to-purple-950/35",
    accentClass: "text-violet-300",
    badgeClass: "border-violet-400/35 bg-violet-500/15 text-violet-200",
  },
  Wizard: {
    cardClass: "border-blue-700/50 bg-gradient-to-br from-blue-950/60 via-neutral-950/80 to-cyan-950/35",
    accentClass: "text-blue-300",
    badgeClass: "border-blue-400/35 bg-blue-500/15 text-blue-200",
  },
} as const;

export function getClassTheme(className: string | null | undefined) {
  if (!className) {
    return {
      cardClass: "border-neutral-800 bg-neutral-900/70",
      accentClass: "text-neutral-200",
      badgeClass: "border-neutral-500/35 bg-neutral-500/15 text-neutral-200",
    };
  }

  const normalized = normalizeClassName(className);
  return (
    CLASS_THEMES[normalized as keyof typeof CLASS_THEMES] ?? {
      cardClass: "border-neutral-800 bg-neutral-900/70",
      accentClass: "text-neutral-200",
      badgeClass: "border-neutral-500/35 bg-neutral-500/15 text-neutral-200",
    }
  );
}

export function abilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonusForLevel(level: number) {
  return Math.floor((level - 1) / 4) + 2;
}

export function findClassProfile(className: string) {
  const normalized = className.trim().toLowerCase();
  return DND_2024_CLASSES.find((entry) => entry.key === normalized || entry.label.toLowerCase() === normalized);
}

export function normalizeClassName(className: string) {
  const profile = findClassProfile(className);
  return profile ? profile.label : className.trim();
}

export function calculateStartingHp(className: string, level: number, conScore: number) {
  const profile = findClassProfile(className);
  const hitDie = profile?.hitDie ?? 8;
  const conMod = abilityModifier(conScore);

  const firstLevelHp = Math.max(1, hitDie + conMod);
  if (level <= 1) return firstLevelHp;

  const averageGainPerLevel = Math.max(1, Math.floor(hitDie / 2) + 1 + conMod);
  return firstLevelHp + averageGainPerLevel * (level - 1);
}

export function normalizeSavingThrowList(values: string[]) {
  const seen = new Set<(typeof DND_2024_SAVES)[number]>();
  for (const entry of values) {
    const normalized = SAVE_ALIASES[entry.trim().toLowerCase()];
    if (normalized) {
      seen.add(normalized);
    }
  }
  return Array.from(seen);
}

export function normalizeSkillList(values: string[]) {
  const skillMap = new Map(DND_2024_SKILLS.map((skill) => [skill.toLowerCase(), skill]));
  const seen = new Set<string>();
  for (const entry of values) {
    const normalized = skillMap.get(entry.trim().toLowerCase());
    if (normalized) {
      seen.add(normalized);
    }
  }
  return Array.from(seen);
}

export function normalizeFeatList(values: string[]) {
  const seen = new Set<string>();
  const feats: DndFeat[] = [];

  for (const entry of values) {
    const feat = FEAT_MAP.get(entry.trim().toLowerCase());
    if (feat && !seen.has(feat.name)) {
      seen.add(feat.name);
      feats.push(feat);
    }
  }

  return feats;
}

export type DndSpeciesOption = {
  key: string;
  label: string;
  speed: number;
  description: string;
  traits: string[];
};

export const DND_2024_SPECIES: DndSpeciesOption[] = [
  {
    key: "human",
    label: "Human",
    speed: 30,
    description: "Versatile, social, adaptable. Clean baseline for almost any build.",
    traits: ["Resourceful", "Skilled", "Flexible culture"],
  },
  {
    key: "elf",
    label: "Elf",
    speed: 30,
    description: "Graceful and perceptive, tuned for finesse, magic, and ancient lore.",
    traits: ["Darkvision", "Keen Senses", "Fey ancestry"],
  },
  {
    key: "dwarf",
    label: "Dwarf",
    speed: 30,
    description: "Sturdy and relentless, excellent for frontline roles and divine traditions.",
    traits: ["Darkvision", "Dwarven resilience", "Stonecunning flavor"],
  },
  {
    key: "halfling",
    label: "Halfling",
    speed: 30,
    description: "Fortunate, nimble, and brave. Great for rogues, bards, and clever supports.",
    traits: ["Brave", "Luck", "Nimble movement"],
  },
  {
    key: "gnome",
    label: "Gnome",
    speed: 30,
    description: "Quick-witted and magically curious, ideal for inventive or arcane characters.",
    traits: ["Darkvision", "Gnomish cunning", "Inventive flavor"],
  },
  {
    key: "dragonborn",
    label: "Dragonborn",
    speed: 30,
    description: "Martial presence and draconic power, perfect for bold leaders and strikers.",
    traits: ["Breath weapon", "Draconic resistance", "Intimidating presence"],
  },
  {
    key: "orc",
    label: "Orc",
    speed: 30,
    description: "Explosive mobility and durability, built for aggressive melee pressure.",
    traits: ["Adrenaline Rush", "Darkvision", "Relentless edge"],
  },
  {
    key: "tiefling",
    label: "Tiefling",
    speed: 30,
    description: "Infernal heritage, strong identity, and a natural fit for charisma casters.",
    traits: ["Darkvision", "Fiendish legacy", "Arcane flavor"],
  },
];

export type DndOriginOption = {
  key: string;
  label: string;
  featName: string;
  skills: string[];
  description: string;
  flavor: string;
};

export const DND_2024_ORIGINS: DndOriginOption[] = [
  {
    key: "acrobat",
    label: "Acrobat",
    featName: "Alert",
    skills: ["Acrobatics", "Performance"],
    description: "Fast feet, stage presence, and split-second reaction time.",
    flavor: "You learned to survive under eyes, applause, and danger.",
  },
  {
    key: "artisan",
    label: "Artisan",
    featName: "Crafter",
    skills: ["Investigation", "Persuasion"],
    description: "Methodical maker with an eye for tools, structure, and value.",
    flavor: "Your hands know patience, process, and exacting work.",
  },
  {
    key: "charlatan",
    label: "Charlatan",
    featName: "Skilled",
    skills: ["Deception", "Sleight of Hand"],
    description: "Masks, confidence, and flexible identities in every room.",
    flavor: "You know how to sell a lie before anyone notices the seams.",
  },
  {
    key: "criminal",
    label: "Criminal",
    featName: "Alert",
    skills: ["Stealth", "Sleight of Hand"],
    description: "Street-hardened, sharp, and always watching for a line of escape.",
    flavor: "You learned fast because slow people got caught.",
  },
  {
    key: "guard",
    label: "Guard",
    featName: "Tough",
    skills: ["Athletics", "Insight"],
    description: "Disciplined, alert, and used to holding a line under pressure.",
    flavor: "Duty shaped your instincts long before adventure did.",
  },
  {
    key: "hermit",
    label: "Hermit",
    featName: "Healer",
    skills: ["Medicine", "Religion"],
    description: "Quiet devotion, study, and healing away from the world.",
    flavor: "Silence taught you to notice what others miss.",
  },
  {
    key: "noble",
    label: "Noble",
    featName: "Lucky",
    skills: ["History", "Persuasion"],
    description: "Privilege, education, and social gravity carried into the field.",
    flavor: "Doors opened for you before you ever touched the handle.",
  },
  {
    key: "sage",
    label: "Sage",
    featName: "Magic Initiate",
    skills: ["Arcana", "History"],
    description: "Study-first origin for scholars, mages, and occult problem-solvers.",
    flavor: "You know how dangerous knowledge becomes when it works.",
  },
  {
    key: "soldier",
    label: "Soldier",
    featName: "Savage Attacker",
    skills: ["Athletics", "Intimidation"],
    description: "Battle drills, hard travel, and direct violence in service of a cause.",
    flavor: "You were forged by orders, scars, and repetition.",
  },
  {
    key: "wayfarer",
    label: "Wayfarer",
    featName: "Musician",
    skills: ["Insight", "Survival"],
    description: "Roadwise, social, and comfortable wherever the fire gets lit.",
    flavor: "You belong to the road more than to any one place.",
  },
];

export const DND_2024_CLASS_SKILL_RULES: Record<string, { count: number; options: string[] }> = {
  Barbarian: { count: 2, options: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"] },
  Bard: { count: 3, options: [...DND_2024_SKILLS] },
  Cleric: { count: 2, options: ["History", "Insight", "Medicine", "Persuasion", "Religion"] },
  Druid: { count: 2, options: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"] },
  Fighter: { count: 2, options: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"] },
  Monk: { count: 2, options: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"] },
  Paladin: { count: 2, options: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"] },
  Ranger: { count: 3, options: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"] },
  Rogue: { count: 4, options: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"] },
  Sorcerer: { count: 2, options: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"] },
  Warlock: { count: 2, options: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"] },
  Wizard: { count: 2, options: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"] },
};

export const DND_2024_CLASS_LOADOUTS: Record<
  string,
  {
    weaponIds: string[];
    armorIds: string[];
    gearIds: string[];
    spellIds: string[];
    priorityAbilities: Array<keyof Record<"str" | "dex" | "con" | "int" | "wis" | "cha", number>>;
  }
> = {
  Barbarian: {
    weaponIds: ["greataxe", "handaxe", "javelin"],
    armorIds: [],
    gearIds: ["backpack", "bedroll", "rope-hempen-50-ft"],
    spellIds: [],
    priorityAbilities: ["str", "con", "dex", "wis", "cha", "int"],
  },
  Bard: {
    weaponIds: ["rapier", "dagger", "shortsword"],
    armorIds: ["chain-shirt"],
    gearIds: ["backpack", "bedroll"],
    spellIds: ["vicious-mockery", "mage-hand", "healing-word", "faerie-fire", "detect-magic"],
    priorityAbilities: ["cha", "dex", "con", "wis", "int", "str"],
  },
  Cleric: {
    weaponIds: ["mace", "quarterstaff"],
    armorIds: ["chain-shirt", "shield"],
    gearIds: ["holy-symbol", "backpack", "healers-kit"],
    spellIds: ["guidance", "sacred-flame", "bless", "cure-wounds", "healing-word"],
    priorityAbilities: ["wis", "con", "str", "dex", "cha", "int"],
  },
  Druid: {
    weaponIds: ["club", "dagger", "quarterstaff"],
    armorIds: ["shield"],
    gearIds: ["backpack", "rope-hempen-50-ft"],
    spellIds: ["guidance", "shillelagh", "cure-wounds", "faerie-fire", "detect-magic"],
    priorityAbilities: ["wis", "con", "dex", "int", "cha", "str"],
  },
  Fighter: {
    weaponIds: ["longsword", "shortsword", "crossbow-light"],
    armorIds: ["chain-mail", "shield"],
    gearIds: ["backpack", "bedroll", "torch"],
    spellIds: [],
    priorityAbilities: ["str", "con", "dex", "wis", "cha", "int"],
  },
  Monk: {
    weaponIds: ["quarterstaff", "dagger", "spear"],
    armorIds: [],
    gearIds: ["backpack", "bedroll"],
    spellIds: [],
    priorityAbilities: ["dex", "wis", "con", "str", "int", "cha"],
  },
  Paladin: {
    weaponIds: ["longsword", "mace", "javelin"],
    armorIds: ["chain-mail", "shield"],
    gearIds: ["holy-symbol", "backpack", "bedroll"],
    spellIds: ["bless", "cure-wounds", "detect-magic"],
    priorityAbilities: ["str", "cha", "con", "wis", "dex", "int"],
  },
  Ranger: {
    weaponIds: ["longbow", "shortsword", "dagger"],
    armorIds: ["chain-shirt"],
    gearIds: ["backpack", "rope-hempen-50-ft", "torch"],
    spellIds: ["cure-wounds", "detect-magic", "faerie-fire"],
    priorityAbilities: ["dex", "wis", "con", "str", "int", "cha"],
  },
  Rogue: {
    weaponIds: ["shortsword", "rapier", "dagger"],
    armorIds: ["chain-shirt"],
    gearIds: ["thieves-tools", "backpack", "torch"],
    spellIds: [],
    priorityAbilities: ["dex", "cha", "con", "wis", "int", "str"],
  },
  Sorcerer: {
    weaponIds: ["dagger", "quarterstaff"],
    armorIds: [],
    gearIds: ["arcane-focus", "backpack"],
    spellIds: ["fire-bolt", "ray-of-frost", "magic-missile", "shield", "burning-hands"],
    priorityAbilities: ["cha", "con", "dex", "wis", "int", "str"],
  },
  Warlock: {
    weaponIds: ["dagger", "quarterstaff", "crossbow-light"],
    armorIds: ["chain-shirt"],
    gearIds: ["arcane-focus", "backpack"],
    spellIds: ["eldritch-blast", "minor-illusion", "detect-magic", "shield", "chill-touch"],
    priorityAbilities: ["cha", "con", "dex", "wis", "int", "str"],
  },
  Wizard: {
    weaponIds: ["dagger", "quarterstaff"],
    armorIds: [],
    gearIds: ["arcane-focus", "spellbook", "backpack"],
    spellIds: ["fire-bolt", "mage-hand", "magic-missile", "shield", "detect-magic"],
    priorityAbilities: ["int", "con", "dex", "wis", "cha", "str"],
  },
};

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export const ABILITY_KEYS: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

export function abilityLabel(key: AbilityKey) {
  return ABILITY_LABELS[key];
}

export function slugifyCatalogName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
