import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const G  = '#2E7D32';
const GD = '#1B5E20';
const D  = '#424242';
const M  = '#757575';
const B  = '#E0E0E0';

export function LegalPage({ title, lastUpdated, sections }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 50%, #F9FBE7 100%)' }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 16px 64px' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: G,
            textDecoration: 'none',
            marginBottom: 24,
          }}
        >
          ← Voltar ao login
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '32px 28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
          className="md:p-10"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 32,
              paddingBottom: 24,
              borderBottom: `1px solid ${B}`,
            }}
          >
            <img
              src="/logo.jpeg"
              alt="ServeFlow"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${G}`,
                flexShrink: 0,
              }}
            />
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: G, margin: 0, lineHeight: 1.2 }}>ServeFlow</p>
              <p style={{ fontSize: 11, color: M, margin: 0 }}>Sistema de Gestão para Restaurantes</p>
            </div>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: D, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {title}
          </h1>
          {lastUpdated && (
            <p style={{ fontSize: 12, color: M, marginBottom: 32 }}>Última atualização: {lastUpdated}</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {sections.map((section, i) => (
              <div key={i}>
                <h2
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: GD,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 8,
                  }}
                >
                  {section.heading}
                </h2>
                <p style={{ fontSize: 14, color: D, lineHeight: 1.8, margin: 0 }}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: `1px solid ${B}`,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 12, color: M, margin: 0 }}>
              Em caso de dúvidas, entre em contato com o administrador do sistema.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
