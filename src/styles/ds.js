/* ServeFlow Design System — shared style tokens
 * Import this in any page/component:
 *   import { ds, dsInput, dsBtn, dsCard, dsLabel } from '../styles/ds';
 */

// ─── Palette ──────────────────────────────────────────────────────────────────
export const palette = {
  green:       '#2E7D32',
  greenDark:   '#1B5E20',
  greenLight:  '#43A047',
  greenSurface:'#E8F5E9',
  greenBorder: '#A5D6A7',

  orange:       '#F57C00',
  orangeSurface:'#FFF3E0',
  orangeBorder: '#FFCC80',

  red:          '#C62828',
  redSurface:   '#FFEBEE',
  redBorder:    '#EF9A9A',

  blue:         '#1565C0',
  blueSurface:  '#E3F2FD',
  blueBorder:   '#90CAF9',

  textPrimary:  '#212121',
  textSecondary:'#424242',
  textMuted:    '#757575',
  textDisabled: '#BDBDBD',

  border:       '#E0E0E0',
  borderFocus:  '#2E7D32',
  surface:      '#FAFAFA',
  background:   '#F5F5F5',
  white:        '#FFFFFF',
};

// ─── Spacing scale (multiples of 4px) ─────────────────────────────────────────
export const space = {
  1:  4,
  2:  8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const type = {
  pageTitle:   { fontSize: 22, fontWeight: 800, color: palette.textPrimary },
  sectionTitle:{ fontSize: 16, fontWeight: 700, color: palette.textSecondary },
  label:       { fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' },
  body:        { fontSize: 13, fontWeight: 400, color: palette.textSecondary },
  small:       { fontSize: 11, color: palette.textMuted },
  caption:     { fontSize: 10, color: palette.textMuted },
};

// ─── Shared component styles ──────────────────────────────────────────────────

/** Label for form fields */
export const dsLabel = {
  display: 'block',
  marginBottom: 6,
  ...type.label,
};

/** Standard text/number input */
export const dsInput = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 10,
  border: `1.5px solid ${palette.border}`,
  background: palette.surface,
  fontSize: 13,
  color: palette.textPrimary,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

export const dsInputFocus = { border: `1.5px solid ${palette.green}` };
export const dsInputError = { border: `1.5px solid ${palette.red}` };

/** Select element */
export const dsSelect = {
  ...dsInput,
  cursor: 'pointer',
};

/** Textarea */
export const dsTextarea = {
  ...dsInput,
  resize: 'vertical',
  lineHeight: 1.6,
  fontFamily: 'inherit',
};

/** Card container */
export const dsCard = {
  background: palette.white,
  borderRadius: 16,
  border: `1px solid ${palette.border}`,
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
};

/** Card header strip */
export const dsCardHeader = {
  padding: '14px 20px',
  borderBottom: `1px solid ${palette.border}`,
  background: palette.surface,
  borderRadius: '16px 16px 0 0',
};

/** Primary button */
export const dsBtnPrimary = {
  padding: '10px 20px',
  borderRadius: 10,
  border: 'none',
  background: palette.green,
  color: palette.white,
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(46,125,50,0.28)',
  transition: 'background 0.15s',
};

/** Ghost/secondary button */
export const dsBtnGhost = {
  padding: '10px 20px',
  borderRadius: 10,
  border: `1px solid ${palette.border}`,
  background: palette.surface,
  color: palette.textMuted,
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
};

/** Danger button */
export const dsBtnDanger = {
  ...dsBtnPrimary,
  background: palette.red,
  boxShadow: '0 4px 16px rgba(198,40,40,0.25)',
};

/** Badge variants */
export const dsBadge = {
  success: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: palette.greenSurface, color: palette.green, border: `1px solid ${palette.greenBorder}` },
  warning: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: palette.orangeSurface, color: palette.orange, border: `1px solid ${palette.orangeBorder}` },
  error:   { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: palette.redSurface, color: palette.red, border: `1px solid ${palette.redBorder}` },
};

/** Inline alert */
export const dsAlert = {
  error: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    padding: '10px 14px', borderRadius: 10,
    background: palette.redSurface, border: `1px solid ${palette.redBorder}`, color: palette.red,
    fontSize: 13,
  },
  success: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    padding: '10px 14px', borderRadius: 10,
    background: palette.greenSurface, border: `1px solid ${palette.greenBorder}`, color: palette.green,
    fontSize: 13,
  },
};

/** Page layout wrapper (inside Sidebar) */
export const dsPage = {
  flex: 1,
  padding: '24px 28px',
  maxWidth: 1200,
  margin: '0 auto',
  width: '100%',
};

/** Page header */
export const dsPageHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 4,
};

/** Accent bar for page title */
export const dsAccentBar = {
  width: 4,
  height: 28,
  borderRadius: 4,
  background: `linear-gradient(180deg, ${palette.orange}, ${palette.green})`,
  flexShrink: 0,
};

// ─── Form section wrapper ──────────────────────────────────────────────────────
export const dsFormSection = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

// ─── Form row (2-column grid) ──────────────────────────────────────────────────
export const dsFormRow = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
};

// ─── Form footer (action buttons row) ─────────────────────────────────────────
export const dsFormFooter = {
  display: 'flex',
  gap: 12,
  paddingTop: 8,
  borderTop: `1px solid ${palette.border}`,
  marginTop: 8,
};

// ─── Helper: merge styles ──────────────────────────────────────────────────────
export const ds = (...styles) => Object.assign({}, ...styles);

// ─── Focus handler for input/textarea ─────────────────────────────────────────
export const dsOnFocus = (e) => { e.target.style.border = `1.5px solid ${palette.green}`; };
export const dsOnBlur  = (e, hasError = false) => {
  e.target.style.border = `1.5px solid ${hasError ? palette.red : palette.border}`;
};
