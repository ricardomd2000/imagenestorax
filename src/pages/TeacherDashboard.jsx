import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Activity, Users, User, Search, Filter, MessageSquare, ClipboardCheck, ExternalLink } from 'lucide-react'

const TeacherDashboard = () => {
  const [students, setStudents] = useState([])
  const [filter, setFilter] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('Todos')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('seguimiento-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seguimiento' }, () => {
        fetchStudents()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('seguimiento')
      .select('*')
      .order('ultima_actualizacion', { ascending: false })
    
    if (data) setStudents(data)
    setLoading(false)
  }

  const groups = ['Todos', ...new Set(students.map(s => s.grupo).filter(Boolean))]

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.nombre_estudiante?.toLowerCase().includes(filter.toLowerCase())
    const matchesGroup = selectedGroup === 'Todos' || s.grupo === selectedGroup
    return matchesSearch && matchesGroup
  })

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <header className="flex justify-between items-center mb-10">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="text-accent-primary" size={32} />
            Panel de Seguimiento <span className="text-accent-primary">Docente</span>
          </h1>
          <p className="text-text-secondary mt-1">Monitorea el progreso de tus estudiantes en tiempo real.</p>
        </div>
        
        <div className="flex bg-slate-800 rounded-lg p-1 border border-white/5">
          <div className="flex items-center px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-md">
            <Users size={18} className="mr-2" />
            <span className="font-bold text-lg">{students.length}</span>
            <span className="ml-1 text-sm">Alumnos</span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Student List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-text-secondary" size={18} />
              <input 
                className="pl-10" 
                placeholder="Buscar por nombre..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="relative w-48">
              <Filter className="absolute left-3 top-2.5 text-text-secondary" size={18} />
              <select 
                className="pl-10"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/80 text-text-secondary text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Grupo</th>
                  <th className="px-6 py-4">Fase Actual</th>
                  <th className="px-6 py-4">Puntajes (P1 / P2)</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold text-xs">
                          {s.nombre_estudiante?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium">{s.nombre_estudiante}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-text-secondary">{s.grupo}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${s.completado ? 'bg-success' : 'bg-warning animate-pulse'}`} />
                        <span className="text-sm">Fase {s.fase_actual}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className="bg-slate-800 px-2 py-1 rounded text-xs font-mono">{s.puntaje_quiz}/10</span>
                        <span className="bg-slate-800 px-2 py-1 rounded text-xs font-mono text-accent-secondary">{s.score_fase2 || 0}/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedStudent(s)}
                        className="text-accent-primary hover:bg-accent-primary/10 p-2 rounded-lg transition-colors"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: details */}
        <div className="space-y-6">
          <div className="glass-panel p-6 sticky top-8">
            {selectedStudent ? (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Detalle del Alumno</h3>
                  <button onClick={() => setSelectedStudent(null)} className="text-text-secondary hover:text-white text-xs">Cerrar</button>
                </div>
                
                <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
                  <User className="text-accent-primary" />
                  <div>
                    <div className="font-bold">{selectedStudent.nombre_estudiante}</div>
                    <div className="text-xs text-text-secondary">Grupo {selectedStudent.grupo}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-3 text-text-secondary uppercase tracking-widest">
                      <ClipboardCheck size={14} className="text-success" /> Respuestas Caso Clínico (Fase 3)
                    </h4>
                    {selectedStudent.respuestas_fase3 && Object.keys(selectedStudent.respuestas_fase3).length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {Object.entries(selectedStudent.respuestas_fase3).map(([key, resp]) => (
                          <div key={key} className="p-4 bg-slate-900 border border-white/5 rounded-lg space-y-3">
                            <div className="text-xs font-bold text-accent-primary">CASO {parseInt(key) + 1}</div>
                            <div>
                              <div className="text-[10px] text-text-secondary uppercase mb-1">Localización:</div>
                              <p className="text-xs italic">"{resp.location || 'Sin respuesta'}"</p>
                            </div>
                            <div>
                              <div className="text-[10px] text-text-secondary uppercase mb-1">Órgano afectado:</div>
                              <p className="text-xs italic">"{resp.organ || 'Sin respuesta'}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary italic">Aún no ha ingresado respuestas en la Fase 3.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 flex flex-col items-center">
                <MessageSquare className="text-slate-700 mb-4" size={48} />
                <p className="text-text-secondary max-w-[200px] mx-auto">Selecciona un estudiante para ver el detalle de sus respuestas abiertas.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
