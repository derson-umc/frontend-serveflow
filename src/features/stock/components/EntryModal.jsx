import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { stockApi } from '@core/api/stock';
import { toast } from '@shared/components/feedback/Toast';
import { MotionModal } from '@shared/components/ui/MotionModal';
import { ModalHeader } from '@shared/components/ui/ModalHeader';
import { Field } from '@shared/components/ui/Field';
import { PlainInput } from '@shared/components/ui/PlainInput';
import { SuggestionChips } from '@shared/components/ui/SuggestionChips';
import { Btn } from '@shared/components/ui/Btn';
import { ENTRY_SUGGESTIONS } from '../constants';
import { palette, dsFormFooter } from '@styles/ds';

const schema = z.object({
  quantity: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }).min(0.01, 'Deve ser > 0'),
  notes:    z.string().optional(),
});

export function EntryModal({ item, onClose, onSuccess }) {
  const entry = useMutation({ mutationFn: (data) => stockApi.items.entry(item.id, data) });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { quantity: '', notes: '' },
  });

  const notes = watch('notes') ?? '';

  const onSubmit = async (data) => {
    try {
      await entry.mutateAsync({
        quantity: Number(data.quantity),
        reason:   data.notes || null,
      });
      toast.success(`Entrada de ${data.quantity} ${item.unit} registrada.`);
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? err?.response?.data?.message ?? 'Erro ao registrar entrada.');
    }
  };

  return (
    <MotionModal onClose={onClose}>
      <ModalHeader
        title="Registrar Entrada"
        subtitle={item.name}
        accentColor={palette.green}
        onClose={onClose}
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
          <Field label="Quantidade" required error={errors.quantity?.message}>
            <PlainInput
              {...register('quantity')}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0"
              hasError={!!errors.quantity}
            />
          </Field>

          <Field label="Observação" error={errors.notes?.message}>
            <PlainInput {...register('notes')} placeholder="Motivo ou observação" />
          </Field>

          <SuggestionChips
            chips={ENTRY_SUGGESTIONS}
            onSelect={(v) => setValue('notes', v, { shouldValidate: true })}
            active={notes}
          />

          <div style={{
            background: '#FFF8E1',
            border: '1px solid #FFD54F',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12,
            color: '#7B5800',
            lineHeight: 1.5,
          }}>
            Lembre-se de lançar esta compra no módulo <strong>Financeiro → Contas a Pagar</strong>.
          </div>

          <div style={dsFormFooter}>
            <Btn type="button" variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn type="submit" variant="primary" disabled={entry.isPending}>
              {entry.isPending ? 'Salvando...' : 'Confirmar Entrada'}
            </Btn>
          </div>
      </form>
    </MotionModal>
  );
}
