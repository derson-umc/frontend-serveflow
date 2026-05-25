import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@features/auth/services/authApi';
import { G } from '../constants';

const TOTAL_STEPS  = 4;
const STEP_LABELS  = ['Identificação', 'Confirmar E-mail', 'Verificação', 'Nova Senha'];

const inputStyle = {
  width:        '100%',
  padding:      '10px 12px',
  borderRadius: 10,
  border:       '1.5px solid #E0E0E0',
  background:   '#FAFAFA',
  fontSize:     13,
  color:        '#212121',
  outline:      'none',
  boxSizing:    'border-box',
};

const btnPrimary = (disabled) => ({
  width:        '100%',
  padding:      '11px',
  borderRadius: 10,
  border:       'none',
  fontWeight:   700,
  fontSize:     14,
  cursor:       disabled ? 'not-allowed' : 'pointer',
  background:   disabled ? '#A5D6A7' : G,
  color:        '#fff',
});

export function ForgotPasswordModal({ onClose }) {
  const [step,             setStep]            = useState(1);
  const [identifier,       setIdentifier]       = useState('');
  const [resolvedUsername, setResolvedUsername] = useState('');
  const [maskedEmail,      setMaskedEmail]      = useState(null);
  const [channel,          setChannel]          = useState('');
  const [code,             setCode]             = useState(['', '', '', '', '', '']);
  const [newPwd,           setNewPwd]           = useState('');
  const [confPwd,          setConfPwd]          = useState('');
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState('');
  const [success,          setSuccess]          = useState(false);
  const inputRefs = useRef([]);

  const fullCode    = code.join('');
  const displayStep = success ? TOTAL_STEPS : step;

  const handleCodeInput = (idx, val) => {
    const digit = val.replace(/\D/, '').slice(-1);
    const next  = [...code];
    next[idx]   = digit;
    setCode(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleCodeKey = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleCodePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) { setCode(paste.split('')); inputRefs.current[5]?.focus(); }
    e.preventDefault();
  };

  const handleStep1 = async () => {
    if (!identifier.trim()) { setError('Informe seu nome de usuário.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await authApi.identify(identifier.trim());
      if (!res?.username) { setError('Usuário não encontrado. Verifique e tente novamente.'); return; }
      setResolvedUsername(res.username);
      setMaskedEmail(res.maskedEmail ?? null);
      setChannel(res.maskedEmail ? 'email' : '');
      setStep(2);
    } catch {
      setError('Erro ao verificar usuário. Tente novamente.');
    } finally { setLoading(false); }
  };

  const handleStep2 = async () => {
    if (!channel) { setError('Selecione um canal de envio.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.forgotPassword(resolvedUsername);
      setStep(3);
    } catch {
      setError('Não foi possível enviar o código. Tente novamente.');
    } finally { setLoading(false); }
  };

  const handleStep3 = async () => {
    if (fullCode.length < 6) { setError('Digite os 6 dígitos do código.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.verifyResetToken(resolvedUsername, fullCode);
      setStep(4);
    } catch {
      setError('Código inválido ou expirado. Solicite um novo.');
    } finally { setLoading(false); }
  };

  const handleStep4 = async () => {
    if (newPwd.length < 8)  { setError('A senha deve ter ao menos 8 caracteres.'); return; }
    if (newPwd !== confPwd) { setError('As senhas não coincidem.'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword(resolvedUsername, fullCode, newPwd);
      setSuccess(true);
    } catch {
      setError('Erro ao redefinir senha. O código pode ter expirado.');
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', boxShadow: '0 16px 48px rgba(0,0,0,0.18)', maxWidth: 420 }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#424242', margin: 0 }}>Redefinir Senha</h3>
            {!success && (
              <p style={{ fontSize: 11, color: '#757575', margin: '2px 0 0' }}>
                Passo {step} de {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
              </p>
            )}
          </div>
          <button
            onClick={() => !loading && onClose()}
            style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F5F5', border: 'none', color: '#757575', cursor: 'pointer', fontSize: 13 }}
          >
            x
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '12px 20px 0' }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 4, background: (i + 1) <= displayStep ? G : '#E0E0E0', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={G} strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#424242', marginBottom: 6 }}>Senha redefinida!</p>
                <p style={{ fontSize: 13, color: '#757575', marginBottom: 20 }}>Você já pode fazer login com a nova senha.</p>
                <button onClick={onClose} style={btnPrimary(false)}>Ir para o Login</button>
              </motion.div>

            ) : step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                <p style={{ fontSize: 13, color: '#757575', marginBottom: 16 }}>
                  Informe seu nome de usuário para iniciar a recuperação de senha.
                </p>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#757575', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Usuário
                </label>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleStep1()}
                  placeholder="Digite seu nome de usuário"
                  style={{ ...inputStyle, marginBottom: 12 }}
                  onFocus={(e) => (e.target.style.border = `1.5px solid ${G}`)}
                  onBlur={(e)  => (e.target.style.border = '1.5px solid #E0E0E0')}
                  autoFocus
                />
                {error && <p style={{ fontSize: 12, color: '#C62828', marginBottom: 10 }}>{error}</p>}
                <button onClick={handleStep1} disabled={loading} style={btnPrimary(loading)}>
                  {loading ? 'Verificando...' : 'Continuar'}
                </button>
              </motion.div>

            ) : step === 2 ? (
              <motion.div key="step2" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                <p style={{ fontSize: 13, color: '#757575', marginBottom: 16 }}>
                  Conta encontrada: <strong style={{ color: '#424242' }}>{resolvedUsername}</strong>.
                  Confirme o e-mail para receber o código de verificação.
                </p>
                {maskedEmail ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ padding: '12px 14px', borderRadius: 12, border: `2px solid ${G}`, background: '#E8F5E9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: G, margin: 0 }}>E-mail</p>
                          <p style={{ fontSize: 11, color: '#757575', margin: '2px 0 0' }}>{maskedEmail}</p>
                        </div>
                        <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={G} strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderRadius: 12, padding: '12px 16px', marginBottom: 16, background: '#FFF3E0', border: '1px solid #FFB74D', color: '#E65100', fontSize: 13 }}>
                    Nenhum e-mail cadastrado para esta conta. Solicite ao administrador que cadastre um e-mail.
                  </div>
                )}
                {error && <p style={{ fontSize: 12, color: '#C62828', marginBottom: 10 }}>{error}</p>}
                <button onClick={handleStep2} disabled={loading || !channel} style={btnPrimary(loading || !channel)}>
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
                <button
                  onClick={() => { setStep(1); setError(''); }}
                  style={{ width: '100%', padding: '9px', borderRadius: 10, background: 'none', color: '#757575', border: 'none', fontSize: 13, cursor: 'pointer', marginTop: 8 }}
                >
                  Voltar
                </button>
              </motion.div>

            ) : step === 3 ? (
              <motion.div key="step3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                <p style={{ fontSize: 13, color: '#757575', marginBottom: 16 }}>
                  Código enviado para{' '}
                  <strong style={{ color: '#424242' }}>{maskedEmail}</strong>{' '}
                  via e-mail. Válido por 15 minutos.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }} onPaste={handleCodePaste}>
                  {code.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      value={d}
                      maxLength={1}
                      inputMode="numeric"
                      onChange={(e) => handleCodeInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKey(i, e)}
                      style={{
                        width:       44,
                        height:      52,
                        borderRadius: 10,
                        textAlign:   'center',
                        fontSize:    20,
                        fontWeight:  700,
                        color:       '#212121',
                        border:      `2px solid ${d ? G : '#E0E0E0'}`,
                        background:  d ? '#E8F5E9' : '#FAFAFA',
                        outline:     'none',
                        transition:  'border-color 0.15s, background 0.15s',
                      }}
                      onFocus={(e) => (e.target.style.border = `2px solid ${G}`)}
                    />
                  ))}
                </div>
                {error && <p style={{ fontSize: 12, color: '#C62828', marginBottom: 10, textAlign: 'center' }}>{error}</p>}
                <button onClick={handleStep3} disabled={loading || fullCode.length < 6} style={btnPrimary(loading || fullCode.length < 6)}>
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </button>
                <button
                  onClick={() => { setStep(2); setCode(['', '', '', '', '', '']); setError(''); }}
                  style={{ width: '100%', padding: '9px', borderRadius: 10, background: 'none', color: '#757575', border: 'none', fontSize: 13, cursor: 'pointer', marginTop: 8 }}
                >
                  Reenviar código
                </button>
              </motion.div>

            ) : (
              <motion.div key="step4" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
                <p style={{ fontSize: 13, color: '#757575', marginBottom: 16 }}>
                  Código verificado. Crie uma nova senha para <strong style={{ color: '#424242' }}>{resolvedUsername}</strong>.
                </p>
                {[
                  { label: 'Nova Senha',      val: newPwd,  set: setNewPwd,  ph: 'Mínimo 8 caracteres' },
                  { label: 'Confirmar Senha', val: confPwd, set: setConfPwd, ph: 'Repita a nova senha'  },
                ].map(({ label, val, set, ph }) => (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#757575', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
                    <input
                      type="password"
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={ph}
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.border = `1.5px solid ${G}`)}
                      onBlur={(e)  => (e.target.style.border = '1.5px solid #E0E0E0')}
                    />
                  </div>
                ))}
                {newPwd && confPwd && (
                  <p style={{ fontSize: 11, color: newPwd === confPwd ? G : '#C62828', marginBottom: 8, fontWeight: 600 }}>
                    {newPwd === confPwd ? 'Senhas coincidem' : 'Senhas não coincidem'}
                  </p>
                )}
                {error && <p style={{ fontSize: 12, color: '#C62828', marginBottom: 10 }}>{error}</p>}
                <button onClick={handleStep4} disabled={loading} style={btnPrimary(loading)}>
                  {loading ? 'Salvando...' : 'Redefinir Senha'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
