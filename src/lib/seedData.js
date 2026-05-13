// ── Modifier group factories ───────────────────────────────────────────────────
// Each call returns a fresh object with a deterministic ID for reproducibility

const mg = (id, name, required, multiple, options) => ({
  id,
  name,
  required: !!required,
  multiple: !!multiple,
  options: options.map(([optId, optName, price]) => ({ id: optId, name: optName, price: price ?? 0 })),
})

const TIPO_LECHE = () => mg('mg-leche', 'Tipo de Leche', false, false, [
  ['ml-entera',   'Entera',          0],
  ['ml-desla',    'Deslactosada',    6],
  ['ml-avena',    'Leche de avena', 15],
  ['ml-coco',     'Coco',           10],
  ['ml-almendra', 'Almendra',       10],
])

const ENDULZANTE = () => mg('mg-endul', 'Endulzante', false, false, [
  ['en-azucar',  'Azúcar',    0],
  ['en-splenda', 'Splenda',   0],
  ['en-monk',    'Monk Fruit',0],
  ['en-sin',     'Sin azúcar',0],
])

const EXTRAS = () => mg('mg-extras', 'Extras', false, true, [
  ['ex-shot',   'Shot Extra de Café', 15],
  ['ex-tapio',  'Tapioca',            10],
  ['ex-crema',  'Crema Batida',        5],
  ['ex-perla',  'Perla Explosiva',    10],
  ['ex-crack',  'Vaso Crack',         15],
])

const SHOT_1883 = () => mg('mg-shot', 'Shot 1883', false, true, [
  ['s-maracuya',  'Maracuyá',          9],
  ['s-vainSF',    'Vainilla Sugar Free',9],
  ['s-amareto',   'Amareto',           9],
  ['s-choco',     'Chocolate',         9],
  ['s-moka',      'Moka Blanco',       9],
  ['s-lavanda',   'Lavanda',           9],
  ['s-cajeta',    'Cajeta',            9],
  ['s-caramelo',  'Caramelo',          9],
  ['s-canela',    'Canela',            9],
  ['s-irlandesa', 'Crema Irlandesa',   9],
  ['s-rompope',   'Rompope',           9],
  ['s-avellana',  'Avellana',          9],
  ['s-vainilla',  'Vainilla',          9],
])

const TIPO_GRANO = () => mg('mg-grano', 'Tipo de grano', true, false, [
  ['g-lavado',  'Lavado',       15],
  ['g-natural', 'Natural',      25],
  ['g-yellow',  'Yellow Honey', 20],
  ['g-red',     'Red Honey',    20],
  ['g-black',   'Black Honey',  20],
])

const TOPPINGS = () => mg('mg-toppings', 'Toppings', false, true, [
  ['t-dulce', 'Dulce de leche', 10],
])

const SABOR = () => mg('mg-sabor', 'Sabor', true, false, [
  ['sb-berry',   'Berry Bliss',     0],
  ['sb-matcha',  'Matcha Vainilla', 0],
  ['sb-banana',  'Banana Peanut',   0],
  ['sb-pina',    'Piña Colada',     0],
  ['sb-choco',   'Chocolate Boost', 0],
])

const PROTEINA = () => mg('mg-proteina', 'Tipo de proteína', true, false, [
  ['pr-isolate', 'Isolate', 0],
  ['pr-vegana',  'Vegana',  10],
])

// Shorthand combos
const leche_endul_extras = () => [TIPO_LECHE(), ENDULZANTE(), EXTRAS()]
const endul_extras = () => [ENDULZANTE(), EXTRAS()]
const frappe_mgs = () => [ENDULZANTE(), EXTRAS(), SHOT_1883()]

// ── Seed data ─────────────────────────────────────────────────────────────────

export const SEED_CATEGORIES = [
  { id: 'cat-loving',   name: 'Loving Caffeine',   emoji: '☕' },
  { id: 'cat-specialty',name: 'Specialty Coffee',  emoji: '🏆' },
  { id: 'cat-iced',     name: 'Iced Coffee',       emoji: '🧊' },
  { id: 'cat-noncoffee',name: 'Non - Coffee',      emoji: '🌿' },
  { id: 'cat-icednc',   name: 'Iced Non-Coffee',   emoji: '🥤' },
  { id: 'cat-frappe',   name: 'Frappé',            emoji: '🥛' },
  { id: 'cat-smoothie', name: 'Smoothie',          emoji: '🍹' },
  { id: 'cat-vitrina',  name: 'Vitrina',           emoji: '🍰' },
  { id: 'cat-comida',   name: 'Comida',            emoji: '🍽️' },
]

export const SEED_PRODUCTS = [
  // ── Loving Caffeine ────────────────────────────────────────────────────────
  { id: 'p-espresso',    categoryId: 'cat-loving',    name: 'Espresso (30ml)',         price: 20,  emoji: '☕', modifierGroups: endul_extras() },
  { id: 'p-macchiato',   categoryId: 'cat-loving',    name: 'Macchiato',               price: 25,  emoji: '☕', modifierGroups: leche_endul_extras() },
  { id: 'p-americano-h', categoryId: 'cat-loving',    name: 'Americano - Hot',         price: 40,  emoji: '☕', modifierGroups: endul_extras() },
  { id: 'p-cappuccino-h',categoryId: 'cat-loving',    name: 'Cappuccino - Hot',        price: 53,  emoji: '☕', modifierGroups: leche_endul_extras() },
  { id: 'p-latte-h',     categoryId: 'cat-loving',    name: 'Latte - Hot',             price: 58,  emoji: '☕', modifierGroups: leche_endul_extras() },
  { id: 'p-caramel-h',   categoryId: 'cat-loving',    name: 'Caramel Machiatto - Hot', price: 70,  emoji: '☕', modifierGroups: leche_endul_extras() },
  { id: 'p-flatcito',    categoryId: 'cat-loving',    name: 'Flatcito',                price: 68,  emoji: '☕', modifierGroups: leche_endul_extras() },
  { id: 'p-mocha-h',     categoryId: 'cat-loving',    name: 'Mocha Hot',               price: 65,  emoji: '☕', modifierGroups: leche_endul_extras() },

  // ── Specialty Coffee ────────────────────────────────────────────────────────
  { id: 'p-specialty',   categoryId: 'cat-specialty', name: 'Specialty Method',        price: 65,  emoji: '🏆', modifierGroups: [TIPO_GRANO(), ENDULZANTE(), EXTRAS()] },

  // ── Iced Coffee ────────────────────────────────────────────────────────────
  { id: 'p-americano-i', categoryId: 'cat-iced',      name: 'Americano - Iced',        price: 50,  emoji: '🧊', modifierGroups: endul_extras() },
  { id: 'p-caramel-i',   categoryId: 'cat-iced',      name: 'Caramel Machiatto - Iced',price: 79,  emoji: '🧊', modifierGroups: leche_endul_extras() },
  { id: 'p-coldbrew',    categoryId: 'cat-iced',      name: 'Cold Brew',               price: 70,  emoji: '🧊', modifierGroups: leche_endul_extras() },
  { id: 'p-espressotonic',categoryId:'cat-iced',      name: 'Espresso Tonic',          price: 75,  emoji: '🧊', modifierGroups: endul_extras() },
  { id: 'p-latte-i',     categoryId: 'cat-iced',      name: 'Latte - Iced',            price: 67,  emoji: '🧊', modifierGroups: leche_endul_extras() },
  { id: 'p-mazapan-i',   categoryId: 'cat-iced',      name: 'Mazapán - Iced',          price: 74,  emoji: '🧊', modifierGroups: leche_endul_extras() },

  // ── Non - Coffee ────────────────────────────────────────────────────────────
  { id: 'p-matcha-h',    categoryId: 'cat-noncoffee', name: 'Matcha Latte - Hot',      price: 58,  emoji: '🌿', modifierGroups: leche_endul_extras() },
  { id: 'p-taro-h',      categoryId: 'cat-noncoffee', name: 'Taro Latte - Hot',        price: 58,  emoji: '🌿', modifierGroups: leche_endul_extras() },
  { id: 'p-chocolate-h', categoryId: 'cat-noncoffee', name: 'Chocolate - Hot',         price: 58,  emoji: '🌿', modifierGroups: leche_endul_extras() },
  { id: 'p-chai-h',      categoryId: 'cat-noncoffee', name: 'Chai Latte - Hot',        price: 65,  emoji: '🌿', modifierGroups: leche_endul_extras() },
  { id: 'p-goldenmilk',  categoryId: 'cat-noncoffee', name: 'Golden Milk',             price: 60,  emoji: '🌿', modifierGroups: leche_endul_extras() },
  { id: 'p-herbal-h',    categoryId: 'cat-noncoffee', name: 'Hot Herbal Tea',          price: 40,  emoji: '🌿', modifierGroups: [] },
  { id: 'p-fruittea-h',  categoryId: 'cat-noncoffee', name: 'Hot Fruit Tea',           price: 65,  emoji: '🌿', modifierGroups: [] },

  // ── Iced Non-Coffee ─────────────────────────────────────────────────────────
  { id: 'p-chai-i',      categoryId: 'cat-icednc',    name: 'Chai Latte - Iced',       price: 75,  emoji: '🥤', modifierGroups: leche_endul_extras() },
  { id: 'p-maracuya',    categoryId: 'cat-icednc',    name: 'Maracuya Tonic',          price: 80,  emoji: '🥤', modifierGroups: [] },
  { id: 'p-matcha-i',    categoryId: 'cat-icednc',    name: 'Matcha - Iced',           price: 67,  emoji: '🥤', modifierGroups: leche_endul_extras() },
  { id: 'p-mojito',      categoryId: 'cat-icednc',    name: 'Mojito',                  price: 70,  emoji: '🥤', modifierGroups: [] },
  { id: 'p-mojito-fr',   categoryId: 'cat-icednc',    name: 'Mojito Frutos Rojos',     price: 80,  emoji: '🥤', modifierGroups: [] },
  { id: 'p-saintfizz',   categoryId: 'cat-icednc',    name: 'Saint Fizz',              price: 70,  emoji: '🥤', modifierGroups: [] },
  { id: 'p-strawmatcha', categoryId: 'cat-icednc',    name: 'Strawberry Matcha - Iced',price: 75,  emoji: '🥤', modifierGroups: leche_endul_extras() },
  { id: 'p-taro-i',      categoryId: 'cat-icednc',    name: 'Taro - Iced',             price: 67,  emoji: '🥤', modifierGroups: leche_endul_extras() },
  { id: 'p-agua',        categoryId: 'cat-icednc',    name: 'Botella Agua',            price: 15,  emoji: '💧', modifierGroups: [] },
  { id: 'p-herbal-i',    categoryId: 'cat-icednc',    name: 'Iced Herbal Tea',         price: 45,  emoji: '🥤', modifierGroups: [] },
  { id: 'p-fruittea-i',  categoryId: 'cat-icednc',    name: 'Iced Fruit Tea',          price: 70,  emoji: '🥤', modifierGroups: [] },

  // ── Frappé ──────────────────────────────────────────────────────────────────
  { id: 'p-frappe-cap',  categoryId: 'cat-frappe',    name: 'Cappuccino - Frappe',     price: 75,  emoji: '🥛', modifierGroups: frappe_mgs() },
  { id: 'p-frappe-mat',  categoryId: 'cat-frappe',    name: 'Matcha - Frappe',         price: 77,  emoji: '🥛', modifierGroups: frappe_mgs() },
  { id: 'p-frappe-oreo', categoryId: 'cat-frappe',    name: 'Oreo - Frappe',           price: 85,  emoji: '🥛', modifierGroups: frappe_mgs() },
  { id: 'p-frappe-taro', categoryId: 'cat-frappe',    name: 'Taro - Frappe',           price: 77,  emoji: '🥛', modifierGroups: frappe_mgs() },
  { id: 'p-frappe-moc',  categoryId: 'cat-frappe',    name: 'Mocha - Frappe',          price: 85,  emoji: '🥛', modifierGroups: frappe_mgs() },
  { id: 'p-frappe-maz',  categoryId: 'cat-frappe',    name: 'Mazapan - Frappe',        price: 85,  emoji: '🥛', modifierGroups: frappe_mgs() },
  { id: 'p-frappe-chai', categoryId: 'cat-frappe',    name: 'Chai - Frappe',           price: 90,  emoji: '🥛', modifierGroups: frappe_mgs() },
  { id: 'p-frappe-choc', categoryId: 'cat-frappe',    name: 'Chocolate - Frappe',      price: 77,  emoji: '🥛', modifierGroups: frappe_mgs() },

  // ── Smoothie ─────────────────────────────────────────────────────────────────
  { id: 'p-sm-berries',  categoryId: 'cat-smoothie',  name: 'Smoothie - Berries',      price: 75,  emoji: '🍹', modifierGroups: [] },
  { id: 'p-sm-kiwi',     categoryId: 'cat-smoothie',  name: 'Smoothie - Kiwi',         price: 75,  emoji: '🍹', modifierGroups: [] },
  { id: 'p-sm-mango',    categoryId: 'cat-smoothie',  name: 'Smoothie - Mango',        price: 75,  emoji: '🍹', modifierGroups: [] },
  { id: 'p-sm-pina',     categoryId: 'cat-smoothie',  name: 'Smoothie - PiñaCoco',     price: 85,  emoji: '🍹', modifierGroups: [] },
  { id: 'p-protein',     categoryId: 'cat-smoothie',  name: 'Protein blend',           price: 135, emoji: '💪', modifierGroups: [SABOR(), PROTEINA()] },

  // ── Vitrina ──────────────────────────────────────────────────────────────────
  { id: 'p-sanpel',      categoryId: 'cat-vitrina',   name: 'Sanpellegrino',           price: 65,  emoji: '🫧', modifierGroups: [] },
  { id: 'p-tartavasca',  categoryId: 'cat-vitrina',   name: 'Tarta Vasca',             price: 85,  emoji: '🍰', modifierGroups: [] },
  { id: 'p-tiramisu',    categoryId: 'cat-vitrina',   name: 'Tiramisú',                price: 90,  emoji: '🍰', modifierGroups: [] },
  { id: 'p-coldbrew-b',  categoryId: 'cat-vitrina',   name: 'Cold Brew Bottle',        price: 145, emoji: '🫙', modifierGroups: [] },
  { id: 'p-coldbrew-r',  categoryId: 'cat-vitrina',   name: 'Cold Brew Refill',        price: 105, emoji: '🫙', modifierGroups: [] },
  { id: 'p-pannacotta',  categoryId: 'cat-vitrina',   name: 'Panna Cotta',             price: 75,  emoji: '🍮', modifierGroups: [] },
  { id: 'p-galletaS',    categoryId: 'cat-vitrina',   name: 'Galleta BT S',            price: 45,  emoji: '🍪', modifierGroups: [] },
  { id: 'p-cheesecake',  categoryId: 'cat-vitrina',   name: 'CheeseCake',              price: 60,  emoji: '🍰', modifierGroups: [] },
  { id: 'p-galletaC',    categoryId: 'cat-vitrina',   name: 'Galleta BT Chessy',       price: 65,  emoji: '🍪', modifierGroups: [] },
  { id: 'p-chocolatin',  categoryId: 'cat-vitrina',   name: 'Chocolatín',              price: 45,  emoji: '🥐', modifierGroups: [] },
  { id: 'p-tartaleta',   categoryId: 'cat-vitrina',   name: 'Tartaleta de Guayaba',    price: 65,  emoji: '🍮', modifierGroups: [] },
  { id: 'p-muffin',      categoryId: 'cat-vitrina',   name: 'Muffin de Plátano',       price: 45,  emoji: '🧁', modifierGroups: [] },
  { id: 'p-croissant',   categoryId: 'cat-vitrina',   name: 'Croissant Almendrado',    price: 70,  emoji: '🥐', modifierGroups: [TOPPINGS()] },
  { id: 'p-trenza',      categoryId: 'cat-vitrina',   name: 'Trenza de Frutos Rojos',  price: 85,  emoji: '🥐', modifierGroups: [] },
  { id: 'p-brownie',     categoryId: 'cat-vitrina',   name: 'Brownie',                 price: 50,  emoji: '🍫', modifierGroups: [] },
  { id: 'p-galleta',     categoryId: 'cat-vitrina',   name: 'Galleta',                 price: 15,  emoji: '🍪', modifierGroups: [] },

  // ── Comida ───────────────────────────────────────────────────────────────────
  { id: 'p-rufus-dia',   categoryId: 'cat-comida',    name: 'Rufus - Diavola',         price: 100, emoji: '🍕', modifierGroups: [] },
  { id: 'p-rufus-mar',   categoryId: 'cat-comida',    name: 'Rufus - Margherita',      price: 90,  emoji: '🍕', modifierGroups: [] },
  { id: 'p-rufus-pep',   categoryId: 'cat-comida',    name: 'Rufus - Pepperoni',       price: 90,  emoji: '🍕', modifierGroups: [] },
  { id: 'p-rufus-jam',   categoryId: 'cat-comida',    name: 'Rufus - Jamón y Hongos',  price: 130, emoji: '🍕', modifierGroups: [] },
  { id: 'p-rufus-cuat',  categoryId: 'cat-comida',    name: 'Rufus - Cuatro Estaciones',price:100, emoji: '🍕', modifierGroups: [] },
  { id: 'p-rufus-carb',  categoryId: 'cat-comida',    name: 'Rufus - Carbonara',       price: 100, emoji: '🍕', modifierGroups: [] },
  { id: 'p-rufus-cap',   categoryId: 'cat-comida',    name: 'Rufus - Capricciosa',     price: 110, emoji: '🍕', modifierGroups: [] },
  { id: 'p-rufus-med',   categoryId: 'cat-comida',    name: 'Rufus - Mediterranea',    price: 130, emoji: '🍕', modifierGroups: [] },
  { id: 'p-turkey',      categoryId: 'cat-comida',    name: 'Turkey Toast',            price: 97,  emoji: '🥪', modifierGroups: [] },
  { id: 'p-delhuerto',   categoryId: 'cat-comida',    name: 'Del Huerto',              price: 90,  emoji: '🥗', modifierGroups: [] },
  { id: 'p-chicken',     categoryId: 'cat-comida',    name: 'Chicken Toast',           price: 97,  emoji: '🥪', modifierGroups: [] },
  { id: 'p-caesar',      categoryId: 'cat-comida',    name: 'Ceasar Salad',            price: 90,  emoji: '🥗', modifierGroups: [] },
]
