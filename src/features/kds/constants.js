import { palette } from '@styles/ds';

export const TEAL  = '#00838F';
export const LIGHT = '#9E9E9E';

export const STATUS_CONFIG = {
  RASCUNHO:  { label: 'RASCUNHO',    bg: palette.blue   },
  ENVIADO:   { label: 'ENVIADO',     bg: '#6A1B9A'      },
  EM_PREPARO: { label: 'EM PREPARO', bg: palette.orange },
  PRONTO:    { label: 'PRONTO',      bg: palette.green  },
  A_CAMINHO: { label: 'A CAMINHO',   bg: TEAL           },
  ENTREGUE:  { label: 'ENTREGUE',    bg: '#4E342E'      },
  CANCELADO: { label: 'CANCELADO',   bg: palette.red    },
};

export const CANCEL_REASONS = [
  'Sem ingrediente',
  'Produto em falta',
  'Solicitação do cliente',
  'Preparo não possível',
  'Item indisponível hoje',
  'Outro',
];

export const PROGRESS_STEPS = ['RASCUNHO', 'ENVIADO', 'EM_PREPARO', 'PRONTO', 'A_CAMINHO', 'ENTREGUE'];

export const VISIBLE_STATUSES = ['ENVIADO', 'EM_PREPARO', 'PRONTO', 'A_CAMINHO'];

export const SECTIONS = [
  { key: 'pending',     label: 'Aguardando', statuses: ['ENVIADO'],               color: palette.blue   },
  { key: 'preparation', label: 'Em Preparo', statuses: ['EM_PREPARO'],             color: palette.orange },
  { key: 'ready',       label: 'Prontos',    statuses: ['PRONTO', 'A_CAMINHO'],    color: palette.green  },
];

const BEVERAGE_CATEGORIES = ['BEBIDA_ALCOOLICA', 'BEBIDA_NAO_ALCOOLICA'];

// Heurística por nome — usada quando o produto não tem productCategory definido
const BEVERAGE_NAME_TOKENS = [
  'bebida', 'refrigerante', 'suco', 'água', 'agua',
  'cerveja', 'vinho', 'chopp', 'chope', 'coquetel', 'cocktail',
  'café', 'cafe', 'chá', 'cha', 'limonada', 'energético', 'energetico',
  'caipirinha', 'destilado', 'whisky', 'vodka', 'gin', 'rum',
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
