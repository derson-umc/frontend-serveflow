const ESTABELECIMENTO = {
  nome: 'ServeFlow Restaurante',
  cnpj: '00.000.000/0001-00',
  endereco: 'Rua Principal, 100 - Centro',
  cidade: 'Cidade - UF, CEP 00000-000',
  telefone: '(00) 0000-0000',
};

const PAYMENT_LABELS = {
  DINHEIRO: 'Dinheiro',
  CREDITO: 'Cartão de Crédito',
  DEBITO: 'Cartão de Débito',
  PIX: 'PIX',
  VOUCHER: 'Vale-refeição',
  MISTO: 'Pagamento Misto',
};

const fmt = (v) =>
  Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDateTime = (s) => {
  if (!s) return '—';
  return new Date(s).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const LINE = '─'.repeat(38);
const pad = (str, len) => String(str ?? '').substring(0, len).padEnd(len);
const center = (str, w = 38) => {
  const s = String(str ?? '').substring(0, w);
  const sp = Math.max(0, Math.floor((w - s.length) / 2));
  return ' '.repeat(sp) + s;
};

function buildReceipt(order, operator) {
  if (!order) return '';
  const isDelivery = order.type === 'DELIVERY';
  const orderId = String(order.id ?? '').substring(0, 8).toUpperCase();
  const lines = [];

  lines.push(center(ESTABELECIMENTO.nome));
  lines.push(center(ESTABELECIMENTO.cnpj));
  lines.push(center(ESTABELECIMENTO.endereco));
  lines.push(center(ESTABELECIMENTO.cidade));
  lines.push(center(ESTABELECIMENTO.telefone));
  lines.push(LINE);
  lines.push(center(isDelivery ? 'PEDIDO DELIVERY' : 'COMANDA'));
  lines.push(LINE);
  lines.push(`Pedido : #${orderId}`);
  lines.push(`Data   : ${fmtDateTime(order.createdAt)}`);
  lines.push(`Cliente: ${order.customerName ?? '—'}`);

  if (isDelivery && order.address) {
    const a = order.address;
    lines.push(LINE);
    lines.push('ENDEREÇO DE ENTREGA:');
    if (a.street) lines.push(`  ${a.street}, ${a.number ?? 's/n'}`);
    if (a.complement) lines.push(`  ${a.complement}`);
    if (a.city) lines.push(`  ${a.city}${a.state ? ` - ${a.state}` : ''}`);
    if (a.cep) lines.push(`  CEP: ${a.cep}`);
  }

  lines.push(LINE);
  lines.push('ITENS:');
  (order.items ?? []).forEach((item) => {
    const nameCol = pad(item.productName, 22);
    const totalCol = fmt(item.total).padStart(10);
    lines.push(`${item.quantity}x ${nameCol} ${totalCol}`);
    if (item.observation) lines.push(`   Obs: ${item.observation}`);
    (item.additionals ?? []).forEach((a) => {
      lines.push(`   + ${a.quantity}x ${pad(a.name, 16)} ${fmt(a.total).padStart(8)}`);
    });
  });

  lines.push(LINE);
  lines.push(`TOTAL  :${''.padEnd(20)}${fmt(order.totalValue).padStart(12)}`);

  if (order.paymentMethod) {
    const label = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod;
    lines.push(`Pgto   : ${label}`);
  }

  if (order.observation) {
    lines.push(LINE);
    lines.push(`Obs: ${order.observation}`);
  }

  lines.push(LINE);
  if (operator) lines.push(`Operador: ${operator}`);
  lines.push('');
  lines.push(center('Obrigado pela preferência!'));

  return lines.join('\n');
}

export function PrintModal({ order, operator, open, onClose }) {
  if (!open || !order) return null;

  const text = buildReceipt(order, operator);
  const isDelivery = order.type === 'DELIVERY';

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(
        `<html><head><title>Cupom</title><style>` +
        `body{font-family:'Courier New',monospace;padding:20px;background:#fff;max-width:400px;margin:0 auto}` +
        `pre{white-space:pre-wrap;font-size:12px;line-height:1.5}` +
        `button{margin-top:16px;padding:10px 20px;width:100%;background:#2E7D32;color:#fff;border:none;` +
        `border-radius:6px;cursor:pointer;font-size:14px;font-weight:700}` +
        `</style></head><body>` +
        `<pre>${text}</pre>` +
        `<button onclick="window.print();window.close()">Imprimir</button>` +
        `</body></html>`
      );
      w.document.close();
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)', zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #E0E0E0',
        width: '100%', maxWidth: 440, maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid #E0E0E0',
        }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#212121', margin: 0 }}>
              {isDelivery ? 'Cupom — Delivery' : 'Cupom — Comanda'}
            </h3>
            <p style={{ fontSize: 11, color: '#757575', margin: '2px 0 0' }}>
              Pré-visualização antes da impressão
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6, background: '#F5F5F5',
              border: 'none', color: '#757575', cursor: 'pointer', fontSize: 13,
            }}
          >✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          <pre style={{
            fontFamily: "'Courier New', monospace", fontSize: 11, color: '#212121',
            whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.55,
            background: '#FAFAFA', border: '1px solid #E0E0E0',
            borderRadius: 8, padding: '12px 14px',
          }}>
            {text}
          </pre>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '12px 18px', borderTop: '1px solid #E0E0E0' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '9px', borderRadius: 8, background: '#F5F5F5',
              border: '1px solid #E0E0E0', color: '#757575', fontWeight: 600,
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handlePrint}
            style={{
              flex: 2, padding: '9px', borderRadius: 8, background: '#2E7D32',
              border: 'none', color: '#fff', fontWeight: 700, fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
