import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { palette } from '@styles/ds';
import { productsApi } from '@core/api/products';
import { imageStore, fileToBase64 } from '@features/products/services/imageStore';
import { useUpdateProduct } from '../hooks/useProducts';
import { toTitleCase } from '../hooks/useProductCategories';
import { Spinner } from '@shared/components/feedback/Spinner';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProductCard({ product, imageUrl, onEdit, onDelete }) {
  const fileRef = useRef(null);
  const [localImage, setLocalImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const updateProduct = useUpdateProduct();

  const isActive = product.active !== false;
  const displayImage = localImage ?? imageUrl;

  async function handleImageFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await productsApi.uploadImage(formData);
      const url = typeof result === 'string' ? result : result?.url ?? null;
      if (url) {
        await updateProduct.mutateAsync({
          id: product.id,
          data: {
            name: product.name,
            brand: product.brand,
            portion: product.portion,
            price: product.price,
            description: product.description,
            category: product.category,
            requiresTechnicalSheet: product.requiresTechnicalSheet,
            active: product.active,
            imageUrl: url,
          },
        });
        setLocalImage(url);
      }
    } catch {
      const base64 = await fileToBase64(file).catch(() => null);
      if (base64) {
        await imageStore.save(product.id, base64).catch(() => {});
        setLocalImage(base64);
      }
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(0,0,0,0.11)' }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: palette.white,
        border: `1px solid ${isActive ? palette.border : '#FFCDD2'}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        opacity: isActive ? 1 : 0.85,
      }}
    >
      {/* Barra de status no topo */}
      <div style={{ height: 3, background: isActive ? palette.green : '#EF5350', borderRadius: '8px 8px 0 0' }} />

      {/* Imagem */}
      <div
        className="relative w-full group cursor-pointer"
        style={{ height: 130, background: isActive ? palette.greenSurface : '#FFF3F3', flexShrink: 0 }}
        onClick={() => !uploadingImage && fileRef.current?.click()}
      >
        {displayImage ? (
          <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke={isActive ? palette.greenBorder : '#EF9A9A'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 010 8h-1" />
              <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? palette.greenBorder : '#EF9A9A', letterSpacing: '0.03em' }}>
              Sem imagem
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.36)', backdropFilter: 'blur(2px)' }}>
          {uploadingImage
            ? <Spinner size={20} color={palette.white} />
            : <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="text-white font-semibold" style={{ fontSize: 10 }}>
                  {displayImage ? 'Trocar foto' : 'Adicionar foto'}
                </span>
              </>}
        </div>

        {/* Badge de status sobre a imagem */}
        <div className="absolute top-2 right-2">
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            padding: '2px 7px', borderRadius: 20,
            background: isActive ? palette.green : '#EF5350',
            color: palette.white,
          }}>
            {isActive ? 'ATIVO' : 'INATIVO'}
          </span>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col" style={{ padding: '10px 12px 0' }}>
        {/* Categoria */}
        <div className="flex flex-wrap gap-1 mb-1.5">
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
            padding: '2px 7px', borderRadius: 20,
            background: palette.orangeSurface, color: palette.orange,
          }}>
            {toTitleCase(product.category)}
          </span>
          {product.requiresTechnicalSheet && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
              padding: '2px 7px', borderRadius: 20,
              background: palette.greenSurface, color: palette.green,
            }}>
              Ficha Técnica
            </span>
          )}
        </div>

        {/* Nome */}
        <p style={{ fontSize: 13, fontWeight: 800, color: palette.textSecondary, lineHeight: 1.3, marginBottom: 2 }}>
          {product.name}
        </p>

        {/* Marca · Porção */}
        {(product.brand || product.portion) && (
          <p style={{ fontSize: 10, color: palette.textMuted, marginBottom: 3 }}>
            {[product.brand, product.portion].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Descrição */}
        {product.description && (
          <p style={{
            fontSize: 10, color: '#9E9E9E', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            marginTop: 'auto', paddingTop: 4,
          }}>
            {product.description}
          </p>
        )}
      </div>

      {/* Rodapé: preço + ações */}
      <div style={{ padding: '10px 12px', marginTop: 8, borderTop: '1px solid #F0F0F0' }}>
        <div className="flex items-center justify-between">
          <p style={{ fontSize: 16, fontWeight: 900, color: palette.green, letterSpacing: '-0.01em' }}>
            {formatCurrency(product.price)}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onEdit}
              title="Editar produto"
              className="flex items-center justify-center rounded-lg"
              style={{ width: 34, height: 34, background: palette.blueSurface, border: 'none', color: palette.blue, cursor: 'pointer', flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#BBDEFB')}
              onMouseLeave={(e) => (e.currentTarget.style.background = palette.blueSurface)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            <button
              onClick={onDelete}
              title="Excluir produto"
              className="flex items-center justify-center rounded-lg"
              style={{ width: 34, height: 34, background: palette.redSurface, border: 'none', color: palette.red, cursor: 'pointer', flexShrink: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FFCDD2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = palette.redSurface)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
