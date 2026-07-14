import type { Locale } from '../../i18n/locale';

// Traducción de los nombres visibles de TipoTienda y de las categorías de
// supermercado. Los IDs son universales; aquí solo cambia el texto. Lo no
// traducido mantiene el nombre por defecto (español).

export const TYPE_NAMES: Partial<Record<Locale, Record<string, string>>> = {
  en: {
    supermercado: 'Supermarket', panaderia: 'Bakery', carniceria: 'Butcher',
    pescaderia: 'Fishmonger', farmacia: 'Pharmacy', 'centro-comercial': 'Shopping centre',
    ferreteria: 'DIY / Hardware', delicatessen: 'Delicatessen', perfumeria: 'Beauty',
    ropa: 'Clothing', herboristeria: 'Health shop', locutorio: 'Newsagent',
    hogar: 'Home / Furniture', otros: 'Other',
  },
  us: {
    supermercado: 'Grocery store', panaderia: 'Bakery', carniceria: 'Butcher',
    pescaderia: 'Seafood', farmacia: 'Pharmacy', 'centro-comercial': 'Mall',
    ferreteria: 'Hardware', delicatessen: 'Deli', perfumeria: 'Beauty',
    ropa: 'Clothing', herboristeria: 'Health store', locutorio: 'Convenience',
    hogar: 'Home / Furniture', otros: 'Other',
  },
  fr: {
    supermercado: 'Supermarché', panaderia: 'Boulangerie', carniceria: 'Boucherie',
    pescaderia: 'Poissonnerie', farmacia: 'Pharmacie', 'centro-comercial': 'Centre commercial',
    ferreteria: 'Bricolage', delicatessen: 'Épicerie fine', perfumeria: 'Parfumerie',
    ropa: 'Vêtements', herboristeria: 'Herboristerie', locutorio: 'Tabac-presse',
    hogar: 'Maison / Meubles', otros: 'Autre',
  },
  de: {
    supermercado: 'Supermarkt', panaderia: 'Bäckerei', carniceria: 'Metzgerei',
    pescaderia: 'Fischladen', farmacia: 'Apotheke', 'centro-comercial': 'Einkaufszentrum',
    ferreteria: 'Baumarkt', delicatessen: 'Feinkost', perfumeria: 'Drogerie',
    ropa: 'Kleidung', herboristeria: 'Reformhaus', locutorio: 'Kiosk',
    hogar: 'Haushalt / Möbel', otros: 'Andere',
  },
};

const EN_SUP: Record<string, string> = {
  'sup-fruteria': 'Fruit & Veg', 'sup-carniceria': 'Meat', 'sup-pescaderia': 'Fish',
  'sup-lacteos': 'Dairy & Eggs', 'sup-panaderia': 'Bakery', 'sup-charcuteria': 'Deli',
  'sup-despensa': 'Pantry', 'sup-congelados': 'Frozen', 'sup-bebidas': 'Drinks',
  'sup-snacks': 'Snacks & Sweets', 'sup-desayuno': 'Breakfast', 'sup-limpieza': 'Cleaning',
  'sup-higiene': 'Toiletries', 'sup-bebe': 'Baby', 'sup-mascotas': 'Pets', 'sup-otros': 'Other',
};

export const CATEGORY_NAMES: Partial<Record<Locale, Record<string, string>>> = {
  en: EN_SUP,
  us: { ...EN_SUP, 'sup-fruteria': 'Produce', 'sup-snacks': 'Snacks & Candy', 'sup-higiene': 'Personal care' },
  fr: {
    'sup-fruteria': 'Fruits & Légumes', 'sup-carniceria': 'Viande', 'sup-pescaderia': 'Poisson',
    'sup-lacteos': 'Crémerie & Œufs', 'sup-panaderia': 'Boulangerie', 'sup-charcuteria': 'Charcuterie',
    'sup-despensa': 'Épicerie', 'sup-congelados': 'Surgelés', 'sup-bebidas': 'Boissons',
    'sup-snacks': 'Snacks & Sucré', 'sup-desayuno': 'Petit-déjeuner', 'sup-limpieza': 'Entretien',
    'sup-higiene': 'Hygiène', 'sup-bebe': 'Bébé', 'sup-mascotas': 'Animaux', 'sup-otros': 'Autres',
  },
  de: {
    'sup-fruteria': 'Obst & Gemüse', 'sup-carniceria': 'Fleisch', 'sup-pescaderia': 'Fisch',
    'sup-lacteos': 'Milchprodukte & Eier', 'sup-panaderia': 'Backwaren', 'sup-charcuteria': 'Wurst & Käse',
    'sup-despensa': 'Vorratskammer', 'sup-congelados': 'Tiefkühl', 'sup-bebidas': 'Getränke',
    'sup-snacks': 'Snacks & Süßes', 'sup-desayuno': 'Frühstück', 'sup-limpieza': 'Reinigung',
    'sup-higiene': 'Körperpflege', 'sup-bebe': 'Baby', 'sup-mascotas': 'Haustiere', 'sup-otros': 'Andere',
  },
};
