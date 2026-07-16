import type { Product } from '../../../types';
import { mk } from './_mk';

/** 🇩🇪 Alemania — catálogo de supermercado (Aldi/Lidl/Rewe/Edeka…). */
const d = mk('de');

export const DE: Product[] = [
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
