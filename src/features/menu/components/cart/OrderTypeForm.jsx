import { useCallback } from 'react';
import { Input } from '@shared/components/ui/Input';
import { Spinner } from '@shared/components/feedback/Spinner';

export function OrderTypeForm({ tipoVenda, onTipoChange, detalhes, onDetalhesChange, endereco, onEnderecoChange }) {
  const handleCep = useCallback(
    async (raw) => {
      const digits = raw.replace(/\D/g, '').slice(0, 8);
      onEnderecoChange({ ...endereco, cep: digits });
      if (digits.length === 8) {
        onEnderecoChange((prev) => ({ ...prev, cep: digits, _loading: true }));
        try {
          const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
          const data = await res.json();
          if (!data.erro) {
            onEnderecoChange((prev) => ({
              ...prev,
              cep: digits,
              logradouro: `${data.logradouro}, ${data.bairro} — ${data.localidade}/${data.uf}`,
              _loading: false,
            }));
          } else {
            onEnderecoChange((prev) => ({ ...prev, _loading: false }));
          }
        } catch {
          onEnderecoChange((prev) => ({ ...prev, _loading: false }));
        }
      }
    },
    [endereco, onEnderecoChange]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Type selector */}
      <div className="flex gap-1.5">
        {[
          { id: 'comanda', label: 'Comanda' },
          { id: 'delivery', label: 'Delivery' },
          { id: 'pagamento', label: 'Pagamento' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTipoChange(t.id)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-bold)',
              border: tipoVenda === t.id
                ? '1.5px solid var(--color-success-border)'
                : '1.5px solid var(--color-border)',
              background: tipoVenda === t.id ? 'var(--color-success-surface)' : 'var(--color-bg)',
              color: tipoVenda === t.id ? 'var(--color-success)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Comanda fields */}
      {tipoVenda === 'comanda' && (
        <div className="flex gap-2">
          <Input
            placeholder="Nome / Comanda"
            value={detalhes.nome}
            onChange={(e) => onDetalhesChange({ ...detalhes, nome: e.target.value })}
            containerClassName="flex-1"
          />
          <Input
            placeholder="Mesa"
            value={detalhes.numero}
            onChange={(e) => onDetalhesChange({ ...detalhes, numero: e.target.value })}
            containerClassName="w-20"
          />
        </div>
      )}

      {/* Delivery fields */}
      {tipoVenda === 'delivery' && (
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Nome do cliente"
            value={detalhes.nome}
            onChange={(e) => onDetalhesChange({ ...detalhes, nome: e.target.value })}
          />

          <div className="relative flex items-center gap-2">
            <Input
              placeholder="CEP (00000-000)"
              value={endereco.cep}
              onChange={(e) => handleCep(e.target.value)}
              containerClassName="flex-1"
            />
            {endereco._loading && <Spinner size={18} />}
          </div>

          {endereco.logradouro && (
            <div
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-success-surface)',
                border: '1px solid var(--color-success-border)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-success)',
                lineHeight: 1.4,
              }}
            >
              {endereco.logradouro}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Nº"
              value={endereco.numero}
              onChange={(e) => onEnderecoChange({ ...endereco, numero: e.target.value })}
              containerClassName="w-24"
            />
            <Input
              placeholder="Complemento"
              value={endereco.complemento}
              onChange={(e) => onEnderecoChange({ ...endereco, complemento: e.target.value })}
              containerClassName="flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
