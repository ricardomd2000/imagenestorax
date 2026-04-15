import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Image, ChevronRight, CheckCircle2 } from 'lucide-react'
import confetti from 'canvas-confetti'

const ImageIdentification = () => {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isFinished, setIsFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Hardcoded labels based on filenames for consistency
  const allLabels = [
    "Vena cava superior", "Tronco venoso braquiocefálico izquierdo", "Timo", "Pericardio fibroso",
    "Nervio laríngeo recurrente", "Arteria pulmonar", "Vena ácigos", "Conducto torácico",
    "Cadena simpática", "Esófago", "Aorta descendente", "Vena cava inferior",
    "Tronco arterial braquiocefálico", "Vena yugular interna", "Vena subclavia",
    "Arteria subclavia izquierda", "Cayado aórtico", "Tráquea", "Cayado de la vena ácigos",
    "Bronquio principal derecho", "Arteria pulmonar izquierda", "Bronquio principal izquierdo",
    "Aurícula derecha", "Ventrículo derecho", "Aurícula izquierda", "Ventrículo izquierdo",
    "Seno venoso coronario", "Nervio frénico", "Ganglio linfático", "Aorta ascendente"
  ]

  const imageFiles = [
    { file: "01 - Vena cava superior.jpg", label: "Vena cava superior" },
    { file: "02 - Tronco venoso braquiocefálico izquierdo.jpg", label: "Tronco venoso braquiocefálico izquierdo" },
    { file: "03 - Timo.jpg", label: "Timo" },
    { file: "04 - Pericardio fibroso.jpg", label: "Pericardio fibroso" },
    { file: "05 - Nervio laríngeo recurrente.jpg", label: "Nervio laríngeo recurrente" },
    { file: "06 - Arteria pulmonar.jpg", label: "Arteria pulmonar" },
    { file: "07 - Vena ácigos.jpg", label: "Vena ácigos" },
    { file: "08 - Conducto torácico.jpg", label: "Conducto torácico" },
    { file: "09 - Cadena simpática.jpg", label: "Cadena simpática" },
    { file: "10 - Esófago.jpg", label: "Esófago" },
    { file: "01 - Tronco venoso braquiocefálico derecho.jpg", label: "Tronco venoso braquiocefálico derecho" },
    { file: "02 - Tronco arterial braquiocefálico.jpg", label: "Tronco arterial braquiocefálico" },
    { file: "03 - Arteria subclavia izquierda.jpg", label: "Arteria subclavia izquierda" },
    { file: "04 - Cayado aórtico.jpg", label: "Cayado aórtico" },
    { file: "05 - Tráquea.jpg", label: "Tráquea" },
    { file: "06 - Cayado de la vena ácigos.jpg", label: "Cayado de la vena ácigos" },
    { file: "09 - Arteria pulmonar izquierda.jpg", label: "Arteria pulmonar izquierda" },
    { file: "11 - Aurícula derecha.jpg", label: "Aurícula derecha" },
    { file: "12 - Ventrículo derecho.jpg", label: "Ventrículo derecho" },
    { file: "14 - Ventrículo izquierdo.jpg", label: "Ventrículo izquierdo" }
  ]

  useEffect(() => {
    generateQuestions()
  }, [])

  const generateQuestions = () => {
    const shuffledImages = [...imageFiles].sort(() => 0.5 - Math.random()).slice(0, 10)
    const qSet = shuffledImages.map(img => {
      // Get 3 random distractors
      const distractors = allLabels
        .filter(l => l !== img.label)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
      
      const options = [img.label, ...distractors].sort(() => 0.5 - Math.random())
      return { ...img, options }
    })
    setQuestions(qSet)
    setLoading(false)
  }

  const handleSelect = (label) => {
    setAnswers({ ...answers, [currentIndex]: label })
  }

  const finishPhase = async () => {
    let score = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.label) score++
    })

    const { error } = await supabase
      .from('seguimiento')
      .update({ 
        score_fase2: score,
        respuestas_fase2: answers,
        fase_actual: 3 
      })
      .eq('estudiante_id', user.id)

    if (!error) {
      setIsFinished(true)
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#f472b6', '#ffffff']
      })
    }
  }

  if (loading) return null

  if (isFinished) {
    const finalScore = questions.reduce((acc, q, idx) => acc + (answers[idx] === q.label ? 1 : 0), 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
        <div className="glass-panel p-10 max-w-lg w-full animate-fade-in">
          <CheckCircle2 className="text-success mx-auto mb-6" size={64} />
          <h2 className="text-3xl font-bold mb-2">¡Parte 2 Completada!</h2>
          <p className="text-text-secondary mb-8">Identificación de Anatomía</p>
          <div className="text-6xl font-bold text-accent-secondary mb-10">{finalScore} / 10</div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
            Siguiente: Casos Clínicos
          </button>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-text-secondary">Imagen {currentIndex + 1} de 10</span>
          <span className="text-sm font-medium text-accent-secondary">{Math.round(progress)}% completado</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-secondary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="glass-panel p-4 overflow-hidden group">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-black">
            <img 
              src={`/assets/mediastino/${currentQ.file}`} 
              alt="Anatomical Study"
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <p className="mt-4 text-xs text-text-secondary italic text-center">Referencia Anatómica Mediastínica</p>
        </div>

        <div className="glass-panel p-8 animate-fade-in">
          <div className="flex gap-4 items-start mb-6">
            <div className="bg-accent-secondary/10 p-2 rounded-lg text-accent-secondary shrink-0">
              <Image size={24} />
            </div>
            <h2 className="text-xl font-medium leading-tight">¿Qué estructura se señala en la imagen?</h2>
          </div>

          <div className="grid gap-3">
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`flex items-center gap-4 p-4 rounded-xl text-left border-2 transition-all ${
                  answers[currentIndex] === opt 
                  ? 'border-accent-secondary bg-accent-secondary/5' 
                  : 'border-transparent bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className={answers[currentIndex] === opt ? 'text-white font-medium' : 'text-text-secondary'}>
                  {opt}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <button 
              disabled={!answers[currentIndex]}
              onClick={() => currentIndex < 9 ? setCurrentIndex(currentIndex + 1) : finishPhase()}
              className="btn-primary flex items-center gap-2 px-8 bg-gradient-to-r from-accent-secondary to-pink-500"
            >
              {currentIndex === 9 ? 'Finalizar' : 'Siguiente'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageIdentification
