import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { BookOpen, MapPin, Stethoscope, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import confetti from 'canvas-confetti'

const ClinicalCases = () => {
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const navigate = useNavigate()

  // Cases based on files found (1-8)
  const cases = [1, 2, 3, 4, 5, 6, 7, 8].map(num => ({
    id: num,
    rx: `/assets/rx/${num}.${num <= 2 || num >= 5 ? 'jpg' : 'jpeg'}`,
    tc: `/assets/tc/${num}.${num <= 2 || num >= 7 ? 'jpg' : num >= 5 ? '(T).jpg' : 'jpeg'}`
  }))

  const handleInputChange = (field, value) => {
    setResponses({
      ...responses,
      [currentIndex]: {
        ...responses[currentIndex],
        [field]: value
      }
    })
  }

  const handleSaveProgress = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('seguimiento')
      .update({ 
        respuestas_fase3: responses,
        ultima_actualizacion: new Array().toISOString // Placeholder for now or just let default now() work
      })
      .eq('estudiante_id', user.id)
    
    setLoading(false)
    if (!error) {
      setSaveStatus('Progreso guardado')
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const finishPractice = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('seguimiento')
      .update({ 
        respuestas_fase3: responses,
        completado: true,
        fase_actual: 3 // Stay on 3 but mark as completed
      })
      .eq('estudiante_id', user.id)

    if (!error) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 }
      })
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const currentCase = cases[currentIndex]
  const currentResp = responses[currentIndex] || { location: '', organ: '' }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-accent-primary" /> Parte 3: Casos Clínicos
          </h1>
          <p className="text-text-secondary text-sm">Compara las imágenes y describe tus hallazgos.</p>
        </div>
        <div className="flex gap-3">
          {saveStatus && <span className="text-success text-sm self-center animate-pulse">{saveStatus}</span>}
          <button onClick={handleSaveProgress} className="btn-outline py-2 px-4 text-sm flex items-center gap-2">
            <Save size={16} /> Guardar Borrador
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
          <div className="glass-panel p-3">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Radiografía (RX)</span>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-accent-primary">Caso {currentCase.id}</span>
            </div>
            <div className="aspect-[4/5] bg-black rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
               <img src={currentCase.rx} alt="RX Study" className="max-h-full object-contain" />
            </div>
          </div>
          
          <div className="glass-panel p-3">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Tomografía (TC)</span>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-accent-secondary">Caso {currentCase.id}</span>
            </div>
            <div className="aspect-[4/5] bg-black rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
                <img src={currentCase.tc} alt="TC Study" className="max-h-full object-contain" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent-primary/10 p-2 rounded-lg text-accent-primary">
                <MapPin size={20} />
              </div>
              <h3 className="font-semibold">Localización</h3>
            </div>
            <textarea
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm min-h-[120px] focus:border-accent-primary transition-colors"
              placeholder="Describe la ubicación de la lesión (ej: Mediastino anterior, lóbulo superior derecho...)"
              value={currentResp.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent-secondary/10 p-2 rounded-lg text-accent-secondary">
                <Stethoscope size={20} />
              </div>
              <h3 className="font-semibold">Órgano / Estructura Afectada</h3>
            </div>
            <textarea
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm min-h-[120px] focus:border-accent-secondary transition-colors"
              placeholder="¿Qué órgano o estructura anatómica crees que está comprometida?"
              value={currentResp.organ}
              onChange={(e) => handleInputChange('organ', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="btn-outline flex items-center gap-2 disabled:opacity-30"
            >
              <ChevronLeft size={18} /> Anterior
            </button>
            
            {currentIndex === cases.length - 1 ? (
              <button onClick={finishPractice} disabled={loading} className="btn-primary px-8">
                {loading ? 'Sincronizando...' : 'Finalizar Práctica'}
              </button>
            ) : (
              <button onClick={() => setCurrentIndex(currentIndex + 1)} className="btn-primary px-8">
                Siguiente Caso <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClinicalCases
