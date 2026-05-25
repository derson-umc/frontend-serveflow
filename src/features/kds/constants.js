import { palette } from '@styles/ds';

export const TEAL  = '#00838F';
export const LIGHT = '#9E9E9E';

export const STATUS_CONFIG = {
  CREATED:          { label: 'NOVO',           bg: palette.blue   },
  CONFIRMED:        { label: 'CONFIRMADO',      bg: '#6A1B9A'      },
  IN_PREPARATION:   { label: 'EM PREPARO',      bg: palette.orange },
  READY:            { label: 'PRONTO',          bg: palette.green  },
  OUT_FOR_DELIVERY: { label: 'A CAMINHO',       bg: TEAL           },
  DELIVERED:        { label: 'ENTREGUE',        bg: '#4E342E'      },
  CANCELLED:        { label: 'CANCELADO',       bg: palette.red    },
};

export const CANCEL_REASONS = [
  'Sem ingrediente',
  'Produto em falta',
  'Solicitação do cliente',
  'Preparo não possível',
  'Item indisponível hoje',
  'Outro',
];

export const PROGRESS_STEPS = ['CREATED', 'CONFIRMED', 'IN_PREPARATION', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export const VISIBLE_STATUSES = ['CREATED', 'CONFIRMED', 'IN_PREPARATION', 'READY', 'OUT_FOR_DELIVERY'];

export const SECTIONS = [
  { key: 'pending',     label: 'Aguardando', statuses: ['CREATED', 'CONFIRMED'],       color: palette.blue   },
  { key: 'preparation', label: 'Em Preparo', statuses: ['IN_PREPARATION'],             color: palette.orange },
  { key: 'ready',       label: 'Prontos',    statuses: ['READY', 'OUT_FOR_DELIVERY'],  color: palette.green  },
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
