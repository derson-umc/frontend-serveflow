import { z } from 'zod';
import { palette } from '@styles/ds';

export const PU  = '#6A1B9A';
export const PUF = '#F3E5F5';

export const UNITS = [
  { value: 'kg',  label: 'kg — quilograma' },
  { value: 'g',   label: 'g — grama'       },
  { value: 'L',   label: 'L — litro'       },
  { value: 'ml',  label: 'ml — mililitro'  },
  { value: 'UN',  label: 'UN — unidade'    },
  { value: 'cx',  label: 'cx — caixa'      },
  { value: 'pct', label: 'pct — pacote'    },
  { value: 'dz',  label: 'dz — dúzia'      },
];

export const CATEGORIES = [
  'Carnes', 'Laticínios', 'Grãos e Cereais', 'Bebidas',
  'Embalagens', 'Temperos', 'Frutas e Verduras', 'Outros',
];

export const MOVEMENT_LABELS = {
  ENTRY:             { label: 'Entrada',        color: palette.green,  bg: palette.greenSurface  },
  EXIT:              { label: 'Saída - Manual',  color: palette.red,    bg: palette.redSurface    },
  ORDER_CONSUMPTION: { label: 'Saída - Venda',   color: palette.red,    bg: palette.redSurface    },
  LOSS:              { label: 'Perda',           color: palette.orange, bg: palette.orangeSurface },
  ADJUSTMENT:        { label: 'Ajuste',          color: PU,             bg: PUF                   },
};

export const ENTRY_SUGGESTIONS  = ['Compra semanal', 'Compra mensal', 'Reposição urgente', 'Entrada de fornecedor', 'Inventário inicial'];
export const LOSS_SUGGESTIONS   = ['Produto vencido', 'Embalagem danificada', 'Perda operacional', 'Quebra acidental', 'Contaminação'];
export const ADJUST_SUGGESTIONS = ['Contagem física mensal', 'Auditoria de inventário', 'Correção de lançamento', 'Divergência encontrada', 'Inventário semestral'];

export const TABS = [
  { key: 'insumos',       label: 'Insumos'       },
  { key: 'movimentacoes', label: 'Movimentações' },
  { key: 'alertas',       label: 'Alertas'       },
  { key: 'relatorio',     label: 'Relatório'     },
];

export const insumoSchema = z.object({
  name:            z.string().min(2, 'Nome é obrigatório'),
  unit:            z.string().min(1, 'Unidade é obrigatória'),
  category:        z.string().optional(),
  currentQuantity: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }).min(0, 'Deve ser ≥ 0').optional(),
  minimumQuantity: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }).min(0, 'Deve ser ≥ 0'),
  supplier:        z.string().optional(),
  averageCost:     z.union([z.coerce.number().min(0), z.literal('')]).optional(),
});
