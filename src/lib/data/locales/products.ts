import type { Product, Unit } from '../../types';
import type { Locale } from '../../i18n/locale';
import { PRODUCTS_SEED } from '../products';

// Catálogos de productos por cultura. Referencian las categorías universales
// (sup-fruteria, sup-carniceria, …). Son sets curados con productos típicos de
// cada país; se amplían igual que creció el catálogo español. Los IDs van
// prefijados por locale para no colisionar.

const mk = (prefix: string) =>
  (id: string, name: string, cat: string, emoji: string, unit: Unit = 'unidad'): Product => ({
    id: `${prefix}-${id}`, name, categoryId: cat,
    icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
  });

// ───────────────────────── 🇬🇧 Reino Unido ─────────────────────────
const u = mk('uk');
const UK: Product[] = [
  // Fruit & veg
  u('apples','Apples','sup-fruteria','🍎','kg'), u('bananas','Bananas','sup-fruteria','🍌','kg'),
  u('potatoes','Potatoes','sup-fruteria','🥔','kg'), u('carrots','Carrots','sup-fruteria','🥕','kg'),
  u('onions','Onions','sup-fruteria','🧅','kg'), u('tomatoes','Tomatoes','sup-fruteria','🍅','kg'),
  u('lettuce','Lettuce','sup-fruteria','🥬','unidad'), u('cucumber','Cucumber','sup-fruteria','🥒','unidad'),
  u('mushrooms','Mushrooms','sup-fruteria','🍄','paquete'),
  // Meat
  u('chicken-breast','Chicken breasts','sup-carniceria','🐔','paquete'),
  u('beef-mince','Beef mince','sup-carniceria','🥩','paquete'),
  u('bacon','Bacon','sup-carniceria','🥓','paquete'), u('sausages','Sausages (bangers)','sup-carniceria','🌭','paquete'),
  u('pork-chops','Pork chops','sup-carniceria','🥩','paquete'), u('lamb-mince','Lamb mince','sup-carniceria','🍖','paquete'),
  // Fish
  u('cod-fillet','Cod fillet','sup-pescaderia','🐟','paquete'), u('salmon-fillet','Salmon fillet','sup-pescaderia','🐟','paquete'),
  u('fish-fingers','Fish fingers','sup-pescaderia','🐟','paquete'), u('prawns','Prawns','sup-pescaderia','🦐','paquete'),
  // Dairy
  u('milk','Milk','sup-lacteos','🥛','l'), u('butter','Butter','sup-lacteos','🧈','unidad'),
  u('cheddar','Cheddar cheese','sup-lacteos','🧀','paquete'), u('eggs','Eggs','sup-lacteos','🥚','docena'),
  u('yoghurt','Yoghurt','sup-lacteos','🥣','paquete'), u('double-cream','Double cream','sup-lacteos','🥛','unidad'),
  // Bakery
  u('bread','Sliced bread','sup-panaderia','🍞','unidad'), u('crumpets','Crumpets','sup-panaderia','🥞','paquete'),
  u('scones','Scones','sup-panaderia','🧁','paquete'), u('bagels','Bagels','sup-panaderia','🥯','paquete'),
  // Pantry
  u('baked-beans','Baked beans','sup-despensa','🥫','unidad'), u('beans-tomato','Chopped tomatoes','sup-despensa','🥫','unidad'),
  u('pasta','Pasta','sup-despensa','🍝','paquete'), u('rice','Rice','sup-despensa','🍚','paquete'),
  u('tea','Tea bags','sup-despensa','🍵','paquete'), u('gravy','Gravy granules','sup-despensa','🥫','unidad'),
  u('marmite','Marmite','sup-despensa','🍯','unidad'), u('brown-sauce','Brown sauce','sup-despensa','🥫','unidad'),
  // Frozen
  u('chips','Frozen chips','sup-congelados','🍟','paquete'), u('peas','Frozen peas','sup-congelados','🟢','paquete'),
  u('yorkshire','Yorkshire puddings','sup-congelados','🥐','paquete'),
  // Drinks
  u('orange-juice','Orange juice','sup-bebidas','🧃','l'), u('lager','Lager','sup-bebidas','🍺','paquete'),
  u('cider','Cider','sup-bebidas','🍏','unidad'), u('squash','Squash','sup-bebidas','🥤','unidad'),
  // Snacks
  u('crisps','Crisps','sup-snacks','🥔','paquete'), u('biscuits','Biscuits','sup-snacks','🍪','paquete'),
  u('chocolate','Chocolate bar','sup-snacks','🍫','unidad'), u('digestives','Digestives','sup-snacks','🍪','paquete'),
  // Cleaning & personal
  u('washing-up','Washing-up liquid','sup-limpieza','🧴','unidad'), u('bin-bags','Bin bags','sup-limpieza','🗑️','paquete'),
  u('kitchen-roll','Kitchen roll','sup-limpieza','🧻','paquete'), u('loo-roll','Toilet roll','sup-limpieza','🧻','paquete'),
  u('shampoo','Shampoo','sup-higiene','🧴','unidad'), u('toothpaste','Toothpaste','sup-higiene','🪥','unidad'),
];

// ───────────────────────── 🇺🇸 Estados Unidos ─────────────────────────
const a = mk('us');
const US_PRODUCTS: Product[] = [
  a('apples','Apples','sup-fruteria','🍎','kg'), a('bananas','Bananas','sup-fruteria','🍌','kg'),
  a('potatoes','Potatoes','sup-fruteria','🥔','kg'), a('lettuce','Lettuce','sup-fruteria','🥬','unidad'),
  a('tomatoes','Tomatoes','sup-fruteria','🍅','kg'), a('onions','Onions','sup-fruteria','🧅','kg'),
  a('avocado','Avocados','sup-fruteria','🥑','unidad'), a('corn','Corn','sup-fruteria','🌽','unidad'),
  a('ground-beef','Ground beef','sup-carniceria','🥩','paquete'), a('chicken-breast','Chicken breasts','sup-carniceria','🐔','paquete'),
  a('bacon','Bacon','sup-carniceria','🥓','paquete'), a('hot-dogs','Hot dogs','sup-carniceria','🌭','paquete'),
  a('steak','Steak','sup-carniceria','🥩','paquete'), a('turkey','Ground turkey','sup-carniceria','🦃','paquete'),
  a('salmon','Salmon fillet','sup-pescaderia','🐟','paquete'), a('shrimp','Shrimp','sup-pescaderia','🦐','paquete'),
  a('tuna-can','Canned tuna','sup-pescaderia','🥫','unidad'), a('tilapia','Tilapia','sup-pescaderia','🐟','paquete'),
  a('milk','Milk','sup-lacteos','🥛','l'), a('eggs','Eggs','sup-lacteos','🥚','docena'),
  a('butter','Butter','sup-lacteos','🧈','unidad'), a('cheese','Cheese slices','sup-lacteos','🧀','paquete'),
  a('yogurt','Yogurt','sup-lacteos','🥣','paquete'), a('cream-cheese','Cream cheese','sup-lacteos','🧀','unidad'),
  a('bread','Bread','sup-panaderia','🍞','unidad'), a('bagels','Bagels','sup-panaderia','🥯','paquete'),
  a('muffins','Muffins','sup-panaderia','🧁','paquete'), a('tortillas','Tortillas','sup-panaderia','🫓','paquete'),
  a('peanut-butter','Peanut butter','sup-despensa','🥜','unidad'), a('jelly','Jelly','sup-despensa','🍇','unidad'),
  a('cereal','Cereal','sup-despensa','🥣','paquete'), a('mac-cheese','Mac & cheese','sup-despensa','🧀','unidad'),
  a('pasta','Pasta','sup-despensa','🍝','paquete'), a('rice','Rice','sup-despensa','🍚','paquete'),
  a('ketchup','Ketchup','sup-despensa','🍅','unidad'), a('maple-syrup','Maple syrup','sup-despensa','🍁','unidad'),
  a('fries','Frozen fries','sup-congelados','🍟','paquete'), a('pizza','Frozen pizza','sup-congelados','🍕','unidad'),
  a('ice-cream','Ice cream','sup-congelados','🍨','unidad'),
  a('soda','Soda','sup-bebidas','🥤','paquete'), a('orange-juice','Orange juice','sup-bebidas','🧃','l'),
  a('coffee','Coffee','sup-bebidas','☕','paquete'), a('beer','Beer','sup-bebidas','🍺','paquete'),
  a('chips','Potato chips','sup-snacks','🥔','paquete'), a('cookies','Cookies','sup-snacks','🍪','paquete'),
  a('candy','Candy','sup-snacks','🍬','paquete'), a('popcorn','Popcorn','sup-snacks','🍿','paquete'),
  a('dish-soap','Dish soap','sup-limpieza','🧴','unidad'), a('paper-towels','Paper towels','sup-limpieza','🧻','paquete'),
  a('trash-bags','Trash bags','sup-limpieza','🗑️','paquete'), a('toilet-paper','Toilet paper','sup-limpieza','🧻','paquete'),
  a('shampoo','Shampoo','sup-higiene','🧴','unidad'), a('toothpaste','Toothpaste','sup-higiene','🪥','unidad'),
];

// ───────────────────────── 🇫🇷 Francia ─────────────────────────
const f = mk('fr');
const FR: Product[] = [
  f('pommes','Pommes','sup-fruteria','🍎','kg'), f('bananes','Bananes','sup-fruteria','🍌','kg'),
  f('pommes-terre','Pommes de terre','sup-fruteria','🥔','kg'), f('carottes','Carottes','sup-fruteria','🥕','kg'),
  f('tomates','Tomates','sup-fruteria','🍅','kg'), f('salade','Salade','sup-fruteria','🥬','unidad'),
  f('courgette','Courgettes','sup-fruteria','🥒','kg'), f('oignons','Oignons','sup-fruteria','🧅','kg'),
  f('poulet','Blanc de poulet','sup-carniceria','🐔','paquete'), f('boeuf-hache','Bœuf haché','sup-carniceria','🥩','paquete'),
  f('lardons','Lardons','sup-carniceria','🥓','paquete'), f('saucisses','Saucisses','sup-carniceria','🌭','paquete'),
  f('cote-porc','Côtes de porc','sup-carniceria','🥩','paquete'), f('jambon','Jambon blanc','sup-charcuteria','🍖','paquete'),
  f('saucisson','Saucisson','sup-charcuteria','🌭','unidad'), f('pate','Pâté','sup-charcuteria','🥫','unidad'),
  f('cabillaud','Cabillaud','sup-pescaderia','🐟','paquete'), f('saumon','Saumon','sup-pescaderia','🐟','paquete'),
  f('crevettes','Crevettes','sup-pescaderia','🦐','paquete'), f('thon','Thon en boîte','sup-pescaderia','🥫','unidad'),
  f('lait','Lait','sup-lacteos','🥛','l'), f('beurre','Beurre','sup-lacteos','🧈','unidad'),
  f('oeufs','Œufs','sup-lacteos','🥚','docena'), f('camembert','Camembert','sup-lacteos','🧀','unidad'),
  f('yaourt','Yaourts','sup-lacteos','🥣','paquete'), f('creme-fraiche','Crème fraîche','sup-lacteos','🥛','unidad'),
  f('baguette','Baguette','sup-panaderia','🥖','unidad'), f('croissant','Croissants','sup-panaderia','🥐','paquete'),
  f('pain-mie','Pain de mie','sup-panaderia','🍞','unidad'), f('brioche','Brioche','sup-panaderia','🥐','unidad'),
  f('pates','Pâtes','sup-despensa','🍝','paquete'), f('riz','Riz','sup-despensa','🍚','paquete'),
  f('moutarde','Moutarde','sup-despensa','🌭','unidad'), f('huile-olive','Huile d’olive','sup-despensa','🫒','unidad'),
  f('confiture','Confiture','sup-despensa','🍓','unidad'), f('cafe','Café','sup-bebidas','☕','paquete'),
  f('frites','Frites surgelées','sup-congelados','🍟','paquete'), f('petits-pois','Petits pois','sup-congelados','🟢','paquete'),
  f('glace','Glace','sup-congelados','🍨','unidad'),
  f('jus-orange','Jus d’orange','sup-bebidas','🧃','l'), f('vin-rouge','Vin rouge','sup-bebidas','🍷','unidad'),
  f('eau','Eau minérale','sup-bebidas','💧','paquete'), f('biere','Bière','sup-bebidas','🍺','paquete'),
  f('chips','Chips','sup-snacks','🥔','paquete'), f('biscuits','Biscuits','sup-snacks','🍪','paquete'),
  f('chocolat','Chocolat','sup-snacks','🍫','unidad'),
  f('liquide-vaisselle','Liquide vaisselle','sup-limpieza','🧴','unidad'), f('papier-toilette','Papier toilette','sup-limpieza','🧻','paquete'),
  f('essuie-tout','Essuie-tout','sup-limpieza','🧻','paquete'), f('shampoing','Shampoing','sup-higiene','🧴','unidad'),
  f('dentifrice','Dentifrice','sup-higiene','🪥','unidad'),
];

// ───────────────────────── 🇩🇪 Alemania ─────────────────────────
const d = mk('de');
const DE: Product[] = [
  d('aepfel','Äpfel','sup-fruteria','🍎','kg'), d('bananen','Bananen','sup-fruteria','🍌','kg'),
  d('kartoffeln','Kartoffeln','sup-fruteria','🥔','kg'), d('karotten','Karotten','sup-fruteria','🥕','kg'),
  d('tomaten','Tomaten','sup-fruteria','🍅','kg'), d('salat','Salat','sup-fruteria','🥬','unidad'),
  d('gurke','Gurke','sup-fruteria','🥒','unidad'), d('zwiebeln','Zwiebeln','sup-fruteria','🧅','kg'),
  d('haehnchen','Hähnchenbrust','sup-carniceria','🐔','paquete'), d('hackfleisch','Hackfleisch','sup-carniceria','🥩','paquete'),
  d('speck','Speck','sup-carniceria','🥓','paquete'), d('bratwurst','Bratwurst','sup-carniceria','🌭','paquete'),
  d('schnitzel','Schnitzel','sup-carniceria','🍖','paquete'), d('aufschnitt','Aufschnitt','sup-charcuteria','🥪','paquete'),
  d('wurst','Wurst','sup-charcuteria','🌭','paquete'), d('leberwurst','Leberwurst','sup-charcuteria','🥫','unidad'),
  d('lachs','Lachs','sup-pescaderia','🐟','paquete'), d('kabeljau','Kabeljau','sup-pescaderia','🐟','paquete'),
  d('garnelen','Garnelen','sup-pescaderia','🦐','paquete'), d('thunfisch','Thunfisch (Dose)','sup-pescaderia','🥫','unidad'),
  d('milch','Milch','sup-lacteos','🥛','l'), d('butter','Butter','sup-lacteos','🧈','unidad'),
  d('eier','Eier','sup-lacteos','🥚','docena'), d('kaese','Käse','sup-lacteos','🧀','paquete'),
  d('joghurt','Joghurt','sup-lacteos','🥣','paquete'), d('quark','Quark','sup-lacteos','🥣','unidad'),
  d('broetchen','Brötchen','sup-panaderia','🥖','paquete'), d('brot','Brot','sup-panaderia','🍞','unidad'),
  d('brezel','Brezel','sup-panaderia','🥨','paquete'), d('vollkornbrot','Vollkornbrot','sup-panaderia','🍞','unidad'),
  d('nudeln','Nudeln','sup-despensa','🍝','paquete'), d('reis','Reis','sup-despensa','🍚','paquete'),
  d('sauerkraut','Sauerkraut','sup-despensa','🥬','unidad'), d('senf','Senf','sup-despensa','🌭','unidad'),
  d('muesli','Müsli','sup-desayuno','🥣','paquete'), d('kaffee','Kaffee','sup-bebidas','☕','paquete'),
  d('pommes','Pommes (TK)','sup-congelados','🍟','paquete'), d('erbsen','Erbsen (TK)','sup-congelados','🟢','paquete'),
  d('eis','Eis','sup-congelados','🍨','unidad'),
  d('apfelsaft','Apfelsaft','sup-bebidas','🧃','l'), d('bier','Bier','sup-bebidas','🍺','paquete'),
  d('mineralwasser','Mineralwasser','sup-bebidas','💧','paquete'), d('wein','Wein','sup-bebidas','🍷','unidad'),
  d('chips','Chips','sup-snacks','🥔','paquete'), d('kekse','Kekse','sup-snacks','🍪','paquete'),
  d('schokolade','Schokolade','sup-snacks','🍫','unidad'), d('gummibaerchen','Gummibärchen','sup-snacks','🐻','paquete'),
  d('spuelmittel','Spülmittel','sup-limpieza','🧴','unidad'), d('kuechenrolle','Küchenrolle','sup-limpieza','🧻','paquete'),
  d('toilettenpapier','Toilettenpapier','sup-limpieza','🧻','paquete'), d('shampoo','Shampoo','sup-higiene','🧴','unidad'),
  d('zahnpasta','Zahnpasta','sup-higiene','🪥','unidad'),
];

// ───────────────────────── 🇧🇷 Brasil ─────────────────────────
const b = mk('br');
const BR: Product[] = [
  b('banana','Banana','sup-fruteria','🍌','kg'), b('mamao','Mamão','sup-fruteria','🫒','kg'),
  b('manga','Manga','sup-fruteria','🥭','kg'), b('abacaxi','Abacaxi','sup-fruteria','🍍','unidad'),
  b('laranja','Laranja','sup-fruteria','🍊','kg'), b('maca','Maçã','sup-fruteria','🍎','kg'),
  b('tomate','Tomate','sup-fruteria','🍅','kg'), b('cebola','Cebola','sup-fruteria','🧅','kg'),
  b('batata','Batata','sup-fruteria','🥔','kg'), b('mandioca','Mandioca','sup-fruteria','🥔','kg'),
  b('alface','Alface','sup-fruteria','🥬','unidad'), b('cenoura','Cenoura','sup-fruteria','🥕','kg'),
  b('picanha','Picanha','sup-carniceria','🥩','kg'), b('frango','Peito de frango','sup-carniceria','🐔','kg'),
  b('carne-moida','Carne moída','sup-carniceria','🥩','kg'), b('linguica','Linguiça','sup-carniceria','🌭','kg'),
  b('bacon','Bacon','sup-carniceria','🥓','paquete'), b('costela','Costela','sup-carniceria','🍖','kg'),
  b('tilapia','Tilápia','sup-pescaderia','🐟','kg'), b('salmao','Salmão','sup-pescaderia','🐟','kg'),
  b('camarao','Camarão','sup-pescaderia','🦐','kg'), b('sardinha','Sardinha (lata)','sup-pescaderia','🥫','unidad'),
  b('leite','Leite','sup-lacteos','🥛','l'), b('manteiga','Manteiga','sup-lacteos','🧈','unidad'),
  b('queijo','Queijo mussarela','sup-lacteos','🧀','paquete'), b('ovos','Ovos','sup-lacteos','🥚','docena'),
  b('iogurte','Iogurte','sup-lacteos','🥣','paquete'), b('requeijao','Requeijão','sup-lacteos','🧀','unidad'),
  b('pao-frances','Pão francês','sup-panaderia','🥖','kg'), b('pao-forma','Pão de forma','sup-panaderia','🍞','unidad'),
  b('pao-queijo','Pão de queijo','sup-panaderia','🧀','paquete'), b('bolo','Bolo','sup-panaderia','🍰','unidad'),
  b('presunto','Presunto','sup-charcuteria','🍖','paquete'), b('mortadela','Mortadela','sup-charcuteria','🥪','paquete'),
  b('queijo-minas','Queijo minas','sup-charcuteria','🧀','unidad'),
  b('arroz','Arroz','sup-despensa','🍚','paquete'), b('feijao','Feijão','sup-despensa','🫘','paquete'),
  b('farinha-mandioca','Farinha de mandioca','sup-despensa','🌾','paquete'), b('macarrao','Macarrão','sup-despensa','🍝','paquete'),
  b('oleo','Óleo de soja','sup-despensa','🛢️','unidad'), b('molho-tomate','Molho de tomate','sup-despensa','🥫','unidad'),
  b('cafe','Café','sup-despensa','☕','paquete'), b('acucar','Açúcar','sup-despensa','🍬','paquete'),
  b('pao-queijo-cong','Pão de queijo congelado','sup-congelados','🧀','paquete'), b('pizza','Pizza congelada','sup-congelados','🍕','unidad'),
  b('sorvete','Sorvete','sup-congelados','🍨','unidad'),
  b('guarana','Guaraná','sup-bebidas','🥤','paquete'), b('suco-laranja','Suco de laranja','sup-bebidas','🧃','l'),
  b('cerveja','Cerveja','sup-bebidas','🍺','paquete'), b('agua','Água mineral','sup-bebidas','💧','paquete'),
  b('refrigerante','Refrigerante','sup-bebidas','🥤','unidad'),
  b('salgadinho','Salgadinho','sup-snacks','🥔','paquete'), b('biscoito','Biscoito','sup-snacks','🍪','paquete'),
  b('chocolate','Chocolate','sup-snacks','🍫','unidad'), b('bala','Balas','sup-snacks','🍬','paquete'),
  b('detergente','Detergente','sup-limpieza','🧴','unidad'), b('papel-higienico','Papel higiênico','sup-limpieza','🧻','paquete'),
  b('sabao-po','Sabão em pó','sup-limpieza','🧴','paquete'), b('papel-toalha','Papel toalha','sup-limpieza','🧻','paquete'),
  b('shampoo','Shampoo','sup-higiene','🧴','unidad'), b('pasta-dente','Pasta de dente','sup-higiene','🪥','unidad'),
];

export const LOCALIZED_PRODUCTS: Record<Locale, Product[]> = {
  es: PRODUCTS_SEED,
  en: UK,
  us: US_PRODUCTS,
  fr: FR,
  de: DE,
  br: BR,
};
