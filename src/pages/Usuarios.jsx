import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../AuthContext";
import { SkeletonRow } from "../components/Skeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const ROLE_LABELS = {
  ADMIN: "Admin",
  GERENTE: "Gerente",
  CAIXA: "Caixa",
  GARCON: "Garçom",
  COZINHEIRO: "Cozinheiro",
  USER: "Usuário",
};

const ROLE_COLORS = {
  ADMIN:      { bg: "rgba(228,96,51,0.15)",  color: "#f07040", border: "rgba(228,96,51,0.3)" },
  GERENTE:    { bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.3)" },
  CAIXA:      { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  GARCON:     { bg: "rgba(52,211,153,0.1)",  color: "#4ade80", border: "rgba(52,211,153,0.25)" },
  COZINHEIRO: { bg: "rgba(251,191,36,0.1)",  color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  USER:       { bg: "rgba(255,255,255,0.05)", color: "#a8a29e", border: "rgba(255,255,255,0.1)" },
};

export default function Usuarios() {
  useDocumentTitle("Usuarios");
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modal, setModal] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const isGerente = currentUser?.role === "gerente";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.list();
      setUsers(data);
    } catch {
      setError("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const canEditUser = (u) => {
    if (isAdmin) return true;
    if (isGerente && u.role !== "ADMIN" && u.role !== "GERENTE") return true;
    return false;
  };

  const canDeleteUser = (u) => isAdmin && u.role !== "ADMIN";

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await userService.resetPassword(modal.id, newPassword);
      setSuccess(`Senha de "${modal.username}" redefinida com sucesso.`);
      setModal(null);
      setNewPassword("");
      setShowPassword(false);
    } catch (err) {
      setError(err?.response?.data?.error || "Erro ao redefinir senha.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Deseja excluir o usuário "${u.username}"?`)) return;
    try {
      await userService.remove(u.id);
      setSuccess(`Usuário "${u.username}" excluído.`);
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.error || "Erro ao excluir.");
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen" style={{ background: "#080503" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 60% at 65% 25%, #1a0a03 0%, #0d0603 40%, #080503 100%)" }} />
      <Sidebar />
      <div className="relative flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(180deg, #f07040, #e46033)" }} />
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#fff1f2" }}>Usuários</h1>
          </div>
          <p className="text-sm ml-4" style={{ color: "#7a3518" }}>
            Gerenciar usuários e redefinir senhas
          </p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg" style={{ background: "rgba(228,96,51,0.08)", border: "1px solid rgba(228,96,51,0.28)" }}>
            <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 px-3 py-2.5 rounded-lg" style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <p className="text-sm" style={{ color: "#4ade80" }}>{success}</p>
          </div>
        )}

        {loading ? (
          <SkeletonRow count={4} />
        ) : users.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(228,96,51,0.08)" }}>
            <p style={{ color: "#7a3518" }}>Nenhum usuário cadastrado.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => {
              const rc = ROLE_COLORS[u.role] || ROLE_COLORS.USER;
              return (
                <div
                  key={u.id}
                  className="sf-hover-lift flex items-center justify-between px-5 py-4 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(228,96,51,0.1)" }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                      style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}
                    >
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "#fff1f2" }}>{u.username}</p>
                      <p className="text-xs truncate" style={{ color: "#7a3518" }}>{u.jobposition || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}
                    >
                      {ROLE_LABELS[u.role] || u.role}
                    </span>

                    {canEditUser(u) && (
                      <button
                        onClick={() => { setModal(u); setNewPassword(""); setShowPassword(false); setError(""); setSuccess(""); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                        style={{ background: "rgba(228,96,51,0.1)", color: "#f07040", border: "1px solid rgba(228,96,51,0.2)" }}
                      >
                        Redefinir senha
                      </button>
                    )}

                    {canDeleteUser(u) && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                        style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl p-6" style={{ background: "rgba(10,2,4,0.97)", border: "1px solid rgba(228,96,51,0.25)" }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: "#fff1f2" }}>Redefinir senha</h2>
            <p className="text-sm mb-5" style={{ color: "#7a3518" }}>
              Usuário: <span style={{ color: "#f07040" }}>{modal.username}</span>
            </p>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(228,96,51,0.08)", border: "1px solid rgba(228,96,51,0.28)" }}>
                <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
              </div>
            )}

            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#7a3518" }}>Nova senha</label>
            <div className="relative mb-5">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 rounded-xl text-sm pr-10"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(228,96,51,0.18)", color: "#fff1f2" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#7a3518" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.5 10.5 0 0112 4c4.1 0 7.8 2.7 9.5 7-.4 1-1 1.9-1.7 2.7M6.2 6.2C4.4 7.4 3 9.5 2.5 12c1.7 4.3 5.4 7 9.5 7 1.6 0 3-.4 4.3-1.1" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12c1.7-4.3 5.4-7 9.5-7s7.8 2.7 9.5 7c-1.7 4.3-5.4 7-9.5 7s-7.8-2.7-9.5-7z" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setModal(null); setError(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.05)", color: "#7a3518", border: "1px solid rgba(228,96,51,0.12)" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                disabled={saving || newPassword.length < 8}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: newPassword.length >= 8 ? "linear-gradient(135deg, #e46033, #b84020)" : "rgba(228,96,51,0.15)",
                  color: "#fff",
                  opacity: newPassword.length >= 8 ? 1 : 0.5,
                  cursor: newPassword.length >= 8 ? "pointer" : "not-allowed",
                }}
              >
                {saving ? "Salvando..." : "Redefinir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
