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
    case 'RASCUNHO':
    case 'ENVIADO':
      return {
        label:        'INICIAR PREPARO',
        bg:           palette.blue,
        fg:           palette.white,
        fn:           () => kdsApi.prepare(id),
        msg:          `Pedido ${shortId} em preparo`,
        deductsStock: true,
      };
    case 'EM_PREPARO':
      return {
        label:        'FINALIZAR PEDIDO',
        bg:           palette.orange,
        fg:           palette.white,
        fn:           () => kdsApi.ready(id),
        msg:          `Pedido ${shortId} pronto`,
        deductsStock: false,
      };
    case 'PRONTO':
      return {
        label:        order.type === 'DELIVERY' ? 'ENVIAR' : 'ENTREGAR',
        bg:           palette.green,
        fg:           palette.white,
        fn:           () => kdsApi.complete(id),
        msg:          `Pedido ${shortId} ${order.type === 'DELIVERY' ? 'a caminho' : 'entregue'}`,
        deductsStock: false,
      };
    case 'A_CAMINHO':
      return {
        label:        'CONFIRMAR ENTREGA',
        bg:           TEAL,
        fg:           palette.white,
        fn:           () => kdsApi.complete(id),
        msg:          `Pedido ${shortId} entregue`,
        deductsStock: false,
      };
    default:
      return null;
  }
}
