import { useState, useRef } from 'react';
import { palette } from '@styles/ds';

const UNITS = ['UN', 'kg', 'g', 'L', 'ml', 'cx', 'pct', 'dz'];
const PREP_MAX = 600;

const PRODUCT_TYPES = [
  {
    value:  'FABRICATED',
    label:  'Fabricado',
    desc:   'Múltiplos ingredientes, modo de preparo',
    color:  palette.green,
    bg:     palette.greenSurface,
    border: palette.greenBorder,
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    value:  'COMMERCIAL',
    label:  'Comercial',
    desc:   'Produto pronto, consumido direto do estoque',
    color:  palette.orange,
    bg:     palette.orangeSurface,
    border: palette.orangeBorder,
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
];

const sectionLabel = {
  fontSize: 11,
  fontWeight: 700,
  color: palette.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

const fieldBase = {
  width:        '100%',
  padding:      '9px 10px',
  borderRadius: 8,
  border:       `1.5px solid ${palette.border}`,
  background:   palette.white,
  fontSize:     13,
  color:        palette.textPrimary,
  outline:      'none',
  boxSizing:    'border-box',
  transition:   'border-color 0.15s',
};

function DragHandle() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill={palette.textMuted}>
      <circle cx="3.5" cy="3"  r="1.4" />
      <circle cx="8.5" cy="3"  r="1.4" />
      <circle cx="3.5" cy="8"  r="1.4" />
      <circle cx="8.5" cy="8"  r="1.4" />
      <circle cx="3.5" cy="13" r="1.4" />
      <circle cx="8.5" cy="13" r="1.4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IngredientSearch({ value, stockItems, onChange }) {
  const selected  = stockItems.find((s) => s.id === value);
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const inputRef = useRef(null);

  const filtered = stockItems.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    (s.category ?? '').toLowerCase().includes(query.toLowerCase())
  );

  const handleFocus = () => { setQuery(''); setOpen(true); };
  const handleBlur  = () => { setTimeout(() => setOpen(false), 160); };
  const handleSelect = (item) => { onChange(item.id); setQuery(''); setOpen(false); };
  const handleClear  = (e) => {
    e.preventDefault();
    onChange('');
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          6,
          padding:      '9px 10px',
          borderRadius: 8,
          border:       `1.5px solid ${open ? palette.green : selected ? palette.greenBorder : palette.border}`,
          background:   palette.white,
          boxSizing:    'border-box',
          width:        '100%',
          cursor:       'text',
          transition:   'border-color 0.15s',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <span style={{ color: open ? palette.green : palette.textMuted, display: 'flex', flexShrink: 0 }}>
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={open ? query : (selected ? `${selected.name} (${selected.unit})` : '')}
          onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Buscar insumo..."
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: palette.textPrimary, width: '100%', minWidth: 0, fontWeight: selected && !open ? 500 : 400 }}
        />
        {selected && !open && (
          <button onMouseDown={handleClear} title="Remover seleção" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: palette.textMuted, display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}>
            <ClearIcon />
          </button>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: palette.white, border: `1.5px solid ${palette.green}`, borderRadius: 10,
          maxHeight: 220, overflowY: 'auto', boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: 12, color: palette.textMuted, textAlign: 'center' }}>
              Nenhum insumo encontrado
            </div>
          ) : (
            filtered.map((s) => {
              const active = s.id === value;
              return (
                <div key={s.id} onMouseDown={() => handleSelect(s)}
                  style={{ padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: active ? palette.green : palette.textPrimary, background: active ? palette.greenSurface : 'transparent', fontWeight: active ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, transition: 'background 0.1s', borderBottom: '1px solid #F5F5F5' }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#F5F5F5'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: active ? palette.green : palette.textMuted, background: active ? palette.greenSurface : '#F0F0F0', border: active ? `1px solid ${palette.greenBorder}` : '1px solid transparent', borderRadius: 6, padding: '2px 7px', flexShrink: 0 }}>
                    {s.unit}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function IngredientEditor({
  ingredients,
  stockItems,
  productType,
  isCommercial,
  onIngredientChange,
  onAddIngredient,
  onRemoveIngredient,
  onReorder,
  onProductTypeChange,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOver,  setDragOver]  = useState(null);

  const handleDragStart = (idx) => setDragIndex(idx);
  const handleDragOver  = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const handleDrop      = (idx) => {
    if (dragIndex !== null && dragIndex !== idx) onReorder(dragIndex, idx);
    setDragIndex(null);
    setDragOver(null);
  };
  const handleDragEnd   = () => { setDragIndex(null); setDragOver(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Tipo de produto ──────────────────────────────────────── */}
      <div style={{ background: palette.white, borderRadius: 14, border: `1px solid ${palette.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '18px 20px' }}>
        <p style={{ ...sectionLabel, marginBottom: 12 }}>Tipo de produto</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {PRODUCT_TYPES.map(({ value, label, desc, color, bg, border, icon }) => {
            const active = productType === value;
            return (
              <button key={value} onClick={() => onProductTypeChange(value)} style={{ padding: '14px 16px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${active ? border : palette.border}`, background: active ? bg : '#FAFAFA', textAlign: 'left', transition: 'all 0.15s', outline: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ color: active ? color : palette.textMuted, display: 'flex' }}>{icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: active ? color : palette.textPrimary }}>{label}</span>
                </div>
                <div style={{ fontSize: 11, color: palette.textMuted, lineHeight: 1.4, paddingLeft: 24 }}>{desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ingredientes ─────────────────────────────────────────── */}
      <div style={{ background: palette.white, borderRadius: 14, border: `1px solid ${palette.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '18px 20px' }}>
        <p style={{ ...sectionLabel, marginBottom: 14 }}>
          {isCommercial ? 'Insumo de estoque' : 'Ingredientes'}
        </p>

        {/* Header das colunas */}
        <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 90px 74px 36px', gap: 8, marginBottom: 6, paddingLeft: 4, paddingRight: 2 }}>
          {['', 'Insumo', 'Quantidade', 'Unidade', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Linhas de ingrediente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ingredients.map((ing, idx) => {
            const isEven   = idx % 2 === 0;
            const isDragging = dragIndex === idx;
            const isOver     = dragOver === idx && dragIndex !== idx;
            const filled     = !!ing.stockItemId;

            return (
              <div
                key={idx}
                draggable={!isCommercial}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
                style={{
                  display:             'grid',
                  gridTemplateColumns: '24px 1fr 90px 74px 36px',
                  gap:                 8,
                  alignItems:          'center',
                  padding:             '12px 10px 12px 8px',
                  borderRadius:        10,
                  border:              isOver
                    ? `2px dashed ${palette.green}`
                    : `1.5px solid ${filled ? palette.greenBorder : palette.border}`,
                  background: isDragging
                    ? '#E8F5E9'
                    : isOver
                    ? palette.greenSurface
                    : filled
                    ? palette.greenSurface
                    : isEven
                    ? '#FAFAFA'
                    : palette.white,
                  opacity:    isDragging ? 0.5 : 1,
                  transition: 'border-color 0.15s, background 0.15s, opacity 0.15s',
                }}
              >
                {/* Alça drag */}
                {!isCommercial ? (
                  <div
                    title="Arraste para reordenar"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', opacity: 0.45, flexShrink: 0, userSelect: 'none' }}
                  >
                    <DragHandle />
                  </div>
                ) : <span />}

                {/* Busca de insumo */}
                <IngredientSearch
                  value={ing.stockItemId}
                  stockItems={stockItems}
                  onChange={(id) => onIngredientChange(idx, 'stockItemId', id)}
                />

                {/* Quantidade */}
                <input
                  type="number"
                  value={ing.quantityPerUnit}
                  onChange={(e) => onIngredientChange(idx, 'quantityPerUnit', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.001"
                  style={fieldBase}
                  onFocus={(e) => (e.target.style.borderColor = palette.green)}
                  onBlur={(e)  => (e.target.style.borderColor = palette.border)}
                />

                {/* Unidade */}
                <select
                  value={ing.unit}
                  onChange={(e) => onIngredientChange(idx, 'unit', e.target.value)}
                  style={fieldBase}
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>

                {/* Remover */}
                {!isCommercial ? (
                  <button
                    onClick={() => onRemoveIngredient(idx)}
                    disabled={ingredients.length === 1}
                    title="Remover ingrediente"
                    style={{
                      width:          36,
                      height:         36,
                      borderRadius:   8,
                      border:         `1.5px solid ${ingredients.length === 1 ? palette.border : palette.redBorder}`,
                      background:     ingredients.length === 1 ? '#F5F5F5' : palette.redSurface,
                      color:          ingredients.length === 1 ? palette.textMuted : palette.red,
                      cursor:         ingredients.length === 1 ? 'not-allowed' : 'pointer',
                      opacity:        ingredients.length === 1 ? 0.35 : 1,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      transition:     'all 0.15s',
                      flexShrink:     0,
                    }}
                    onMouseEnter={(e) => { if (ingredients.length > 1) { e.currentTarget.style.background = '#FFCDD2'; e.currentTarget.style.borderColor = palette.red; } }}
                    onMouseLeave={(e) => { if (ingredients.length > 1) { e.currentTarget.style.background = palette.redSurface; e.currentTarget.style.borderColor = palette.redBorder; } }}
                  >
                    <TrashIcon />
                  </button>
                ) : <span />}

                {/* Validade (COMMERCIAL) */}
                {isCommercial && ing.validity !== undefined && (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${palette.border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: palette.textMuted }}>Validade</span>
                    <input
                      type="date"
                      value={ing.validity}
                      onChange={(e) => onIngredientChange(idx, 'validity', e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 6, border: `1.5px solid ${ing.validity ? palette.border : palette.redBorder}`, background: ing.validity ? palette.white : palette.redSurface, fontSize: 12, color: palette.textPrimary, outline: 'none' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Adicionar ingrediente */}
        {!isCommercial && (
          <button
            onClick={onAddIngredient}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', marginTop: 10, padding: '11px 0', borderRadius: 10,
              border: `1.5px dashed ${palette.greenBorder}`, background: 'transparent',
              color: palette.green, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = palette.greenSurface)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <PlusIcon /> Adicionar ingrediente
          </button>
        )}
      </div>

    </div>
  );
}
