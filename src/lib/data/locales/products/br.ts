import type { Product } from '../../../types';
import { mk } from './_mk';

/** 🇧🇷 Brasil — catálogo de supermercado (Mendoza/Pão de Açúcar/Assaí…). */
const b = mk('br');

export const BR: Product[] = [
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
