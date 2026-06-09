import { kdsApi } from '@core/api/kds';
import { palette } from '@styles/ds';
import { TEAL } from './constants';

export function waitColor(createdAt) {
  const m = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (m >= 15) return palette.red;
  if (m >= 10) return palette.orange;
  if (m >= 5)  return '#F9A825';
  return palette.green;
}

export function waitMinutes(createdAt) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

export function getPrimaryAction(order) {
  const id      = order.id;
  const shortId = String(id).slice(-6).toUpperCase();
  switch (order.status) {
    // PENDENTE e ENVIADO → "Em Fila": um único botão "INICIAR PREPARO"
    // O backend em /prepare já faz confirm + startPreparation numa transação
    case 'PENDENTE':
    case 'ENVIADO':
      return {
        label:        'INICIAR PREPARO',
        bg:           '#6A1B9A',
        fg:           palette.white,
        fn:           () => kdsApi.prepare(id),
        msg:          `Pedido ${shortId} em andamento`,
        deductsStock: true,
      };
    case 'EM_PREPARO':
      return {
        label:        'FINALIZAR PREPARO',
        bg:           palette.orange,
        fg:           palette.white,
        fn:           () => kdsApi.ready(id),
        msg:          `Pedido ${shortId} pronto`,
        deductsStock: false,
      };
    // PRONTO: cozinha só visualiza — entrega é responsabilidade do garçom via menu
    case 'PRONTO':
      return null;
    default:
      return null;
  }
}
