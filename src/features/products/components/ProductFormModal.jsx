import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { palette } from '@styles/ds';
import { useProductImageUpload } from '../hooks/useProductImageUpload';
import { toTitleCase } from '../hooks/useProductCategories';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import { Spinner } from '@shared/components/feedback/Spinner';

const productSchema = z.object({
  name:                   z.string().min(2, 'Nome é obrigatório (mínimo 2 caracteres)'),
  brand:                  z.string().min(1, 'Marca é obrigatória'),
  portion:                z.string().min(1, 'Porção é obrigatória'),
  price:                  z.coerce.number({ invalid_type_error: 'Informe um preço válido' }).positive('Preço deve ser maior que zero'),
  description:            z.string().optional(),
  category:               z.string().min(1, 'Categoria é obrigatória'),
  requiresTechnicalSheet: z.boolean().optional(),
});

function Toggle({ active, activeColor = palette.green, inactiveColor = palette.border }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 40, height: 22 }}>
      <div className="absolute inset-0 rounded-full"
        style={{ background: active ? activeColor : inactiveColor, transition: 'background 0.2s' }} />
      <div className="absolute top-1 rounded-full"
        style={{ width: 14, height: 14, background: palette.white, left: active ? 22 : 4, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  );
}

function FieldError({ error }) {
  if (!error) return null;
  return <p className="text-xs mt-1" style={{ color: '#EF5350' }}>{error.message}</p>;
}

function FormInput({ registration, error, ...props }) {
  return (
    <input
      {...registration}
      {...props}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
      style={{ background: '#FAFAFA', border: `1.5px solid ${error ? '#EF5350' : palette.border}`, color: palette.textSecondary, transition: 'border-color 0.15s' }}
      onFocus={(e) => (e.target.style.border = `1.5px solid ${error ? '#EF5350' : palette.green}`)}
      onBlur={(e) => (e.target.style.border = `1.5px solid ${error ? '#EF5350' : palette.border}`)}
    />
  );
}

export function ProductFormModal({ product, allCategories, onClose }) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const imageUpload = useProductImageUpload(product?.imageUrl ?? null);

  const [isActive, setIsActive] = useState(isEditing ? product.active !== false : true);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name:                   product?.name ?? '',
      brand:                  product?.brand ?? '',
      portion:                product?.portion ?? '',
      price:                  product?.price ?? '',
      description:            product?.description ?? '',
      category:               toTitleCase(product?.category ?? 'Pratos Principais'),
      requiresTechnicalSheet: product?.requiresTechnicalSheet ?? false,
    },
  });

  async function onSave(formData) {
    if (imageUpload.uploading) {
      setServerError('Aguarde o envio da imagem terminar.');
      return;
    }
    setServerError('');

    const payload = {
      name:                   formData.name.trim(),
      description:            formData.description?.trim() || null,
      category:               formData.category.trim(),
      brand:                  formData.brand.trim(),
      price:                  formData.price,
      portion:                formData.portion.trim(),
      imageUrl:               imageUpload.uploadedUrl ?? null,
      requiresTechnicalSheet: formData.requiresTechnicalSheet ?? false,
      active:                 isActive,
    };

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, data: payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setServerError(err?.response?.data?.error ?? err?.response?.data?.message ?? 'Erro ao salvar produto.');
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await imageUpload.handleFile(file);
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <motion.div
        className="rounded-2xl w-full overflow-hidden"
        style={{
          background: palette.white,
          border: `1px solid ${palette.border}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
          maxWidth: 520,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 12 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${palette.border}` }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${palette.green}, ${palette.greenDark})`, borderRadius: '8px 8px 0 0' }} />
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-xl"
                style={{ width: 36, height: 36, background: palette.greenSurface, flexShrink: 0 }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={palette.green} strokeWidth={2}>
                  {isEditing
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />}
                </svg>
              </div>
              <div>
                <h2 className="font-bold" style={{ color: palette.textSecondary, fontSize: 15, lineHeight: 1.2 }}>
                  {isEditing ? 'Atualizar Produto' : 'Cadastrar Produto'}
                </h2>
                <p style={{ fontSize: 11, color: palette.textMuted, marginTop: 1 }}>
                  {isEditing ? 'Edite os dados do produto abaixo' : 'Preencha os dados do novo produto'}
                </p>
              </div>
            </div>
            <button
              onClick={() => !isSubmitting && onClose()}
              className="flex items-center justify-center rounded-xl"
              style={{ width: 30, height: 30, background: '#F5F5F5', border: 'none', color: palette.textMuted, cursor: 'pointer', fontSize: 13 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#EEEEEE')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#F5F5F5')}
            >✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1" style={{ padding: '20px 24px' }}>

          {/* Image picker */}
          <div className="flex items-start gap-4 mb-5 pb-5" style={{ borderBottom: `1px solid #F5F5F5` }}>
            <div
              className="relative cursor-pointer group flex-shrink-0"
              style={{ width: 88, height: 88 }}
              onClick={() => !imageUpload.uploading && imageUpload.fileRef.current?.click()}
            >
              <div
                className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: palette.greenSurface,
                  border: `2px dashed ${imageUpload.preview ? palette.green : palette.greenBorder}`,
                  transition: 'border-color 0.2s',
                }}
              >
                {imageUpload.preview
                  ? <img src={imageUpload.preview} alt="" className="w-full h-full object-cover" />
                  : <span style={{ fontSize: 32, opacity: 0.4 }}>🍽️</span>}
              </div>
              <div
                className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.35)' }}
              >
                {imageUpload.uploading
                  ? <Spinner size={20} color={palette.white} />
                  : <span className="text-white" style={{ fontSize: 18 }}>📷</span>}
              </div>
              <input ref={imageUpload.fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="flex-1 flex flex-col justify-center gap-1" style={{ paddingTop: 8 }}>
              <p className="font-semibold text-xs" style={{ color: palette.textSecondary }}>Foto do Produto</p>
              <p className="text-xs" style={{ color: palette.textMuted, lineHeight: 1.5 }}>
                {imageUpload.uploading ? 'Enviando imagem...' : 'Clique para selecionar uma foto. Máx. 8 MB.'}
              </p>
              {imageUpload.uploadedUrl && (
                <span className="text-xs font-semibold" style={{ color: palette.green }}>✓ Foto salva no servidor</span>
              )}
              {imageUpload.preview && !imageUpload.uploading && (
                <button type="button" onClick={imageUpload.clear}
                  className="text-xs font-semibold w-fit"
                  style={{ color: palette.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Remover imagem
                </button>
              )}
            </div>
          </div>

          {imageUpload.offline && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs mb-4"
              style={{ background: palette.orangeSurface, border: `1px solid ${palette.orangeBorder}`, color: palette.orange }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {imageUpload.uploadError}
            </div>
          )}
          {serverError && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs mb-4"
              style={{ background: palette.redSurface, border: `1px solid ${palette.redBorder}`, color: palette.red }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSave)} noValidate id="product-form">

            {/* Identificação */}
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: palette.green, letterSpacing: '0.1em' }}>Identificação</p>

            <div style={{ marginBottom: 16 }}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: palette.textSecondary }}>Nome *</label>
              <FormInput registration={register('name')} error={errors.name} placeholder="Ex: X-Burguer Artesanal" />
              <FieldError error={errors.name} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: palette.textSecondary }}>Descrição</label>
              <textarea
                {...register('description')}
                rows={2}
                placeholder="Ex: Blend bovino, cheddar e bacon crocante"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ background: '#FAFAFA', border: `1.5px solid ${palette.border}`, color: palette.textSecondary }}
                onFocus={(e) => (e.target.style.border = `1.5px solid ${palette.green}`)}
                onBlur={(e) => (e.target.style.border = `1.5px solid ${palette.border}`)}
              />
            </div>

            {/* Detalhes */}
            <div style={{ borderTop: `1px solid #F5F5F5`, paddingTop: 16, marginBottom: 16 }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: palette.green, letterSpacing: '0.1em' }}>Detalhes</p>
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: palette.textSecondary }}>Marca *</label>
                  <FormInput registration={register('brand')} error={errors.brand} placeholder="Ex: Casa do Chef" />
                  <FieldError error={errors.brand} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: palette.textSecondary }}>Porção *</label>
                  <FormInput registration={register('portion')} error={errors.portion} placeholder="Ex: 350ml" />
                  <FieldError error={errors.portion} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: palette.textSecondary }}>Preço *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: palette.textMuted }}>R$</span>
                  <input
                    {...register('price')}
                    type="number" step="0.01" min="0.01" placeholder="0,00"
                    className="w-full py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: '#FAFAFA', border: `1.5px solid ${errors.price ? '#EF5350' : palette.border}`, color: palette.textSecondary, paddingLeft: 36 }}
                    onFocus={(e) => (e.target.style.border = `1.5px solid ${errors.price ? '#EF5350' : palette.green}`)}
                    onBlur={(e) => (e.target.style.border = `1.5px solid ${errors.price ? '#EF5350' : palette.border}`)}
                  />
                </div>
                <FieldError error={errors.price} />
              </div>
            </div>

            {/* Categoria */}
            <div style={{ borderTop: `1px solid #F5F5F5`, paddingTop: 16, marginBottom: 16 }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: palette.green, letterSpacing: '0.1em' }}>Categoria *</p>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1.5">
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => field.onChange(cat)}
                        className="py-1.5 px-3 text-xs font-semibold rounded-xl transition-all"
                        style={{
                          background: field.value === cat ? palette.greenSurface : '#FAFAFA',
                          color: field.value === cat ? palette.green : palette.textMuted,
                          border: `1.5px solid ${field.value === cat ? palette.green : palette.border}`,
                          boxShadow: field.value === cat ? '0 2px 8px rgba(46,125,50,0.15)' : 'none',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              />
              <FieldError error={errors.category} />
            </div>

            {/* Opções */}
            <div style={{ borderTop: `1px solid #F5F5F5`, paddingTop: 16 }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: palette.green, letterSpacing: '0.1em' }}>Opções</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                <Controller
                  name="requiresTechnicalSheet"
                  control={control}
                  render={({ field }) => (
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer select-none"
                      style={{
                        background: field.value ? palette.greenSurface : '#FAFAFA',
                        border: `1.5px solid ${field.value ? palette.greenBorder : palette.border}`,
                      }}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <div>
                        <p className="text-xs font-semibold" style={{ color: field.value ? palette.green : palette.textSecondary }}>Exige Ficha Técnica</p>
                        <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>Requer ficha técnica com ingredientes</p>
                      </div>
                      <Toggle active={field.value} />
                    </div>
                  )}
                />

                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer select-none"
                  style={{
                    background: isActive ? palette.greenSurface : palette.redSurface,
                    border: `1.5px solid ${isActive ? palette.greenBorder : '#EF9A9A'}`,
                  }}
                  onClick={() => setIsActive((v) => !v)}
                >
                  <div>
                    <p className="text-xs font-semibold" style={{ color: isActive ? palette.green : palette.red }}>Status</p>
                    <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>
                      {isActive ? 'Produto visível no cardápio' : 'Produto oculto do cardápio'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color: isActive ? palette.green : palette.red }}>
                      {isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <Toggle active={isActive} activeColor={palette.green} inactiveColor="#EF9A9A" />
                  </div>
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4" style={{ borderTop: `1px solid ${palette.border}`, background: '#FAFAFA' }}>
          <button
            type="button"
            onClick={() => !isSubmitting && onClose()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: palette.white, color: palette.textMuted, border: `1.5px solid ${palette.border}`, cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = palette.white)}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{
              background: isSubmitting ? palette.greenBorder : palette.green,
              color: palette.white,
              border: 'none',
              boxShadow: isSubmitting ? 'none' : '0 4px 14px rgba(46,125,50,0.35)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = palette.greenDark; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = isSubmitting ? palette.greenBorder : palette.green; }}
          >
            {isSubmitting
              ? <><Spinner size={15} color={palette.white} /> Salvando...</>
              : isEditing ? 'Atualizar Produto' : 'Cadastrar Produto'}
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}
