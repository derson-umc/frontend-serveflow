import { Field } from '@shared/components/ui/Field';
import { PlainInput } from '@shared/components/ui/PlainInput';
import { PaletteSelect } from '@shared/components/ui/PaletteSelect';
import { UNITS, CATEGORIES } from '../constants';

export function IngredientForm({ form, showQuantity = false }) {
  const { register, formState: { errors } } = form;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Nome" required error={errors.name?.message}>
        <PlainInput
          {...register('name')}
          placeholder="Ex: Farinha de trigo"
          hasError={!!errors.name}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Unidade" required error={errors.unit?.message}>
          <PaletteSelect {...register('unit')}>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </PaletteSelect>
        </Field>
        <Field label="Categoria" error={errors.category?.message}>
          <PaletteSelect {...register('category')}>
            <option value="">Sem categoria</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </PaletteSelect>
        </Field>
      </div>

      {showQuantity && (
        <Field label="Quantidade inicial" error={errors.currentQuantity?.message}>
          <PlainInput
            {...register('currentQuantity')}
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            hasError={!!errors.currentQuantity}
          />
        </Field>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Qtd. mínima" required error={errors.minimumQuantity?.message}>
          <PlainInput
            {...register('minimumQuantity')}
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            hasError={!!errors.minimumQuantity}
          />
        </Field>
        <Field label="Custo médio (R$)" error={errors.averageCost?.message}>
          <PlainInput
            {...register('averageCost')}
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            hasError={!!errors.averageCost}
          />
        </Field>
      </div>

      <Field label="Fornecedor" error={errors.supplier?.message}>
        <PlainInput
          {...register('supplier')}
          placeholder="Nome do fornecedor"
          hasError={!!errors.supplier}
        />
      </Field>
    </div>
  );
}
