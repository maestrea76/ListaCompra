import type { Product } from '../../../types';
import { mk } from './_mk';

/** 🇺🇸 Estados Unidos — catálogo de supermercado (Walmart/Costco/Kroger…). */
const a = mk('us');

export const US: Product[] = [
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
