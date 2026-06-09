import { palette } from '@styles/ds';

export const TEAL  = '#00838F';
export const LIGHT = '#9E9E9E';

export const STATUS_CONFIG = {
  PENDENTE:             { label: 'Em Fila',            bg: '#6A1B9A'      },
  ENVIADO:              { label: 'Em Fila',            bg: '#6A1B9A'      },
  EM_PREPARO:           { label: 'Em andamento',       bg: palette.orange },
  PRONTO:               { label: 'Pronto',             bg: palette.green  },
  AGUARDANDO_PAGAMENTO: { label: 'Aguard. Pagamento',  bg: '#D97706'      },
  A_CAMINHO:            { label: 'A Caminho',          bg: TEAL           },
  ENTREGUE:             { label: 'Entregue',           bg: '#4E342E'      },
  CANCELADO:            { label: 'Cancelado',          bg: palette.red    },
};

export const CANCEL_REASONS = [
  'Sem ingrediente',
  'Produto em falta',
  'Solicitação do cliente',
  'Preparo não possível',
  'Item indisponível hoje',
  'Outro',
];

export const PROGRESS_STEPS = ['PENDENTE', 'ENVIADO', 'EM_PREPARO', 'PRONTO', 'A_CAMINHO', 'ENTREGUE'];

export const VISIBLE_STATUSES = ['PENDENTE', 'ENVIADO', 'EM_PREPARO', 'PRONTO'];

export const SECTIONS = [
  { key: 'pending',     label: 'Em Fila',       statuses: ['PENDENTE', 'ENVIADO'],   color: '#6A1B9A'      },
  { key: 'preparation', label: 'Em andamento',  statuses: ['EM_PREPARO'],             color: palette.orange },
  { key: 'ready',       label: 'Prontos',       statuses: ['PRONTO'],                 color: palette.green  },
];

const BEVERAGE_CATEGORIES = ['BEBIDA_ALCOOLICA', 'BEBIDA_NAO_ALCOOLICA'];

// Heurística por nome — usada quando o produto não tem productCategory definido.
// Inclui marcas populares para maximizar cobertura.
const BEVERAGE_NAME_TOKENS = [
  // Genéricos
  'bebida', 'drink', 'drinkable',
  'refrigerante', 'suco', 'suco natural', 'vitamina',
  'água', 'agua', 'mineral', 'tônica', 'tonica', 'soda',
  'leite', 'milk', 'iogurte', 'yakult',
  // Quentes
  'café', 'cafe', 'expresso', 'cappuccino', 'cappucino',
  'chá', 'cha', 'chocolate quente',
  // Frios / limões
  'limonada', 'lemonade', 'kombucha',
  // Alcoólicos
  'cerveja', 'beer', 'chopp', 'chope',
  'vinho', 'wine', 'espumante', 'prosecco', 'champagne',
  'coquetel', 'cocktail', 'caipirinha', 'caipiroska',
  'destilado', 'whisky', 'whiskey', 'vodka', 'gin', 'rum',
  'cachaça', 'cachaca', 'tequila', 'licor', 'conhaque',
  // Marcas brasileiras e internacionais
  'coca', 'cola', 'pepsi', 'fanta', 'sprite',
  'guaraná', 'guarana', 'schweppes', 'gatorade', 'powerade',
  'isotônico', 'isotonico', 'redbull', 'red bull', 'monster',
  'heineken', 'budweiser', 'corona', 'skol', 'brahma',
  'itaipava', 'eisenbahn', 'stella', 'artois', 'beck',
  'amstel', 'devassa', 'polar', 'original',
];

function isBeverageByName(productName = '') {
  const lower = productName.toLowerCase();
  return BEVERAGE_NAME_TOKENS.some((t) => lower.includes(t));
}

/**
 * Retorna true se o item deve aparecer no KDS (cozinha).
 * Regra: BEBIDA_* nunca vai para KDS.
 * Fallback: se não tem categoria, verifica o nome do produto.
 */
export function isKdsItem(item) {
  if (item.productCategory) {
    return !BEVERAGE_CATEGORIES.includes(item.productCategory);
  }
  return !isBeverageByName(item.productName);
}

export const urgentPulse = {
  animate: {
    boxShadow: [
      '0 2px 14px rgba(198,40,40,0.15)',
      '0 2px 22px rgba(198,40,40,0.40)',
      '0 2px 14px rgba(198,40,40,0.15)',
    ],
  },
  transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
};
