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
import { LOSS_SUGGESTIONS } from '../constants';
import { palette, dsFormFooter } from '@styles/ds';

const schema = z.object({
  quantity: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }).min(0.01, 'Deve ser > 0'),
  notes:    z.string().min(1, 'Informe o motivo da perda'),
});

export function LossModal({ item, onClose, onSuccess }) {
  const loss = useMutation({ mutationFn: (data) => stockApi.items.loss(item.id, data) });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { quantity: '', notes: '' },
  });

  const notes = watch('notes') ?? '';

  const onSubmit = async (data) => {
    try {
      await loss.mutateAsync({ quantity: Number(data.quantity), notes: data.notes });
      toast.success(`Perda de ${data.quantity} ${item.unit} registrada.`);
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao registrar perda.');
    }
  };

  return (
    <MotionModal onClose={onClose}>
      <ModalHeader
        title="Registrar Perda"
        subtitle={item.name}
        accentColor={palette.orange}
        onClose={onClose}
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
          <Field label="Quantidade perdida" required error={errors.quantity?.message}>
            <PlainInput
              {...register('quantity')}
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0"
              hasError={!!errors.quantity}
            />
          </Field>

          <Field label="Motivo" required error={errors.notes?.message}>
            <PlainInput
              {...register('notes')}
              placeholder="Descreva o motivo da perda"
              hasError={!!errors.notes}
            />
          </Field>

          <SuggestionChips
            chips={LOSS_SUGGESTIONS}
            onSelect={(v) => setValue('notes', v, { shouldValidate: true })}
            active={notes}
          />

          <div style={dsFormFooter}>
            <Btn type="button" variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn type="submit" variant="danger" disabled={loss.isPending}>
              {loss.isPending ? 'Salvando...' : 'Confirmar Perda'}
            </Btn>
          </div>
      </form>
    </MotionModal>
  );
}
