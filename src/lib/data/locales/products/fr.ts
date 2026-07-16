import type { Product } from '../../../types';
import { mk } from './_mk';

/** 🇫🇷 Francia — catálogo de supermercado (Carrefour/Leclerc/Auchan…). */
const f = mk('fr');

export const FR: Product[] = [
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
