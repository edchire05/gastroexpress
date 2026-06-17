import { MenuItem } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'burger-01',
    name: 'Smash Clássico',
    description: 'Pão de brioche selado na manteiga, dois smash burgers de 80g blend angus, queijo cheddar derretido, picles artesanal e molho secreto da casa.',
    price: 28.90,
    category: 'Burgueres',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    available: true,
    options: [
      {
        name: 'Ponto da Carne',
        choices: [
          { name: 'Ao ponto', extraPrice: 0 },
          { name: 'Bem passado', extraPrice: 0 },
          { name: 'Mal passado / Suculento', extraPrice: 0 }
        ]
      },
      {
        name: 'Extras',
        choices: [
          { name: 'Sem extras', extraPrice: 0 },
          { name: 'Bacon Extra (+ 4,50 MT)', extraPrice: 4.50 },
          { name: 'Queijo Cheddar Dobrado (+ 3,00 MT)', extraPrice: 3.00 }
        ]
      }
    ]
  },
  {
    id: 'burger-02',
    name: 'Double Bacon Tasty',
    description: 'Para os apaixonados por bacon: Pão australiano, duas carnes de 150g, muito bacon crocante, queijo prato e molho barbecue rústico.',
    price: 36.90,
    category: 'Burgueres',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    available: true,
    options: [
      {
        name: 'Ponto da Carne',
        choices: [
          { name: 'Ao ponto', extraPrice: 0 },
          { name: 'Bem passado', extraPrice: 0 }
        ]
      },
      {
        name: 'Adicionais',
        choices: [
          { name: 'Nenhum', extraPrice: 0 },
          { name: 'Cebola Caramelizada (+ 3,50 MT)', extraPrice: 3.50 },
          { name: 'Ovo frito (+ 2,50 MT)', extraPrice: 2.50 }
        ]
      }
    ]
  },
  {
    id: 'pizza-01',
    name: 'Pizza Margherita Suprema',
    description: 'Molho de tomate pelati italiano, muçarela de búfala artesanal, tomates cereja assados, manjericão fresco gigante e fio de azeite trufado de oliva.',
    price: 49.90,
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    available: true,
    options: [
      {
        name: 'Tamanho',
        choices: [
          { name: 'Média (6 fatias)', extraPrice: 0 },
          { name: 'Grande (8 fatias) (+ 15,00 MT)', extraPrice: 15.00 }
        ]
      },
      {
        name: 'Borda',
        choices: [
          { name: 'Sem borda recheada', extraPrice: 0 },
          { name: 'Borda de Catupiry (+ 8,00 MT)', extraPrice: 8.00 },
          { name: 'Borda de Cheddar (+ 8,00 MT)', extraPrice: 8.00 }
        ]
      }
    ]
  },
  {
    id: 'pizza-02',
    name: 'Pizza Calabresa Real',
    description: 'Molho de tomate especial da casa, muçarela premium, calabresa defumada artesanal fatiada fina, cebola roxa e azeitonas pretas chilenas polvilhadas com orégano frito.',
    price: 45.90,
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
    available: true,
    options: [
      {
        name: 'Tamanho',
        choices: [
          { name: 'Média (6 fatias)', extraPrice: 0 },
          { name: 'Grande (8 fatias) (+ 14,00 MT)', extraPrice: 14.00 }
        ]
      }
    ]
  },
  {
    id: 'side-01',
    name: 'Batata Rústica da Casa',
    description: 'Batatas rústicas com casca, fritas até ficarem super crocantes por fora, temperadas com páprica defumada, sal de alecrim e servidas com maionese artesanal verde.',
    price: 18.90,
    category: 'Acompanhamentos',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'side-02',
    name: 'Coxinhas de Frango Cream',
    description: '6 unidades de coxinhas gourmet super recheadas com frango desfiado temperado e catupiry cremoso, envoltas em casquinha Panko ultra crocante.',
    price: 22.00,
    category: 'Acompanhamentos',
    image: 'https://images.unsplash.com/photo-1524182621000-d5be14bf62df?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'drink-01',
    name: 'Refrigerante em Lata 350ml',
    description: 'Gelado e refrescante. Opções variadas para acompanhar a sua melhor refeição.',
    price: 6.50,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    available: true,
    options: [
      {
        name: 'Sabor',
        choices: [
          { name: 'Coca-Cola Tradicional', extraPrice: 0 },
          { name: 'Coca-Cola Zero', extraPrice: 0 },
          { name: 'Guaraná Antarctica', extraPrice: 0 },
          { name: 'Guaraná Zero', extraPrice: 0 },
          { name: 'Fanta Laranja', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'drink-02',
    name: 'Soda Italiana de Maçã Verde',
    description: 'Drink refrescante gaseificado artesanalmente, com xarope premium de maçã verde fatiada e muito gelo.',
    price: 12.00,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    available: true
  },
  {
    id: 'sweet-01',
    name: 'Petit Gâteau de Nutella',
    description: 'Clássico bolinho de chocolate belga morno com recheio cremoso escorrendo de Nutella, acompanhado de uma bola de sorvete de creme francês polvilhado com cacau.',
    price: 24.95,
    category: 'Sobremesas',
    image: 'https://images.unsplash.com/photo-1541795795328-f073b763494e?auto=format&fit=crop&w=600&q=80',
    available: true
  }
];

export const CATEGORIES = ['Todos', 'Burgueres', 'Pizzas', 'Acompanhamentos', 'Bebidas', 'Sobremesas'];
