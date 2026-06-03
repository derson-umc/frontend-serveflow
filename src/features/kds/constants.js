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

export const VISIBLE_STATUSES = ['RASCUNHO', 'ENVIADO', 'EM_PREPARO', 'PRONTO', 'A_CAMINHO'];

export const SECTIONS = [
  { key: 'pending',     label: 'Aguardando', statuses: ['RASCUNHO', 'ENVIADO'],    color: palette.blue   },
  { key: 'preparation', label: 'Em Preparo', statuses: ['EM_PREPARO'],             color: palette.orange },
  { key: 'ready',       label: 'Prontos',    statuses: ['PRONTO', 'A_CAMINHO'],    color: palette.green  },
];

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
