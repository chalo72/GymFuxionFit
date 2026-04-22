import React, { useState } from 'react';
import { Kanban, UserPlus, TrendingUp, Instagram, Facebook, MessageSquare, Phone, X, Save, Plus } from 'lucide-react';

export default function CRM() {
  const [showModal, setShowModal] = useState(false);
  const [leads, setLeads] = useState([
    { name: 'Carlos Mario', source: 'Instagram', date: 'Hoy, 10:30', status: 'leads' },
    { name: 'Diana Perez', source: 'Facebook', date: 'Ayer', status: 'leads' },
    { name: 'Luis Restrepo', source: 'TikTok', date: 'Hace 2 días', status: 'contacted' },
  ]);

  const [newLead, setNewLead] = useState({ name: '', source: 'Instagram', status: 'leads' });

  const columns = [
    { id: 'leads', title: 'Nuevos Leads', color: '#00FF88', count: leads.filter(l => l.status === 'leads').length },
    { id: 'contacted', title: 'Contactados', color: '#FF6B35', count: leads.filter(l => l.status === 'contacted').length },
    { id: 'trial', title: 'Clase de Prueba', color: '#00E676', count: leads.filter(l => l.status === 'trial').length },
    { id: 'closed', title: 'Cerrados', color: '#00E676', count: leads.filter(l => l.status === 'closed').length },
  ];

  const handleAddLead = () => {
    if (!newLead.name) return;
    setLeads([...leads, { ...newLead, date: 'Ahora' }]);
    setNewLead({ name: '', source: 'Instagram', status: 'leads' });
    setShowModal(false);
  };

  return (
    <div className="animate-fade-in">
      {/* MODAL NUEVO LEAD */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-card" style={{ maxWidth: 400, width: '100%', border: '1px solid var(--neon-green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
               <h3 style={{ fontSize: 18, fontWeight: 950 }}>NUEVO PROSPECTO</h3>
               <button onClick={() => setShowModal(false)} style={{ color: '#fff', opacity: 0.5 }}><X size={20}/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div>
                  <label style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>NOMBRE DEL CLIENTE</label>
                  <input 
                    className="input-field" 
                    placeholder="Ej: Juan Perez" 
                    value={newLead.name}
                    onChange={e => setNewLead({...newLead, name: e.target.value})}
                  />
               </div>
               <div>
                  <label style={{ fontSize: 10, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>FUENTE DE ORIGEN</label>
                  <select 
                    className="input-field"
                    value={newLead.source}
                    onChange={e => setNewLead({...newLead, source: e.target.value})}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Referido">Referido</option>
                  </select>
               </div>
               <button 
                onClick={handleAddLead}
                style={{ width: '100%', padding: 16, borderRadius: 12, background: 'var(--neon-green)', color: '#000', fontWeight: 950, border: 'none', cursor: 'pointer', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
               >
                 <Save size={18}/> GUARDAR PROSPECTO
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="navbar-title">CRM de Ventas <span style={{ color: 'var(--neon-green)', fontSize: '0.9rem', marginLeft: 8 }}>Pipeline Omnicanal</span></h1>
          <p className="glass-card-subtitle">Gestión de prospectos e integración con redes sociales</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary">
            <TrendingUp size={18} />
            Metas
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={18} />
            Nuevo Lead
          </button>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card cyan">
           <div className="kpi-label">Tasa de Conversión</div>
           <div className="kpi-value">18.5%</div>
           <div className="kpi-change positive">+2.4%</div>
        </div>
        <div className="kpi-card orange">
           <div className="kpi-label">Leads Activos</div>
           <div className="kpi-value">{leads.length}</div>
           <div className="kpi-change positive">En seguimiento</div>
        </div>
        <div className="kpi-card green">
           <div className="kpi-label">Ingresos Proyectados</div>
           <div className="kpi-value">$12.4k</div>
           <div className="kpi-change positive">Meta 85%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 12 }}>
        {columns.map((col) => (
          <div key={col.id} className="glass-card" style={{ padding: '16px 12px', background: 'rgba(255,255,255,0.02)', minHeight: 500 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 8px' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {col.title}
                </h3>
                <span style={{ fontSize: 'var(--text-xs)', background: col.color, color: 'var(--deep-space)', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                  {col.count}
                </span>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {leads.filter(l => l.status === col.id).map((lead, i) => (
                  <div key={i} className="glass-card" style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--space-medium)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', animation: 'fade-in 0.3s ease' }}>
                     <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>{lead.name}</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {lead.source === 'Instagram' ? <Instagram size={12} /> : lead.source === 'Facebook' ? <Facebook size={12} /> : <MessageSquare size={12} />}
                        {lead.source} • {lead.date}
                     </div>
                     <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button style={{ padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--neon-green)' }}><MessageSquare size={14}/></button>
                        <button style={{ padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--neon-green)' }}><Phone size={14}/></button>
                     </div>
                  </div>
                ))}
                {col.id === 'leads' && (
                  <button 
                    onClick={() => setShowModal(true)}
                    style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + AÑADIR PROSPECTO
                  </button>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
