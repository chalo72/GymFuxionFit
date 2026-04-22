import { useState, useMemo } from 'react';
import {
  Search, Plus, Filter, Edit2, Trash2, Eye,
  UserCheck, UserX, RefreshCw, Phone, Mail,
  Calendar, CreditCard, Dumbbell, X, Check,
  ChevronDown, AlertTriangle, Shield,
} from 'lucide-react';

/* ══════════════════════════════════════════
   TIPOS
══════════════════════════════════════════ */
type PlanId  = 'basic' | 'pro' | 'hyrox';
type Status  = 'active' | 'expiring' | 'expired' | 'suspended';
type PayMethod = 'efectivo' | 'tarjeta' | 'nequi' | 'transferencia';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: PlanId;
  status: Status;
  joined: string;
  expiry: string;
  nextPayment: string;
  payMethod: PayMethod;
  trainer: string;
  emergency: string;
  emergencyPhone: string;
  address: string;
  notes: string;
  visits: number;
  lastVisit: string;
  color: string;
  objective?: string;
  injuries?: string;
  nutrition?: string;
  emergencyContact?: string;
}

/* ══════════════════════════════════════════
   DATOS INICIALES
══════════════════════════════════════════ */
const COLORS = ['#00FF88','#FF6B35','#A78BFA','#00E5FF','#FFD600','#FF4FA3','#4CAF50','#2196F3'];

const PLANS: Record<PlanId, { label: string; price: number; color: string; desc: string }> = {
  basic: { label: 'Básico',    price: 45000,  color: '#8A948A', desc: 'Acceso gimnasio · L-V · Sin clases' },
  pro:   { label: 'Pro',       price: 75000,  color: '#00FF88', desc: 'Acceso completo · Clases incluidas' },
  hyrox: { label: 'HYROX Pro', price: 120000, color: '#FF6B35', desc: 'Elite · HYROX · Trainer asignado' },
};

const TRAINERS = ['Sin entrenador','Coach Alex','Coach María','Coach Andrés','Coach Sofia'];

const initialClients: Client[] = [
  { id:1, name:'Alex Guerrero',     email:'alex@email.com',      phone:'310-555-0101', plan:'hyrox', status:'active',   joined:'2026-01-15', expiry:'2026-05-15', nextPayment:'2026-05-15', payMethod:'nequi',        trainer:'Coach Alex',  emergency:'Carmen G.',  emergencyPhone:'310-555-0200', address:'Cra 5 #12-30', notes:'Atleta HYROX competitivo', visits:47, lastVisit:'Hoy',      color:'#FF6B35', objective: 'musculación', injuries: 'Ninguna', nutrition: 'Dieta hiperproteica', emergencyContact: 'Esposa: 300 000 1111' },
  { id:2, name:'Valentina Torres',  email:'vale@email.com',      phone:'311-555-0202', plan:'hyrox', status:'active',   joined:'2025-12-12', expiry:'2026-05-01', nextPayment:'2026-05-01', payMethod:'tarjeta',      trainer:'Coach Alex',  emergency:'Luis T.',    emergencyPhone:'311-555-0203', address:'Cl 8 #4-22',   notes:'',                          visits:38, lastVisit:'Ayer',     color:'#A78BFA', objective: 'rebajar', injuries: 'Escurrimiento rodilla izq', emergencyContact: 'Mamá: 311 222 3333' },
  { id:3, name:'María López',       email:'maria@email.com',     phone:'312-555-0303', plan:'pro',   status:'expiring', joined:'2026-03-01', expiry:'2026-04-20', nextPayment:'2026-04-20', payMethod:'efectivo',     trainer:'Coach María', emergency:'Pedro L.',   emergencyPhone:'312-555-0304', address:'Av 3 #10-15',  notes:'Avisarle 5 días antes',    visits:22, lastVisit:'Hoy',      color:'#00FF88', objective: 'mantenimiento', injuries: 'Lumbalgia crónica' },
  { id:4, name:'Carlos Rivas',      email:'carlos@email.com',    phone:'313-555-0404', plan:'basic', status:'expired',  joined:'2025-11-08', expiry:'2026-04-10', nextPayment:'Vencida',    payMethod:'efectivo',     trainer:'',            emergency:'Ana R.',     emergencyPhone:'313-555-0405', address:'Cl 15 #2-8',   notes:'Debe renovar',              visits:15, lastVisit:'Hoy',      color:'#FFD600', objective: 'musculación' },
];

const emptyForm = (): Omit<Client,'id'|'visits'|'lastVisit'|'color'> => ({
  name:'', email:'', phone:'', plan:'pro', status:'active',
  joined: new Date().toISOString().slice(0,10),
  expiry: '',
  nextPayment:'',
  payMethod:'nequi',
  trainer: 'Sin entrenador',
  emergency:'', emergencyPhone:'', address:'', notes:'',
  objective: '', injuries: '', nutrition: '', emergencyContact: ''
});

/* ══════════════════════════════════════════
   BADGES
══════════════════════════════════════════ */
const STATUS_CFG: Record<Status,{label:string;color:string;bg:string}> = {
  active:    { label:'Activo',      color:'var(--neon-green)',  bg:'rgba(0,255,136,.1)'  },
  expiring:  { label:'Por vencer',  color:'#FFD600',            bg:'rgba(255,214,0,.1)'  },
  expired:   { label:'Vencida',     color:'var(--danger-red)',  bg:'rgba(255,61,87,.1)'  },
  suspended: { label:'Suspendido',  color:'var(--text-muted)',  bg:'rgba(100,100,100,.1)'},
};

function StatusBadge({ s }: { s: Status }) {
  const c = STATUS_CFG[s];
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, color:c.color, background:c.bg, border:`1px solid ${c.color}40` }}>
      {c.label}
    </span>
  );
}

function PlanBadge({ p }: { p: PlanId }) {
  const c = PLANS[p];
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, color:c.color, background:`${c.color}15`, border:`1px solid ${c.color}30` }}>
      {c.label}
    </span>
  );
}

/* ══════════════════════════════════════════
   MODAL AGREGAR / EDITAR CLIENTE
══════════════════════════════════════════ */
function ClientModal({
  initial, onSave, onClose,
}: {
  initial: Partial<Client> | null;
  onSave: (data: Omit<Client,'id'|'visits'|'lastVisit'|'color'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Client,'id'|'visits'|'lastVisit'|'color'>>(
    initial ? { 
      name:initial.name??'', email:initial.email??'', phone:initial.phone??'', plan:initial.plan??'pro', 
      status:initial.status??'active', joined:initial.joined??'', expiry:initial.expiry??'', 
      nextPayment:initial.nextPayment??'', payMethod:initial.payMethod??'nequi', trainer:initial.trainer??'Sin entrenador', 
      emergency:initial.emergency??'', emergencyPhone:initial.emergencyPhone??'', address:initial.address??'', 
      notes:initial.notes??'', objective:initial.objective??'', injuries:initial.injuries??'', 
      nutrition:initial.nutrition??'', emergencyContact:initial.emergencyContact??'' 
    }
    : emptyForm()
  );
  const [tab, setTab] = useState<'info'|'plan'|'técnica'>('info');
  const isEdit = !!initial?.id;

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Auto-calcular expiración al cambiar plan y fecha de inicio
  const handlePlanChange = (p: PlanId) => {
    set('plan', p);
    if (form.joined) {
      const d = new Date(form.joined);
      d.setMonth(d.getMonth() + 1);
      set('expiry', d.toISOString().slice(0,10));
      set('nextPayment', d.toISOString().slice(0,10));
    }
  };

  const handleJoinedChange = (v: string) => {
    set('joined', v);
    if (v) {
      const d = new Date(v);
      d.setMonth(d.getMonth() + 1);
      set('expiry', d.toISOString().slice(0,10));
      set('nextPayment', d.toISOString().slice(0,10));
    }
  };

  const valid = form.name.trim().length > 2 && form.phone.trim().length > 5;

  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'10px 14px', borderRadius:'var(--radius-md)',
    background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.12)',
    color:'var(--text-primary)', fontSize:13, outline:'none',
    fontFamily:'var(--font)',
  };
  const labelStyle: React.CSSProperties = {
    fontSize:11, fontWeight:700, color:'var(--text-muted)',
    textTransform:'uppercase', letterSpacing:1, marginBottom:5, display:'block',
  };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.75)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000, backdropFilter:'blur(8px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width:600, maxHeight:'90vh', borderRadius:'var(--radius-2xl)',
        background:'var(--space-dark)', border:'var(--glass-border)',
        boxShadow:'var(--shadow-elevated)', display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:'var(--text-primary)' }}>
              {isEdit ? '✏️  Editar Cliente' : '➕  Nuevo Cliente'}
            </div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
              {isEdit ? `Editando: ${initial?.name}` : 'Completa los datos del nuevo miembro'}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}>
            <X size={20}/>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, padding:'12px 24px 0', borderBottom:'1px solid rgba(255,255,255,.06)', flexShrink:0 }}>
          {([['info','Personal'],['plan','Plan & Pago'],['técnica','Ficha Técnica']] as const).map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding:'8px 16px', borderRadius:'var(--radius-md) var(--radius-md) 0 0',
              background: tab===id ? 'rgba(0,255,136,.1)' : 'transparent',
              border: tab===id ? '1px solid rgba(0,255,136,.25)' : '1px solid transparent',
              borderBottom:'none',
              color: tab===id ? 'var(--neon-green)' : 'var(--text-muted)',
              fontSize:12.5, fontWeight:tab===id?700:500, cursor:'pointer',
            }}>{label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>

          {/* ── TAB: DATOS ── */}
          {tab === 'info' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={labelStyle}>Nombre completo *</label>
                  <input style={inputStyle} placeholder="Ej: Juan Pérez García" value={form.name} onChange={e => set('name',e.target.value)}/>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" placeholder="correo@email.com" value={form.email} onChange={e => set('email',e.target.value)}/>
                </div>
                <div>
                  <label style={labelStyle}>Teléfono *</label>
                  <input style={inputStyle} placeholder="310-000-0000" value={form.phone} onChange={e => set('phone',e.target.value)}/>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={labelStyle}>Dirección</label>
                  <input style={inputStyle} placeholder="Cra 5 #12-30, Ciénaga de Oro" value={form.address} onChange={e => set('address',e.target.value)}/>
                </div>
              </div>
              <div style={{ padding:14, borderRadius:'var(--radius-lg)', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>Contacto de Emergencia</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div>
                    <label style={labelStyle}>Nombre</label>
                    <input style={inputStyle} placeholder="Nombre familiar" value={form.emergency} onChange={e => set('emergency',e.target.value)}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input style={inputStyle} placeholder="310-000-0001" value={form.emergencyPhone} onChange={e => set('emergencyPhone',e.target.value)}/>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: PLAN ── */}
          {tab === 'plan' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Plan selector */}
              <div>
                <label style={labelStyle}>Plan de Membresía *</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([id, p]) => (
                    <div key={id} onClick={() => handlePlanChange(id)} style={{
                      padding:'14px 12px', borderRadius:'var(--radius-lg)', cursor:'pointer',
                      background: form.plan===id ? `${p.color}15` : 'rgba(255,255,255,.03)',
                      border: `1px solid ${form.plan===id ? p.color+'60' : 'rgba(255,255,255,.08)'}`,
                      transition:'all .15s',
                    }}>
                      <div style={{ fontSize:15, fontWeight:800, color: form.plan===id ? p.color : 'var(--text-primary)', marginBottom:4 }}>{p.label}</div>
                      <div style={{ fontSize:16, fontWeight:900, color: form.plan===id ? p.color : 'var(--text-secondary)' }}>
                        ${p.price.toLocaleString('es-CO')}
                      </div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4, lineHeight:1.4 }}>{p.desc}</div>
                      {form.plan===id && <Check size={14} color={p.color} style={{ marginTop:6 }}/>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={labelStyle}>Fecha de Inicio *</label>
                  <input style={inputStyle} type="date" value={form.joined} onChange={e => handleJoinedChange(e.target.value)}/>
                </div>
                <div>
                  <label style={labelStyle}>Vencimiento (auto)</label>
                  <input style={inputStyle} type="date" value={form.expiry} onChange={e => set('expiry',e.target.value)}/>
                </div>
                <div>
                  <label style={labelStyle}>Método de Pago</label>
                  <select style={{ ...inputStyle, cursor:'pointer' }} value={form.payMethod} onChange={e => set('payMethod', e.target.value as PayMethod)}>
                    <option value="nequi">Nequi</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Entrenador Asignado</label>
                  <select style={{ ...inputStyle, cursor:'pointer' }} value={form.trainer} onChange={e => set('trainer',e.target.value)}>
                    {TRAINERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <select style={{ ...inputStyle, cursor:'pointer' }} value={form.status} onChange={e => set('status', e.target.value as Status)}>
                    <option value="active">Activo</option>
                    <option value="expiring">Por vencer</option>
                    <option value="expired">Vencida</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: FICHA TÉCNICA ── */}
          {tab === 'técnica' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={labelStyle}>Objetivo Principal</label>
                <select style={inputStyle} value={form.objective} onChange={e => set('objective', e.target.value)}>
                   <option value="">-- Seleccionar --</option>
                   <option value="musculación">Musculación</option>
                   <option value="rebajar">Rebajar / Adelgazar</option>
                   <option value="recuperación">Recuperación Lesión</option>
                   <option value="definición">Definición</option>
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                 <div>
                   <label style={labelStyle}>Lesiones / Limitaciones</label>
                   <textarea style={{ ...inputStyle, height:80 }} placeholder="Ej: Lesión manguito rotador izq" value={form.injuries} onChange={e => set('injuries', e.target.value)}/>
                 </div>
                 <div>
                   <label style={labelStyle}>Guía Nutricional</label>
                   <textarea style={{ ...inputStyle, height:80 }} placeholder="Ej: Dieta baja en carbos" value={form.nutrition} onChange={e => set('nutrition', e.target.value)}/>
                 </div>
              </div>
              <div>
                 <label style={labelStyle}>Contacto Emergencia Técnico</label>
                 <input style={inputStyle} placeholder="Nombre y Celular" value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)}/>
              </div>
              <div>
                <label style={labelStyle}>Notas internas</label>
                <textarea
                  style={{ ...inputStyle, minHeight:60, resize:'vertical' }}
                  placeholder="Otras observaciones..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid rgba(255,255,255,.08)', display:'flex', gap:10, justifyContent:'flex-end', flexShrink:0 }}>
          <button onClick={onClose} style={{
            padding:'10px 22px', borderRadius:'var(--radius-lg)',
            background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)',
            color:'var(--text-secondary)', fontSize:13, fontWeight:600, cursor:'pointer',
          }}>Cancelar</button>
          <button onClick={() => valid && onSave(form)} disabled={!valid} style={{
            padding:'10px 28px', borderRadius:'var(--radius-lg)',
            background: valid ? 'linear-gradient(135deg,#00CC6A,var(--neon-green))' : 'rgba(255,255,255,.08)',
            border:'none', color: valid ? '#000' : 'var(--text-muted)',
            fontSize:13, fontWeight:800, cursor: valid ? 'pointer' : 'not-allowed',
            boxShadow: valid ? 'var(--glow-green)' : 'none',
          }}>
            {isEdit ? '💾  Guardar Cambios' : '✅  Registrar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PANEL DETALLE CLIENTE
══════════════════════════════════════════ */
function DetailPanel({ client, onClose, onEdit, onDelete }: {
  client: Client; onClose: () => void;
  onEdit: () => void; onDelete: () => void;
}) {
  const status = STATUS_CFG[client.status];
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.85)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:2000, backdropFilter:'blur(12px)', padding: 20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card" style={{
        maxWidth:550, width: '100%', borderRadius:'var(--radius-2xl)',
        background:'var(--space-dark)', border:'1px solid var(--green-20)',
        boxShadow:'var(--shadow-elevated)', overflow:'hidden', position: 'relative'
      }}>
        {/* Banner Salud */}
        <div style={{ height: 60, background: client.injuries && client.injuries !== 'Ninguna' && client.injuries !== '' ? 'rgba(255,61,87,0.1)' : 'rgba(0,255,136,0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ fontSize: 10, fontWeight: 950, color: client.injuries && client.injuries !== 'Ninguna' && client.injuries !== '' ? 'var(--danger-red)' : 'var(--neon-green)', letterSpacing: 2 }}>
             EXPEDIENTE TÉCNICO GYMFUXION — ESTADO: {client.injuries && client.injuries !== 'Ninguna' && client.injuries !== '' ? 'BAJO OBSERVACIÓN' : 'ÓPTIMO'}
           </div>
        </div>

        {/* Action Buttons Floating */}
        <div style={{ position: 'absolute', top: 80, right: 24, display: 'flex', gap: 10 }}>
           <button onClick={onEdit} style={{ background: 'var(--green-10)', color: 'var(--neon-green)', padding: '10px 14px', borderRadius: 12, border: 'none', cursor:'pointer' }}><Edit2 size={16}/></button>
           <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '10px 14px', borderRadius: 12, border: 'none', cursor:'pointer' }}><X size={16}/></button>
        </div>

        <div style={{ padding: 30 }}>
           {/* Perfil Header */}
           <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 35 }}>
              <div style={{ width: 100, height: 100, borderRadius: 28, background: 'var(--green-10)', border: '2px solid var(--neon-green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 36, fontWeight:950, color:'var(--neon-green)' }}>
                {client.name.charAt(0)}
              </div>
              <div>
                 <h2 style={{ fontSize: 32, fontWeight:950, color:'#fff', marginBottom: 6 }}>{client.name}</h2>
                 <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <StatusBadge s={client.status}/>
                    <div style={{ color:'var(--text-muted)', fontSize: 13, fontWeight: 800 }}>ID: #{client.id.toString().slice(-4)}</div>
                 </div>
              </div>
           </div>

           {/* Metrics Grid */}
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginBottom: 30 }}>
              <div style={{ background:'rgba(255,255,255,0.02)', padding: 15, borderRadius: 20, textAlign:'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom: 4, letterSpacing: 1 }}>OBJETIVO</div>
                 <div style={{ fontSize: 11, fontWeight: 900, color:'var(--neon-green)', textTransform:'uppercase' }}>{client.objective || 'Pendiente'}</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.02)', padding: 15, borderRadius: 20, textAlign:'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom: 4, letterSpacing: 1 }}>VISITAS</div>
                 <div style={{ fontSize: 11, fontWeight: 900 }}>{client.visits || '0'} SESIONES</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.02)', padding: 15, borderRadius: 20, textAlign:'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ fontSize: 8, color:'var(--text-muted)', marginBottom: 4, letterSpacing: 1 }}>PLAN ACTIVO</div>
                 <div style={{ fontSize: 11, fontWeight: 900 }}>{client.plan.toUpperCase()}</div>
              </div>
           </div>

           {/* Clinical/Note Section */}
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 30 }}>
              <div style={{ background:'rgba(255,255,255,0.02)', padding: 18, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ fontSize: 9, fontWeight:950, color:'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={12}/> LESIONES</div>
                 <div style={{ fontSize: 12, lineHeight: 1.5, color: client.injuries ? '#fff' : 'var(--text-muted)' }}>{client.injuries || 'Ninguna registrada'}</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.02)', padding: 18, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ fontSize: 9, fontWeight:950, color:'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Dumbbell size={12}/> NUTRICIÓN</div>
                 <div style={{ fontSize: 12, lineHeight: 1.5, color: client.nutrition ? '#fff' : 'var(--text-muted)' }}>{client.nutrition || 'Sin guía cargada'}</div>
              </div>
           </div>

           {/* Direct Access Bar */}
           <div style={{ background:'rgba(0,255,136,0.05)', padding: 25, borderRadius: 24, border: '1px solid rgba(0,255,136,0.1)', position: 'relative' }}>
              <button 
                onClick={() => window.open(`https://wa.me/57${client.phone.replace(/-/g,'')}?text=Hola ${client.name}, te saludamos de GymFuxionFit!`, '_blank')}
                style={{ position: 'absolute', top: 20, right: 20, padding: '12px 20px', borderRadius: 14, background: '#25D366', color: '#fff', border: 'none', fontSize: 11, fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                 <Phone size={14} /> WHATSAPP
              </button>
              <div style={{ display:'flex', alignItems:'center', gap: 15, marginBottom: 15 }}>
                 <Mail size={16} style={{ color:'var(--neon-green)' }} />
                 <span style={{ fontSize: 14 }}>{client.email || 'atleta@gymfuxion.com'}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap: 15, marginBottom: 15 }}>
                 <CreditCard size={16} style={{ color:'var(--neon-green)' }} />
                 <span style={{ fontSize: 14 }}>Pago: {client.payMethod.toUpperCase()} (Vence: {client.expiry})</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap: 15 }}>
                 <AlertTriangle size={16} style={{ color:'var(--danger-red)' }} />
                 <span style={{ fontSize: 14, fontWeight: 800 }}>Emergencia: {client.emergencyContact || client.emergency || 'No asignado'}</span>
              </div>
           </div>

        </div>

        <div style={{ padding: 25, background: 'rgba(0,0,0,0.2)', display: 'flex', gap: 12 }}>
           <button onClick={() => window.print()} style={{ flex: 1, padding: 15, borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>IMPRIMIR FICHA</button>
           <button onClick={onDelete} style={{ padding: 15, borderRadius: 16, background: 'rgba(255,61,87,0.1)', color: 'var(--danger-red)', border: 'none', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>ELIMINAR SOCIO</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
export default function Members() {
  const [clients, setClients]       = useState<Client[]>(initialClients);
  const [search,  setSearch]        = useState('');
  const [filterPlan, setFilterPlan] = useState<PlanId | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [showModal, setShowModal]   = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [toast, setToast]           = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /* Filtro */
  const filtered = useMemo(() => clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    const matchPlan   = filterPlan === 'all'   || c.plan   === filterPlan;
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  }), [clients, search, filterPlan, filterStatus]);

  /* KPIs */
  const stats = {
    total:    clients.length,
    active:   clients.filter(c => c.status === 'active').length,
    expiring: clients.filter(c => c.status === 'expiring').length,
    expired:  clients.filter(c => c.status === 'expired').length,
    revenue:  clients.filter(c => c.status !== 'suspended').reduce((a, c) => a + PLANS[c.plan].price, 0),
  };

  /* Guardar nuevo/editar */
  const handleSave = (data: Omit<Client,'id'|'visits'|'lastVisit'|'color'>) => {
    if (editClient) {
      setClients(prev => prev.map(c => c.id === editClient.id ? { ...c, ...data } : c));
      showToast(`✅ Cliente "${data.name}" actualizado`);
    } else {
      const newClient: Client = {
        ...data, id: Date.now(), visits: 0,
        lastVisit: 'Nunca',
        color: COLORS[clients.length % COLORS.length],
      };
      setClients(prev => [newClient, ...prev]);
      showToast(`✅ Cliente "${data.name}" registrado exitosamente`);
    }
    setShowModal(false);
    setEditClient(null);
  };

  /* Cambio de estado rápido */
  const toggleStatus = (id: number, newStatus: Status) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    showToast(`✅ Estado actualizado`);
  };

  const deleteClient = (id: number) => {
    const name = clients.find(c => c.id === id)?.name;
    setClients(prev => prev.filter(c => c.id !== id));
    setViewClient(null);
    showToast(`🗑️ Cliente "${name}" eliminado`);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', gap:0 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:24, right:24, zIndex:2000,
          padding:'12px 20px', borderRadius:'var(--radius-lg)',
          background:'var(--space-dark)', border:'1px solid rgba(0,255,136,.35)',
          color:'var(--neon-green)', fontSize:13, fontWeight:700,
          boxShadow:'var(--glow-green)', animation:'none',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:'var(--text-2xl)', fontWeight:800 }}>Gestión de Clientes</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)', marginTop:4 }}>
            {stats.total} clientes registrados · {stats.active} activos
          </p>
        </div>
        <button
          onClick={() => { setEditClient(null); setShowModal(true); }}
          className="btn btn-primary"
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', fontSize:13, fontWeight:700 }}
        >
          <Plus size={16}/> Agregar Cliente
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-row" style={{ marginBottom:20 }}>
        {[
          { label:'Total Clientes',  val:stats.total,                  color:'var(--text-primary)',  icon:'👥' },
          { label:'Activos',         val:stats.active,                 color:'var(--neon-green)',    icon:'✅' },
          { label:'Por Vencer',      val:stats.expiring,               color:'#FFD600',              icon:'⚠️' },
          { label:'Vencidos',        val:stats.expired,                color:'var(--danger-red)',    icon:'❌' },
          { label:'Ingresos/mes',    val:`$${(stats.revenue/1000).toFixed(0)}K`, color:'var(--neon-green)', icon:'💰' },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ padding:'16px 18px', border: 'var(--glass-border)' }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{k.icon}</div>
            <div style={{ fontSize:22, fontWeight:900, color:k.color }}>{k.val}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros + Búsqueda */}
      <div className="glass-card" style={{ padding:'14px 18px', marginBottom:16, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input
            className="input-field"
            placeholder="Buscar por nombre, email, teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft:38, width:'100%' }}
          />
        </div>

        {/* Filter plan */}
        <div style={{ position:'relative' }}>
          <select
            value={filterPlan}
            onChange={e => setFilterPlan(e.target.value as PlanId | 'all')}
            style={{ padding:'9px 32px 9px 14px', borderRadius:'var(--radius-md)', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', color:'var(--text-primary)', fontSize:12.5, fontWeight:600, cursor:'pointer', appearance:'none', fontFamily:'var(--font)' }}
          >
            <option value="all">Todos los planes</option>
            <option value="basic">Básico</option>
            <option value="pro">Pro</option>
            <option value="hyrox">HYROX Pro</option>
          </select>
          <ChevronDown size={14} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}/>
        </div>

        {/* Filter status */}
        <div style={{ position:'relative' }}>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as Status | 'all')}
            style={{ padding:'9px 32px 9px 14px', borderRadius:'var(--radius-md)', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', color:'var(--text-primary)', fontSize:12.5, fontWeight:600, cursor:'pointer', appearance:'none', fontFamily:'var(--font)' }}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="expiring">Por vencer</option>
            <option value="expired">Vencidos</option>
            <option value="suspended">Suspendidos</option>
          </select>
          <ChevronDown size={14} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}/>
        </div>

        <div style={{ fontSize:12, color:'var(--text-muted)' }}>{filtered.length} resultados</div>
      </div>

      {/* Tabla */}
      <div className="glass-card" style={{ padding:0, overflow:'hidden', flex:1 }}>
        <div className="data-table-container" style={{ overflowY:'auto', maxHeight:'100%' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'rgba(255,255,255,.03)', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                {['Cliente','Plan','Estado','Vencimiento','Pago','Entrenador','Visitas','Acciones'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{
                  borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                  transition:'background .12s',
                }} onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,.025)')}
                   onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                  {/* Cliente */}
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:`${c.color}20`, border:`1.5px solid ${c.color}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:c.color, flexShrink:0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize:13.5, fontWeight:700, color:'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'14px 16px' }}><PlanBadge p={c.plan}/></td>
                  <td style={{ padding:'14px 16px' }}><StatusBadge s={c.status}/></td>
                  <td style={{ padding:'14px 16px', fontSize:12.5, color: c.status==='expired' ? 'var(--danger-red)' : c.status==='expiring' ? '#FFD600' : 'var(--text-secondary)' }}>{c.expiry}</td>
                  <td style={{ padding:'14px 16px', fontSize:12, color:'var(--text-secondary)', textTransform:'capitalize' }}>{c.payMethod}</td>
                  <td style={{ padding:'14px 16px', fontSize:12, color:'var(--text-secondary)' }}>{c.trainer||'—'}</td>
                  <td style={{ padding:'14px 16px', fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{c.visits}</td>
                  {/* Acciones */}
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => setViewClient(c)} title="Ver detalle" style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)' }}>
                        <Eye size={13}/>
                      </button>
                      <button onClick={() => { setEditClient(c); setShowModal(true); }} title="Editar" style={{ width:30, height:30, borderRadius:8, background:'var(--green-5)', border:'1px solid var(--green-20)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--neon-green)' }}>
                        <Edit2 size={13}/>
                      </button>
                      {c.status === 'suspended' ? (
                        <button onClick={() => toggleStatus(c.id,'active')} title="Activar" style={{ width:30, height:30, borderRadius:8, background:'rgba(0,230,118,.08)', border:'1px solid rgba(0,230,118,.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--success-green)' }}>
                          <UserCheck size={13}/>
                        </button>
                      ) : (
                        <button onClick={() => toggleStatus(c.id,'suspended')} title="Suspender" style={{ width:30, height:30, borderRadius:8, background:'rgba(255,61,87,.06)', border:'1px solid rgba(255,61,87,.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--danger-red)' }}>
                          <UserX size={13}/>
                        </button>
                      )}
                      {(c.status === 'expired' || c.status === 'expiring') && (
                        <button onClick={() => toggleStatus(c.id,'active')} title="Renovar" style={{ width:30, height:30, borderRadius:8, background:'rgba(0,229,255,.06)', border:'1px solid rgba(0,229,255,.2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#00E5FF' }}>
                          <RefreshCw size={13}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
              <Filter size={32} style={{ marginBottom:12, opacity:.4 }}/>
              <div>No se encontraron clientes</div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <ClientModal
          initial={editClient}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditClient(null); }}
        />
      )}
      {viewClient && (
        <DetailPanel
          client={viewClient}
          onClose={() => setViewClient(null)}
          onEdit={() => { setEditClient(viewClient); setViewClient(null); setShowModal(true); }}
          onDelete={() => deleteClient(viewClient.id)}
        />
      )}
    </div>
  );
}
