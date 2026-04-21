import React from 'react';
import { Kanban, UserPlus, TrendingUp, Instagram, Facebook, MessageSquare, Phone } from 'lucide-react';

export default function CRM() {
  const columns = [
    { id: 'leads', title: 'Nuevos Leads', color: 'var(--electric-cyan)', count: 12 },
    { id: 'contacted', title: 'Contactados', color: 'var(--energy-orange)', count: 8 },
    { id: 'trial', title: 'Clase de Prueba', color: 'var(--success-green)', count: 5 },
    { id: 'closed', title: 'Cerrados', color: 'var(--success-green)', count: 24 },
  ];

  const mockLeads = [
    { name: 'Carlos Mario', source: 'Instagram', date: 'Hoy, 10:30', status: 'leads' },
    { name: 'Diana Perez', source: 'Facebook', date: 'Ayer', status: 'leads' },
    { name: 'Luis Restrepo', source: 'TikTok', date: 'Hace 2 días', status: 'contacted' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="glass-card-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="navbar-title">CRM de Ventas <span style={{ color: 'var(--electric-cyan)', fontSize: '0.9rem', marginLeft: 8 }}>Pipeline Omnicanal</span></h1>
          <p className="glass-card-subtitle">Gestión de prospectos e integración con redes sociales</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary">
            <TrendingUp size={18} />
            Metas del Mes
          </button>
          <button className="btn btn-primary">
            <UserPlus size={18} />
            Nuevo Lead
          </button>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card cyan">
           <div className="kpi-label">Tasa de Conversión</div>
           <div className="kpi-value">18.5%</div>
           <div className="kpi-change positive">+2.4% vs mes anterior</div>
        </div>
        <div className="kpi-card orange">
           <div className="kpi-label">Leads del Mes</div>
           <div className="kpi-value">142</div>
           <div className="kpi-change positive">Tendencia al alza</div>
        </div>
        <div className="kpi-card green">
           <div className="kpi-label">Ingresos Proyectados</div>
           <div className="kpi-value">$12,450</div>
           <div className="kpi-change positive">Meta 85%</div>
        </div>
        <div className="kpi-card">
           <div className="kpi-label">Fuentes Top</div>
           <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <Instagram size={20} style={{ color: '#E4405F' }} />
              <Facebook size={20} style={{ color: '#1877F2' }} />
              <MessageSquare size={20} style={{ color: '#25D366' }} />
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 12 }}>
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
                {mockLeads.filter(l => l.status === col.id).map((lead, i) => (
                  <div key={i} className="glass-card" style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--space-medium)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>{lead.name}</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {lead.source === 'Instagram' ? <Instagram size={12} /> : lead.source === 'Facebook' ? <Facebook size={12} /> : <TrendingUp size={12} />}
                        {lead.source} • {lead.date}
                     </div>
                     <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button style={{ padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--electric-cyan)' }}><MessageSquare size={14}/></button>
                        <button style={{ padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--electric-cyan)' }}><Phone size={14}/></button>
                     </div>
                  </div>
                ))}
                {col.id === 'leads' && (
                  <button style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
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
