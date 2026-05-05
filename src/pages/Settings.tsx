import { Save, Bell, Shield, Globe, DollarSign, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useState } from 'react';
import { useGymData } from '../hooks/useGymData';

/* ══════════════════════════════════════════
   SECCIONES DEL NAV LATERAL
══════════════════════════════════════════ */
const sections = [
  { id: 'general',      icon: Globe,      title: 'General',         description: 'Nombre y zona horaria' },
  { id: 'security',     icon: Shield,     title: 'Seguridad',       description: 'Biometría y control de acceso' },
  { id: 'notifications',icon: Bell,       title: 'Notificaciones',  description: 'Email y Push' },
  { id: 'pricing',      icon: DollarSign, title: 'Precios y Planes', description: 'Membresías y accesos' },
];

/* ══════════════════════════════════════════
   TIPO Y DATOS POR DEFECTO DE PLANES
══════════════════════════════════════════ */
interface CustomPlan {
  id: string;
  label: string;
  price: number;
  desc: string;
  color: string;
  duration: 'dia' | 'semana' | 'mes';
}

const PLAN_COLORS = ['#00FF88', '#FF6B35', '#A78BFA', '#00E5FF', '#FFD600', '#FF4FA3', '#8A948A'];

const DEFAULT_PLANS: CustomPlan[] = [
  { id: 'dia',        label: 'Día',       price: 5000,   desc: 'Acceso por un día',                  color: '#FFD600', duration: 'dia'    },
  { id: 'semana',     label: 'Semanal',   price: 25000,  desc: 'Acceso por 7 días',                  color: '#00E5FF', duration: 'semana' },
  { id: 'mes_basico', label: 'Básico',    price: 45000,  desc: 'Acceso gimnasio · L-V · Sin clases', color: '#8A948A', duration: 'mes'    },
  { id: 'mes_pro',    label: 'Pro',       price: 75000,  desc: 'Acceso completo · Clases incluidas', color: '#00FF88', duration: 'mes'    },
  { id: 'mes_hyrox',  label: 'HYROX Pro', price: 120000, desc: 'Elite · HYROX · Trainer asignado',   color: '#FF6B35', duration: 'mes'    },
];

function loadCustomPlans(): CustomPlan[] {
  try {
    const raw = localStorage.getItem('fuxion_custom_plans');
    return raw ? JSON.parse(raw) : DEFAULT_PLANS;
  } catch {
    return DEFAULT_PLANS;
  }
}

/* ══════════════════════════════════════════
   MODAL CREAR / EDITAR PLAN
══════════════════════════════════════════ */
function PlanModal({
  initial, onSave, onClose,
}: {
  initial: CustomPlan | null;
  onSave: (p: CustomPlan) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CustomPlan>(
    initial ?? { id: 'plan_' + Date.now(), label: '', price: 0, desc: '', color: '#00FF88', duration: 'mes' }
  );

  const set = (k: keyof CustomPlan, v: any) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.label.trim().length > 0 && form.price > 0;

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
    color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)',
  };
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6,
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: 440, borderRadius: 'var(--radius-2xl)', background: 'var(--space-dark)', border: 'var(--glass-border)', boxShadow: 'var(--shadow-elevated)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{initial ? '✏️ Editar Plan' : '➕ Nuevo Plan'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Nombre del Plan *</label>
            <input style={inp} placeholder="Ej: Trimestral Elite" value={form.label} onChange={e => set('label', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Precio (COP) *</label>
            <input style={inp} type="number" placeholder="75000" value={form.price || ''} onChange={e => set('price', Number(e.target.value))} />
          </div>
          <div>
            <label style={lbl}>Descripción</label>
            <input style={inp} placeholder="Ej: Acceso completo · Clases incluidas" value={form.desc} onChange={e => set('desc', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Duración</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.duration} onChange={e => set('duration', e.target.value)}>
                <option value="dia">Por día</option>
                <option value="semana">Semanal</option>
                <option value="mes">Mensual</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Color</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
                {PLAN_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => set('color', c)}
                    style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: form.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: form.color === c ? `0 0 10px ${c}` : 'none', transition: 'all .15s' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview en tiempo real */}
          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-lg)', background: `${form.color}12`, border: `1px solid ${form.color}35`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: form.color }}>{form.label || 'Nombre del plan'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{form.desc || 'Descripción del plan'}</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: 20, color: form.color }}>${(form.price || 0).toLocaleString('es-CO')}</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            onClick={() => valid && onSave(form)}
            disabled={!valid}
            style={{ padding: '9px 24px', borderRadius: 'var(--radius-md)', background: valid ? 'linear-gradient(135deg,#00CC6A,#00FF88)' : 'rgba(255,255,255,.08)', border: 'none', color: valid ? '#000' : 'var(--text-muted)', fontSize: 13, fontWeight: 800, cursor: valid ? 'pointer' : 'not-allowed', boxShadow: valid ? '0 0 16px rgba(0,255,136,0.4)' : 'none' }}
          >
            {initial ? '💾 Guardar Cambios' : '✅ Crear Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   COMPONENTE TOGGLE (reutilizable)
══════════════════════════════════════════ */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{ width: 48, height: 26, borderRadius: 13, padding: 3, background: on ? 'var(--electric-cyan)' : 'var(--space-lighter)', transition: 'background 0.2s', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start', border: 'none' }}
    >
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL — SETTINGS
══════════════════════════════════════════ */
export default function Settings() {
  const [activeTab, setActiveTab]         = useState('general');
  const [gymName, setGymName]             = useState('GymFuxionFit Montería');
  const [timezone, setTimezone]           = useState('America/Bogota');
  const [faceAuth, setFaceAuth]           = useState(true);
  const [antiTailgating, setAntiTailgating] = useState(true);
  const [emailNotif, setEmailNotif]       = useState(true);
  const [pushNotif, setPushNotif]         = useState(true);

  const { updatePlansConfig } = useGymData();

  // ── Planes dinámicos ──
  const [plans, setPlans]             = useState<CustomPlan[]>(loadCustomPlans);
  const [editingPlan, setEditingPlan] = useState<CustomPlan | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [deleteId, setDeleteId]       = useState<string | null>(null);

  const persistPlans = (next: CustomPlan[]) => {
    setPlans(next);
    localStorage.setItem('fuxion_custom_plans', JSON.stringify(next));
    // Compatibilidad con Members y Reception (leen plansConfig por clave)
    const cfg: Record<string, number> = {};
    next.forEach(p => { cfg[p.id] = p.price; });
    updatePlansConfig(cfg);
  };

  const handleSavePlan = (plan: CustomPlan) => {
    const exists = plans.some(p => p.id === plan.id);
    persistPlans(exists ? plans.map(p => p.id === plan.id ? plan : p) : [...plans, plan]);
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleDelete = (id: string) => {
    persistPlans(plans.filter(p => p.id !== id));
    setDeleteId(null);
  };

  const handleSave = () => {
    persistPlans(plans);
    alert('✅ Configuración guardada exitosamente');
  };

  return (
    <div>
      {/* ── Encabezado ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Configuración</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>Administración del sistema GymFuxionFit</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Guardar Cambios</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>

        {/* ── Nav lateral ── */}
        <div className="glass-card" style={{ padding: 12, height: 'fit-content' }}>
          {sections.map(sec => (
            <button
              key={sec.id}
              className={`sidebar-item ${activeTab === sec.id ? 'active' : ''}`}
              style={{ width: '100%', background: activeTab === sec.id ? 'rgba(0,255,136,0.1)' : 'transparent', color: activeTab === sec.id ? 'var(--neon-green)' : 'var(--text-muted)' }}
              onClick={() => setActiveTab(sec.id)}
            >
              <sec.icon size={18} />
              <span>{sec.title}</span>
            </button>
          ))}
        </div>

        {/* ── Contenido ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="glass-card">
              <div className="glass-card-header">
                <div className="glass-card-title"><Globe size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />General</div>
                <div className="glass-card-subtitle">Configuración básica del gimnasio</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Nombre del Gimnasio</label>
                  <input className="input-field" value={gymName} onChange={e => setGymName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Zona Horaria</label>
                  <input className="input-field" value={timezone} onChange={e => setTimezone(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* SEGURIDAD */}
          {activeTab === 'security' && (
            <div className="glass-card">
              <div className="glass-card-header">
                <div className="glass-card-title"><Shield size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Seguridad</div>
                <div className="glass-card-subtitle">Control de acceso biométrico</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Reconocimiento Facial', sub: 'Login biométrico para acceso al gym', on: faceAuth, toggle: () => setFaceAuth(v => !v) },
                  { label: 'Anti-Tailgating', sub: 'Detección de accesos no autorizados', on: antiTailgating, toggle: () => setAntiTailgating(v => !v) },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(0,240,255,0.06)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.label}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{item.sub}</div>
                    </div>
                    <Toggle on={item.on} onToggle={item.toggle} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICACIONES */}
          {activeTab === 'notifications' && (
            <div className="glass-card">
              <div className="glass-card-header">
                <div className="glass-card-title"><Bell size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Notificaciones</div>
                <div className="glass-card-subtitle">Canales de comunicación</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Email', sub: 'Reportes diarios y alertas del sistema', on: emailNotif, toggle: () => setEmailNotif(v => !v) },
                  { label: 'Push Notifications', sub: 'Alertas en tiempo real al móvil', on: pushNotif, toggle: () => setPushNotif(v => !v) },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(0,240,255,0.06)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.label}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{item.sub}</div>
                    </div>
                    <Toggle on={item.on} onToggle={item.toggle} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRECIOS Y PLANES ─── GESTIÓN DINÁMICA */}
          {activeTab === 'pricing' && (
            <div className="glass-card">
              {/* Header con botón "+ Nuevo Plan" */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div className="glass-card-title">
                    <DollarSign size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--neon-green)' }} />
                    Precios y Planes
                  </div>
                  <div className="glass-card-subtitle">{plans.length} planes configurados · Edita, elimina o agrega nuevos</div>
                </div>
                <button
                  onClick={() => { setEditingPlan(null); setShowModal(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: 'var(--neon-green)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
                >
                  <Plus size={14} /> Nuevo Plan
                </button>
              </div>

              {/* Lista de planes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: `1px solid ${plan.color}22`, transition: 'border-color .2s' }}
                  >
                    {/* Info del plan */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color, boxShadow: `0 0 8px ${plan.color}70`, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{plan.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{plan.desc}</div>
                      </div>
                    </div>

                    {/* Precio + acciones */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: 17, color: plan.color }}>${plan.price.toLocaleString('es-CO')}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {plan.duration === 'dia' ? 'Por día' : plan.duration === 'semana' ? 'Por semana' : 'Mensual'}
                        </div>
                      </div>

                      {/* Botón editar */}
                      <button
                        onClick={() => { setEditingPlan(plan); setShowModal(true); }}
                        title="Editar plan"
                        style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-green)' }}
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Botón eliminar — confirmación doble */}
                      {deleteId === plan.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            title="Confirmar eliminación"
                            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,61,87,0.18)', border: '1px solid rgba(255,61,87,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-red)' }}
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            title="Cancelar"
                            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(plan.id)}
                          title="Eliminar plan"
                          style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,61,87,0.05)', border: '1px solid rgba(255,61,87,0.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-red)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {plans.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    No hay planes configurados. ¡Agrega el primero con el botón de arriba!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear/editar plan */}
      {showModal && (
        <PlanModal
          initial={editingPlan}
          onSave={handleSavePlan}
          onClose={() => { setShowModal(false); setEditingPlan(null); }}
        />
      )}
    </div>
  );
}
