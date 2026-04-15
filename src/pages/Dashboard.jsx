import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Play, CheckCircle, Clock, BookOpen, Layers, ClipboardList } from 'lucide-react'

const Dashboard = () => {
  const { user, profile } = useAuth()
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) fetchTracking()
  }, [user])

  const fetchTracking = async () => {
    const { data, error } = await supabase
      .from('seguimiento')
      .select('*')
      .eq('estudiante_id', user.id)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // Create initial tracking if not exists
      const { data: newData } = await supabase
        .from('seguimiento')
        .insert([{ 
          estudiante_id: user.id, 
          nombre_estudiante: profile?.nombre_completo,
          grupo: profile?.grupo,
          fase_actual: 1 
        }])
        .select()
        .single()
      setTracking(newData)
    } else {
      setTracking(data)
    }
    setLoading(false)
  }

  const phases = [
    { 
      id: 1, 
      title: 'Parte 1: Quiz de Conocimientos', 
      desc: '10 preguntas aleatorias sobre anatomía del mediastino.',
      icon: <ClipboardList />,
      path: '/quiz'
    },
    { 
      id: 2, 
      title: 'Parte 2: Identificación Anatómica', 
      desc: 'Selección múltiple basada en imágenes reales.',
      icon: <Layers />,
      path: '/identificacion'
    },
    { 
      id: 3, 
      title: 'Parte 3: Casos Clínicos', 
      desc: 'Diagnóstico abierto comparando RX y TC.',
      icon: <BookOpen />,
      path: '/casos'
    }
  ]

  if (loading) return null

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-10">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Bienvenido, <span className="text-accent-primary">{profile?.nombre_completo || 'Estudiante'}</span></h1>
          <p className="text-text-secondary">Grupo: {profile?.grupo || 'N/A'}</p>
        </div>
        {profile?.rol === 'docente' && (
          <Link to="/teacher" className="btn-outline flex items-center gap-2">
            <Activity size={18} /> Dashboard Docente
          </Link>
        )}
      </div>

      <div className="grid gap-6">
        {phases.map((phase) => {
          const isLocked = tracking?.fase_actual < phase.id
          const isCompleted = tracking?.fase_actual > phase.id || (phase.id === 3 && tracking?.completado)
          const isActive = tracking?.fase_actual === phase.id

          return (
            <div 
              key={phase.id} 
              className={`glass-panel p-6 flex items-center gap-6 transition-all ${isLocked ? 'opacity-50 grayscale' : 'hover:scale-[1.01]'}`}
            >
              <div className={`p-4 rounded-xl ${isActive ? 'bg-accent-primary/20 text-accent-primary' : 'bg-slate-800 text-slate-400'}`}>
                {phase.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold">{phase.title}</h3>
                  {isCompleted && <CheckCircle className="text-success" size={18} />}
                </div>
                <p className="text-text-secondary text-sm">{phase.desc}</p>
              </div>
              <div>
                {isLocked ? (
                  <span className="text-xs font-semibold bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">Bloqueado</span>
                ) : isCompleted ? (
                  <span className="text-xs font-semibold bg-success/10 text-success px-3 py-1 rounded-full uppercase tracking-wider">Completado</span>
                ) : (
                  <button 
                    onClick={() => navigate(phase.path)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Play size={16} fill="currentColor" /> Comenzar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 glass-panel p-6 border-accent-primary/20 bg-accent-primary/5">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Clock size={16} className="text-accent-primary" /> Recurso de Apoyo
        </h4>
        <p className="text-sm text-text-secondary">
          Recuerda revisar el material de estudio antes de cada fase. Los resultados se sincronizan en tiempo real con el docente.
        </p>
      </div>
    </div>
  )
}

export default Dashboard
