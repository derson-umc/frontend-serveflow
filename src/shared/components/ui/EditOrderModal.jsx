import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

const fmt = (v) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function EditOrderModal({ order, type, open, onClose, onSave }) {
  const [editing, setEditing] = useState(() => JSON.parse(JSON.stringify(order)));

  const total = editing.itens.reduce((s, i) => s + i.price * i.quantity, 0);

  function updateItem(idx, field, value) {
    setEditing((prev) => {
      const itens = [...prev.itens];
      if (field === 'quantity') itens[idx] = { ...itens[idx], quantity: parseInt(value) || 0, total: itens[idx].price * (parseInt(value) || 0) };
      else if (field === 'price') itens[idx] = { ...itens[idx], price: parseFloat(value) || 0, total: (parseFloat(value) || 0) * itens[idx].quantity };
      else if (field === 'name') itens[idx] = { ...itens[idx], name: value };
      return { ...prev, itens };
    });
  }

  function removeItem(idx) {
    setEditing((prev) => ({ ...prev, itens: prev.itens.filter((_, i) => i !== idx) }));
  }

  function addItem() {
    setEditing((prev) => ({
      ...prev,
      itens: [...prev.itens, { id: Date.now(), name: 'Novo produto', quantity: 1, price: 0, total: 0 }],
    }));
  }

  const titleLabel = type === 'comanda'
    ? `Comanda #${editing.id} — Mesa`
    : `Delivery #${editing.id} — Cliente`;
  const fieldLabel = type === 'comanda' ? 'Número da Mesa' : 'Nome do Cliente';
  const fieldValue = type === 'comanda' ? editing.mesa : editing.nome;
  const onFieldChange = type === 'comanda'
    ? (v) => setEditing((p) => ({ ...p, mesa: v }))
    : (v) => setEditing((p) => ({ ...p, nome: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Editar ${type === 'comanda' ? 'Comanda' : 'Delivery'} #${editing.id}`}
      size="xl"
      footer={
        <>
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button variant="primary" fullWidth onClick={() => onSave({ ...editing, total })}>Salvar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label={fieldLabel}
          value={fieldValue}
          onChange={(e) => onFieldChange(e.target.value)}
        />

        {type === 'delivery' && (
          <Input
            label="Endereço"
            value={editing.endereco}
            onChange={(e) => setEditing((p) => ({ ...p, endereco: e.target.value }))}
          />
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label" style={{ margin: 0 }}>Itens</label>
            <Button variant="ghost" size="xs" onClick={addItem}>+ Adicionar</Button>
          </div>

          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {editing.itens.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 10px',
                }}
              >
                <input
                  value={item.name}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  className="form-input flex-1"
                  style={{ minWidth: 0 }}
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  className="form-input"
                  style={{ width: 64, textAlign: 'center' }}
                />
                <input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateItem(idx, 'price', e.target.value)}
                  className="form-input"
                  style={{ width: 100, textAlign: 'right' }}
                />
                <Button variant="danger" size="xs" onClick={() => removeItem(idx)}>✕</Button>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: 'var(--color-success-surface)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
            Novo total:
          </span>
          <span style={{ fontWeight: 'var(--font-black)', color: 'var(--color-success)', fontSize: 'var(--text-2xl)' }}>
            {fmt(total)}
          </span>
        </div>
      </div>
    </Modal>
  );
}
