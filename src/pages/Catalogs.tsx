import React, { useState } from 'react';
import { useCatalogs } from '../hooks/useCatalogs';
import { Dumbbell, Pill, Utensils, Search, X, PlayCircle, Info, CheckCircle2, ChevronRight, Edit3, Trash2, Plus, Image as ImageIcon, Video, Activity } from 'lucide-react';

export default function Catalogs() {
  const { catalogs, addCatalogItem, updateCatalogItem, deleteCatalogItem } = useCatalogs();
  const [activeTab, setActiveTab] = useState<'exercises' | 'functional' | 'supplements' | 'nutrition'>('exercises');
  const [search, setSearch] = useState('');
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'exercises' | 'functional' | 'supplements' | 'nutrition' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const openModal = (item: any, type: 'exercises' | 'functional' | 'supplements' | 'nutrition') => {
    setSelectedItem(item);
    setItemType(type);
    setIsEditing(false);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setItemType(null);
    setIsEditing(false);
    setFormData({});
  };

  const startEdit = () => {
    setFormData(selectedItem);
    setIsEditing(true);
  };

  const startCreate = () => {
    setSelectedItem({ isNew: true });
    setItemType(activeTab);
    setIsEditing(true);
    if (activeTab === 'exercises') {
      setFormData({ name: '', muscleGroup: '', equipment: '', difficulty: 'Intermedio', videoUrl: '', imageUrl: '', instructions: '', mistakes: '' });
    } else if (activeTab === 'functional') {
      setFormData({ name: '', type: 'AMRAP 15', duration: '', description: '', exercises: [], target: 'Cuerpo Completo', imageUrl: '' });
    } else if (activeTab === 'supplements') {
      setFormData({ name: '', type: '', benefits: '', dosage: '', naturalLevel: '100% Natural', imageUrl: '' });
    } else {
      setFormData({ name: '', category: '', description: '', ingredients: [], macros: { calories: 0, protein: 0, carbs: 0, fats: 0 }, imageUrl: '', preparation: '' });
    }
  };

  const handleSave = () => {
    if (!itemType) return;
    
    let finalData = { ...formData };
    if (itemType === 'nutrition' && typeof finalData.ingredients === 'string') {
      finalData.ingredients = finalData.ingredients.split(',').map((s:string) => s.trim());
    }
    if (itemType === 'functional' && typeof finalData.exercises === 'string') {
      finalData.exercises = finalData.exercises.split('\n').map((s:string) => s.trim()).filter(Boolean);
    }

    if (selectedItem?.isNew) {
      addCatalogItem(itemType, finalData);
    } else {
      updateCatalogItem(itemType, selectedItem.id, finalData);
    }
    closeModal();
  };

  const handleDelete = () => {
    if (itemType && selectedItem?.id) {
      if(window.confirm('¿Estás seguro de eliminar este elemento?')) {
        deleteCatalogItem(itemType, selectedItem.id);
        closeModal();
      }
    }
  };

  const renderExercises = () => {
    const filtered = catalogs.exercises.filter((e: any) => e.name.toLowerCase().includes(search.toLowerCase()) || e.muscleGroup.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map((ex: any) => (
          <div key={ex.id} onClick={() => openModal(ex, 'exercises')} className="glass-card" style={{ padding: 16, cursor: 'pointer', border: '1px solid rgba(0,255,136,0.1)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.5)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.1)'}>
            {ex.imageUrl && <div style={{ height: 100, margin: '-16px -16px 16px -16px', background: `url(${ex.imageUrl}) center/cover` }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 16, paddingRight: 30 }}>{ex.name}</div>
              <span style={{ fontSize: 10, background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', padding: '2px 8px', borderRadius: 12 }}>{ex.difficulty}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}><span>💪 {ex.muscleGroup}</span><span>🔧 {ex.equipment}</span></div>
            <div style={{ position: 'absolute', right: 16, bottom: 16, opacity: 0.5 }}><ChevronRight size={16} color="var(--neon-green)" /></div>
          </div>
        ))}
      </div>
    );
  };

  const renderFunctional = () => {
    const filtered = (catalogs.functional || []).filter((f: any) => f.name.toLowerCase().includes(search.toLowerCase()) || f.type.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map((f: any) => (
          <div key={f.id} onClick={() => openModal(f, 'functional')} className="glass-card" style={{ padding: 16, cursor: 'pointer', border: '1px solid rgba(255,61,87,0.1)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,61,87,0.5)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,61,87,0.1)'}>
            {f.imageUrl && <div style={{ height: 100, margin: '-16px -16px 16px -16px', background: `url(${f.imageUrl}) center/cover` }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 16, paddingRight: 30 }}>{f.name}</div>
              <span style={{ fontSize: 10, background: 'rgba(255,61,87,0.1)', color: 'var(--danger-red)', padding: '2px 8px', borderRadius: 12 }}>{f.type}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}><span>⏱️ {f.duration}</span><span>🎯 {f.target}</span></div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>{f.exercises?.length || 0} Ejercicios</div>
            <div style={{ position: 'absolute', right: 16, bottom: 16, opacity: 0.5 }}><ChevronRight size={16} color="var(--danger-red)" /></div>
          </div>
        ))}
      </div>
    );
  };

  const renderSupplements = () => {
    const filtered = catalogs.supplements.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
        {filtered.map((sup: any) => (
          <div key={sup.id} onClick={() => openModal(sup, 'supplements')} className="glass-card" style={{ padding: 16, cursor: 'pointer', border: '1px solid rgba(167,139,250,0.1)', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(167,139,250,0.1)'}>
            {sup.imageUrl && <div style={{ height: 100, margin: '-16px -16px 16px -16px', background: `url(${sup.imageUrl}) center/cover` }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{sup.name}</div>
              <span style={{ fontSize: 10, background: 'rgba(167,139,250,0.1)', color: '#A78BFA', padding: '2px 8px', borderRadius: 12 }}>{sup.type}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>🌿 {sup.naturalLevel}</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}><strong>Beneficios:</strong> <span style={{ color: 'var(--text-secondary)' }}>{sup.benefits.length > 60 ? sup.benefits.substring(0,60)+'...' : sup.benefits}</span></div>
          </div>
        ))}
      </div>
    );
  };

  const renderNutrition = () => {
    const filtered = catalogs.nutrition.filter((n: any) => n.name.toLowerCase().includes(search.toLowerCase()) || n.category.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
        {filtered.map((nut: any) => (
          <div key={nut.id} onClick={() => openModal(nut, 'nutrition')} className="glass-card" style={{ padding: 16, cursor: 'pointer', border: '1px solid rgba(255,214,0,0.1)', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,214,0,0.5)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,214,0,0.1)'}>
            {nut.imageUrl && <div style={{ height: 120, margin: '-16px -16px 16px -16px', background: `url(${nut.imageUrl}) center/cover` }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{nut.name}</div>
              <span style={{ fontSize: 10, background: 'rgba(255,214,0,0.1)', color: '#FFD600', padding: '2px 8px', borderRadius: 12 }}>{nut.category}</span>
            </div>
            <div style={{ fontSize: 12, marginBottom: 12, color: 'var(--text-secondary)' }}>{nut.description}</div>
            <div style={{ display: 'flex', gap: 12, background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8 }}>
              <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{nut.macros.calories}</div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>KCAL</div></div>
              <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 14, fontWeight: 900, color: 'var(--neon-green)' }}>{nut.macros.protein}g</div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>PRO</div></div>
              <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 14, fontWeight: 900, color: '#FFD600' }}>{nut.macros.carbs}g</div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>CARB</div></div>
              <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 14, fontWeight: 900, color: '#FF6B35' }}>{nut.macros.fats}g</div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>FAT</div></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: 'var(--space-dark)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Librería de Conocimiento Premium</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Gestión experta: Añade, edita, adjunta videos e imágenes a tus recursos.</p>
        </div>
        <button onClick={startCreate} className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: 12, gap: 8, boxShadow: '0 0 20px rgba(0,255,136,0.3)' }}>
          <Plus size={18} /> Añadir al Catálogo
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setActiveTab('exercises')} style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', background: activeTab === 'exercises' ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)', color: activeTab === 'exercises' ? '#000' : '#fff', transition: '0.2s' }}>
          <Dumbbell size={18} /> Entrenamientos ({catalogs.exercises.length})
        </button>
        <button onClick={() => setActiveTab('functional')} style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', background: activeTab === 'functional' ? 'var(--danger-red)' : 'rgba(255,255,255,0.05)', color: activeTab === 'functional' ? '#fff' : '#fff', transition: '0.2s' }}>
          <Activity size={18} /> WODs & Funcional ({(catalogs.functional || []).length})
        </button>
        <button onClick={() => setActiveTab('supplements')} style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', background: activeTab === 'supplements' ? '#A78BFA' : 'rgba(255,255,255,0.05)', color: activeTab === 'supplements' ? '#000' : '#fff', transition: '0.2s' }}>
          <Pill size={18} /> Suplementación ({catalogs.supplements.length})
        </button>
        <button onClick={() => setActiveTab('nutrition')} style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', background: activeTab === 'nutrition' ? '#FFD600' : 'rgba(255,255,255,0.05)', color: activeTab === 'nutrition' ? '#000' : '#fff', transition: '0.2s' }}>
          <Utensils size={18} /> Nutrición ({catalogs.nutrition.length})
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
        <Search size={20} color="var(--text-muted)" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, categoría o descripción..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 16 }} />
      </div>

      <div style={{ marginTop: 24, paddingBottom: 60 }}>
        {activeTab === 'exercises' && renderExercises()}
        {activeTab === 'functional' && renderFunctional()}
        {activeTab === 'supplements' && renderSupplements()}
        {activeTab === 'nutrition' && renderNutrition()}
      </div>

      {/* ════════════════════════════════════════════════════
         MODAL DE DETALLES Y EDICIÓN
      ════════════════════════════════════════════════════ */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', background: 'var(--space-dark)', borderRadius: 24, padding: 0, border: `1px solid ${itemType === 'exercises' ? 'var(--neon-green)' : itemType === 'functional' ? 'var(--danger-red)' : itemType === 'supplements' ? '#A78BFA' : '#FFD600'}` }}>
            
            {/* Header del Modal */}
            <div style={{ height: (selectedItem.imageUrl || formData.imageUrl) && !isEditing ? 350 : 150, position: 'relative', background: (selectedItem.imageUrl || formData.imageUrl) && !isEditing ? `url(${selectedItem.imageUrl || formData.imageUrl}) center/cover` : (itemType === 'exercises' ? 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,0,0,0.8))' : itemType === 'functional' ? 'linear-gradient(135deg, rgba(255,61,87,0.1), rgba(0,0,0,0.8))' : itemType === 'supplements' ? 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(0,0,0,0.8))' : 'linear-gradient(135deg, rgba(255,214,0,0.1), rgba(0,0,0,0.8))'), display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {((selectedItem.imageUrl || formData.imageUrl) && !isEditing) && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,18,14,1), transparent)' }} />}
              
              <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 10 }}>
                {!isEditing && !selectedItem.isNew && (
                  <>
                    <button onClick={startEdit} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 8, borderRadius: 8, cursor: 'pointer' }}><Edit3 size={18}/></button>
                    <button onClick={handleDelete} style={{ background: 'rgba(255,61,87,0.2)', border: '1px solid rgba(255,61,87,0.5)', color: 'var(--danger-red)', padding: 8, borderRadius: 8, cursor: 'pointer' }}><Trash2 size={18}/></button>
                  </>
                )}
                <button onClick={closeModal} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: 8, borderRadius: '50%', cursor: 'pointer' }}><X size={20}/></button>
              </div>
              
              {(!selectedItem.imageUrl && !formData.imageUrl && !isEditing) && (
                <div style={{ textAlign: 'center', opacity: 0.8, position: 'relative', zIndex: 5 }}>
                  {itemType === 'exercises' && <Dumbbell size={60} color="var(--neon-green)" />}
                  {itemType === 'functional' && <Activity size={60} color="var(--danger-red)" />}
                  {itemType === 'supplements' && <Pill size={60} color="#A78BFA" />}
                  {itemType === 'nutrition' && <Utensils size={60} color="#FFD600" />}
                </div>
              )}

              {(itemType === 'exercises' || itemType === 'functional') && !isEditing && selectedItem.videoUrl && (
                <a href={selectedItem.videoUrl} target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: 20, right: 20, background: 'var(--danger-red)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', zIndex: 5, textDecoration: 'none' }}>
                  <PlayCircle size={20} /> Ver Video en YouTube
                </a>
              )}
            </div>

            {/* Cuerpo del Modal (Modo Vista o Edición) */}
            <div style={{ padding: '30px 40px', position: 'relative', zIndex: 5 }}>
              {isEditing ? (
                /* ── MODO EDICIÓN ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>{selectedItem.isNew ? 'Añadir Nuevo Elemento' : 'Editar Elemento'}</h2>
                  
                  {/* Campos Comunes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Nombre</label>
                    <input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Press de Banca / Murph" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><ImageIcon size={14}/> URL de la Imagen (Opcional)</label>
                    <input className="input-field" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://ejemplo.com/imagen.jpg" />
                  </div>

                  {/* Campos Específicos: EJERCICIOS */}
                  {itemType === 'exercises' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Grupo Muscular</label>
                          <input className="input-field" value={formData.muscleGroup || ''} onChange={e => setFormData({...formData, muscleGroup: e.target.value})} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Equipamiento</label>
                          <input className="input-field" value={formData.equipment || ''} onChange={e => setFormData({...formData, equipment: e.target.value})} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Dificultad</label>
                          <select className="input-field" value={formData.difficulty || ''} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                            <option>Principiante</option><option>Intermedio</option><option>Avanzado</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Video size={14}/> Video URL</label>
                          <input className="input-field" value={formData.videoUrl || ''} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="https://youtube.com/..." />
                        </div>
                      </div>
                      {/* Detalles extras para que se editen */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Instrucciones de Ejecución</label>
                        <textarea className="input-field" value={formData.instructions || ''} onChange={e => setFormData({...formData, instructions: e.target.value})} rows={3} placeholder="Instrucciones paso a paso..." />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Errores Comunes (Alerta)</label>
                        <textarea className="input-field" value={formData.mistakes || ''} onChange={e => setFormData({...formData, mistakes: e.target.value})} rows={2} placeholder="Errores típicos..." />
                      </div>
                    </>
                  )}

                  {/* Campos Específicos: FUNCIONAL / CROSSFIT */}
                  {itemType === 'functional' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Tipo de WOD (AMRAP, EMOM...)</label><input className="input-field" value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} /></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Duración (Ej: 20 Min)</label><input className="input-field" value={formData.duration || ''} onChange={e => setFormData({...formData, duration: e.target.value})} /></div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Instrucciones / Descripción</label>
                        <textarea className="input-field" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Ejercicios (Uno por línea)</label>
                        <textarea className="input-field" value={Array.isArray(formData.exercises) ? formData.exercises.join('\n') : formData.exercises || ''} onChange={e => setFormData({...formData, exercises: e.target.value})} rows={4} placeholder="5 Dominadas\n10 Flexiones\n15 Sentadillas" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Enfoque (Target)</label><input className="input-field" value={formData.target || ''} onChange={e => setFormData({...formData, target: e.target.value})} /></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Video size={14}/> Video del WOD (Opcional)</label>
                        <input className="input-field" value={formData.videoUrl || ''} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="https://youtube.com/..." />
                      </div>
                    </>
                  )}

                  {/* Campos Específicos: SUPLEMENTOS */}
                  {itemType === 'supplements' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Tipo</label><input className="input-field" value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} /></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Origen Natural</label><input className="input-field" value={formData.naturalLevel || ''} onChange={e => setFormData({...formData, naturalLevel: e.target.value})} /></div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Beneficios</label><textarea className="input-field" value={formData.benefits || ''} onChange={e => setFormData({...formData, benefits: e.target.value})} rows={3} /></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Dosificación</label><input className="input-field" value={formData.dosage || ''} onChange={e => setFormData({...formData, dosage: e.target.value})} /></div>
                    </>
                  )}

                  {/* Campos Específicos: NUTRICIÓN */}
                  {itemType === 'nutrition' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Categoría</label><input className="input-field" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Ingredientes (separados por coma)</label><input className="input-field" value={Array.isArray(formData.ingredients) ? formData.ingredients.join(', ') : formData.ingredients || ''} onChange={e => setFormData({...formData, ingredients: e.target.value})} /></div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Descripción / Detalles</label><textarea className="input-field" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} /></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Instrucciones de Preparación</label><textarea className="input-field" value={formData.preparation || ''} onChange={e => setFormData({...formData, preparation: e.target.value})} rows={3} placeholder="Sazonar y hornear por 20 mins..." /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Calorías</label><input type="number" className="input-field" value={formData.macros?.calories || 0} onChange={e => setFormData({...formData, macros: {...formData.macros, calories: Number(e.target.value)}})} /></div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Proteína (g)</label><input type="number" className="input-field" value={formData.macros?.protein || 0} onChange={e => setFormData({...formData, macros: {...formData.macros, protein: Number(e.target.value)}})} /></div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Carbos (g)</label><input type="number" className="input-field" value={formData.macros?.carbs || 0} onChange={e => setFormData({...formData, macros: {...formData.macros, carbs: Number(e.target.value)}})} /></div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><label style={{ fontSize: 10, color: 'var(--text-muted)' }}>Grasas (g)</label><input type="number" className="input-field" value={formData.macros?.fats || 0} onChange={e => setFormData({...formData, macros: {...formData.macros, fats: Number(e.target.value)}})} /></div>
                      </div>
                    </>
                  )}

                  <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                    <button onClick={() => isEditing && !selectedItem.isNew ? setIsEditing(false) : closeModal()} className="btn btn-secondary" style={{ flex: 1, padding: 14 }}>Cancelar</button>
                    <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1, padding: 14 }}>{selectedItem.isNew ? 'Crear Elemento' : 'Guardar Cambios'}</button>
                  </div>
                </div>
              ) : (
                /* ── MODO VISTA (Solo Lectura) ── */
                <>
                  {itemType === 'exercises' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{selectedItem.name}</h2>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <span style={{ fontSize: 12, background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>Nivel: {selectedItem.difficulty}</span>
                            <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 20 }}>Equipamiento: {selectedItem.equipment}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Grupo Muscular</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{selectedItem.muscleGroup}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 30 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}><Info size={18} color="var(--neon-green)"/> Instrucciones de Ejecución</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, paddingLeft: 10 }}>
                          {selectedItem.instructions || "Mantén la espalda recta y el core activado durante todo el movimiento. Controla la fase excéntrica (bajada) durante al menos 2 segundos y respira de forma fluida."}
                        </p>
                      </div>

                      <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,61,87,0.05)', borderRadius: 12, border: '1px solid rgba(255,61,87,0.2)' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--danger-red)', marginBottom: 8 }}>⚠️ Errores Comunes a Evitar</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {selectedItem.mistakes || "No usar el peso adecuado que permita un rango de movimiento completo. Curvar la zona lumbar por falta de estabilización en el core o bloqueo de rodillas."}
                        </p>
                      </div>
                    </>
                  )}
                  {itemType === 'functional' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{selectedItem.name}</h2>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <span style={{ fontSize: 12, background: 'rgba(255,61,87,0.1)', color: 'var(--danger-red)', padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>{selectedItem.type}</span>
                            <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 20 }}>⏱️ {selectedItem.duration}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Enfoque</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{selectedItem.target}</div>
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{selectedItem.description}</p>
                      
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: 'var(--danger-red)' }}>Estructura del WOD</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {selectedItem.exercises?.map((ex: string, i: number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,61,87,0.1)', color: 'var(--danger-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{i+1}</div>
                              <span style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{ex}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {itemType === 'supplements' && (
                    <>
                      <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{selectedItem.name}</h2>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                        <span style={{ fontSize: 12, background: 'rgba(167,139,250,0.1)', color: '#A78BFA', padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>Tipo: {selectedItem.type}</span>
                        <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 20 }}>Origen: {selectedItem.naturalLevel}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16 }}><h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: '#A78BFA' }}>Beneficios Clínicos</h3><p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{selectedItem.benefits}</p></div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16 }}><h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: '#A78BFA' }}>Dosificación</h3><p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{selectedItem.dosage}</p></div>
                      </div>

                      <div style={{ marginTop: 24, padding: 16, background: 'rgba(167,139,250,0.05)', borderRadius: 12, border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <CheckCircle2 size={24} color="#A78BFA" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Aprobado por el Ecosistema Antigravity</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Este suplemento cuenta con respaldo científico y es seguro para el rendimiento deportivo de alto nivel.</div>
                        </div>
                      </div>
                    </>
                  )}
                  {itemType === 'nutrition' && (
                    <>
                      <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{selectedItem.name}</h2>
                      <span style={{ fontSize: 12, background: 'rgba(255,214,0,0.1)', color: '#FFD600', padding: '4px 12px', borderRadius: 20, fontWeight: 700, display: 'inline-block', marginBottom: 20 }}>{selectedItem.category}</span>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{selectedItem.description}</p>
                      
                      <div style={{ display: 'flex', gap: 16, background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 16, marginBottom: 30 }}>
                        <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{selectedItem.macros?.calories || 0}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CALORÍAS</div></div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 24, fontWeight: 900, color: 'var(--neon-green)' }}>{selectedItem.macros?.protein || 0}g</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>PROTEÍNA</div></div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 24, fontWeight: 900, color: '#FFD600' }}>{selectedItem.macros?.carbs || 0}g</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CARBOS</div></div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 24, fontWeight: 900, color: '#FF6B35' }}>{selectedItem.macros?.fats || 0}g</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>GRASAS</div></div>
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: '#FFD600' }}>Ingredientes Recomendados</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {selectedItem.ingredients?.map((ing: string, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFD600' }} /><span style={{ fontSize: 14, color: '#fff' }}>{ing}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: 30 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>Instrucciones de Preparación</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>
                          {selectedItem.preparation || "Preparar los ingredientes pesándolos en crudo para respetar los macros indicados. Cocinar preferiblemente al vapor, plancha o al horno para no añadir calorías adicionales. Sazonar con especias naturales a gusto."}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
