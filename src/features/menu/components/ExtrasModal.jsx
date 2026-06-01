import { useState } from 'react';
import { Modal } from '@shared/components/ui/Modal';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function ExtrasModal({ cartItem, initialExtras = [], onSave, onClose }) {
  const [extras, setExtras] = useState(initialExtras);
  const [form, setForm] = useState({ name: '', quantity: 1, unitPrice: '' });
  const [err, setErr] = useState('');

  const add = () => {
    if (!form.name.trim()) return setErr('Nome é obrigatório.');
    const qty   = parseInt(form.quantity, 10);
    const price = parseFloat(form.unitPrice);
    if (isNaN(qty)   || qty   < 1)  return setErr('Quantidade inválida.');
    if (isNaN(price) || price <= 0) return setErr('Preço deve ser maior que zero.');
    setExtras((prev) => [...prev, { name: form.name.trim(), quantity: qty, unitPrice: price }]);
    setForm({ name: '', quantity: 1, unitPrice: '' });
    setErr('');
  };

  const remove = (idx) => setExtras((prev) => prev.filter((_, i) => i !== idx));

  return (
    <Modal
      open
      onClose={onClose}
      title="Adicionais"
      size="sm"
      footer={
        <>
          <Button variant="ghost"   fullWidth onClick={onClose}>Cancelar</Button>
          <Button variant="primary" fullWidth onClick={() => onSave(cartItem.id, extras)}>
            Confirmar
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        {cartItem.name}
      </p>

      {extras.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          {extras.map((e, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)]"
              style={{ background: 'var(--color-warning-surface)', border: '1px solid var(--color-warning-border)' }}
            >
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--color-warning)' }}>
                {e.quantity}× {e.name} — {fmt(e.unitPrice)}
              </span>
              <button
                onClick={() => remove(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: 14, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Input
          placeholder="Ex: Bife, Batata frita, Purê..."
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <div className="flex gap-2">
          <Input
            type="number"
            min={1}
            placeholder="Qtd"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            containerClassName="flex-1"
          />
          <Input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="R$ unit."
            value={form.unitPrice}
            onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
            containerClassName="flex-1"
          />
        </div>

        {err && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{err}</p>}

        <Button variant="warning" size="sm" onClick={add}>+ Adicionar extra</Button>
      </div>
    </Modal>
  );
}
