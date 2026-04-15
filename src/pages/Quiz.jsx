import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Trophy, ChevronRight, HelpCircle } from 'lucide-react'
import confetti from 'canvas-confetti'

const Quiz = () => {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isFinished, setIsFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('banco_preguntas')
      .select('*')
    
    if (data) {
      // Shuffle and take 10
      const shuffled = [...data].sort(() => 0.5 - Math.random())
      setQuestions(shuffled.slice(0, 10))
    }
    setLoading(false)
  }

  const handleAnswer = (optionKey) => {
    setAnswers({ ...answers, [currentIndex]: optionKey })
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = async () => {
    let score = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.respuesta_correcta) score++
    })

    const { error } = await supabase
      .from('seguimiento')
      .update({ 
        puntaje_quiz: score,
        fase_actual: 2 
      })
      .eq('estudiante_id', user.id)

    if (!error) {
      setIsFinished(true)
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }

  if (loading) return null

  if (isFinished) {
    const finalScore = questions.reduce((acc, q, idx) => acc + (answers[idx] === q.respuesta_correcta ? 1 : 0), 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
        <div className="glass-panel p-10 max-w-lg w-full animate-fade-in">
          <Trophy className="text-warning mx-auto mb-6" size={64} />
          <h2 className="text-3xl font-bold mb-2">¡Parte 1 Completada!</h2>
          <p className="text-text-secondary mb-8">Has obtenido un puntaje de</p>
          <div className="text-6xl font-bold text-accent-primary mb-10">{finalScore} / 10</div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
            Continuar al Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-text-secondary">Pregunta {currentIndex + 1} de 10</span>
          <span className="text-sm font-medium text-accent-primary">{Math.round(progress)}% completado</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="glass-panel p-8 animate-fade-in">
        <div className="flex gap-4 items-start mb-6">
          <div className="bg-accent-primary/10 p-2 rounded-lg text-accent-primary shrink-0">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-xl font-medium leading-tight">{currentQ.enunciado}</h2>
        </div>

        <div className="grid gap-3">
          {currentQ.opciones.map((option, idx) => {
            const letter = String.fromCharCode(97 + idx) // a, b, c, d
            const isSelected = answers[currentIndex] === letter
            
            return (
              <button
                key={letter}
                onClick={() => handleAnswer(letter)}
                className={`flex items-center gap-4 p-4 rounded-xl text-left border-2 transition-all ${
                  isSelected 
                  ? 'border-accent-primary bg-accent-primary/5' 
                  : 'border-transparent bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                  isSelected ? 'bg-accent-primary text-slate-900' : 'bg-slate-700 text-slate-400'
                }`}>
                  {letter.toUpperCase()}
                </div>
                <div className={isSelected ? 'text-white' : 'text-text-secondary'}>
                  {option}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <button 
            disabled={!answers[currentIndex]}
            onClick={nextQuestion}
            className="btn-primary flex items-center gap-2 px-8"
          >
            {currentIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente'} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Quiz
