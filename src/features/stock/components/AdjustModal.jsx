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
import { ADJUST_SUGGESTIONS, PU } from '../constants';
import { palette, dsFormFooter } from '@styles/ds';

const schema = z.object({
  newQuantity: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }).min(0, 'Deve ser >= 0'),
  notes:       z.string().min(1, 'Informe o motivo do ajuste'),
});

export function AdjustModal({ item, onClose, onSuccess }) {
  const adjust = useMutation({ mutationFn: (data) => stockApi.items.adjust(item.id, data) });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newQuantity: item.currentQuantity ?? '', notes: '' },
  });

  const notes = watch('notes') ?? '';

  const onSubmit = async (data) => {
    try {
      await adjust.mutateAsync({ newQuantity: Number(data.newQuantity), notes: data.notes });
      toast.success('Ajuste de estoque registrado.');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erro ao ajustar estoque.');
    }
  };

  return (
    <MotionModal onClose={onClose}>
      <ModalHeader
        title="Ajuste de Estoque"
        subtitle={item.name}
        accentColor={PU}
        onClose={onClose}
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
          <div style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: palette.blueSurface,
            border: `1px solid ${palette.blueBorder}`,
            fontSize: 13,
            color: palette.blue,
          }}>
            Estoque atual: <strong>{item.currentQuantity} {item.unit}</strong>
          </div>

          <Field label="Nova quantidade" required error={errors.newQuantity?.message}>
            <PlainInput
              {...register('newQuantity')}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              hasError={!!errors.newQuantity}
            />
          </Field>

          <Field label="Motivo do ajuste" required error={errors.notes?.message}>
            <PlainInput
              {...register('notes')}
              placeholder="Descreva o motivo do ajuste"
              hasError={!!errors.notes}
            />
          </Field>

          <SuggestionChips
            chips={ADJUST_SUGGESTIONS}
            onSelect={(v) => setValue('notes', v, { shouldValidate: true })}
            active={notes}
          />

          <div style={dsFormFooter}>
            <Btn type="button" variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn type="submit" style={{ background: PU }} disabled={adjust.isPending}>
              {adjust.isPending ? 'Salvando...' : 'Confirmar Ajuste'}
            </Btn>
          </div>
      </form>
    </MotionModal>
  );
}
