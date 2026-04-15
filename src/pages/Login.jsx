import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Activity, Mail, Lock, Users, GraduationCap, ShieldCheck } from 'lucide-react'

const Login = () => {
  const { loginAsStudent } = useAuth()
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [group, setGroup] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleStudentLogin = async (e) => {
    e.preventDefault()
    if (!group) return
    setLoading(true)
    setError(null)
    try {
      await loginAsStudent(group)
    } catch (err) {
      setError('Error al ingresar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTeacherLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (loginError) throw loginError
    } catch (err) {
      setError('Credenciales inválidas: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#0c0f16] to-[#1a2130]">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in border border-white/10 shadow-2xl">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-accent-primary/20 p-3 rounded-2xl mr-3">
            <Activity className="text-accent-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Médica<span className="text-accent-primary">Base</span></h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-8">
          <button 
            onClick={() => { setIsAdminMode(false); setError(null); }}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center transition-all ${!isAdminMode ? 'bg-accent-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
          >
            <GraduationCap size={18} className="mr-2" /> Estudiante
          </button>
          <button 
            onClick={() => { setIsAdminMode(true); setError(null); }}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center transition-all ${isAdminMode ? 'bg-accent-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
          >
            <ShieldCheck size={18} className="mr-2" /> Docente
          </button>
        </div>

        {isAdminMode ? (
          <form onSubmit={handleTeacherLogin} className="space-y-4 animate-scale-in">
            <p className="text-center text-text-secondary mb-6 text-sm">
              Acceso restringido para el personal docente
            </p>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-text-secondary" size={18} />
              <input
                className="pl-10 transition-all focus:border-accent-primary"
                type="email"
                placeholder="Email institucional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-text-secondary" size={18} />
              <input
                className="pl-10 transition-all focus:border-accent-primary"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button disabled={loading} className="btn-primary w-full py-3 text-lg font-semibold mt-6 shadow-accent-primary/20 shadow-lg">
              {loading ? 'Verificando...' : 'Entrar como Docente'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStudentLogin} className="space-y-6 animate-scale-in">
            <p className="text-center text-text-secondary mb-6 text-sm">
              Ingresa tu grupo para comenzar la evaluación
            </p>
            <div className="relative">
              <Users className="absolute left-3 top-4 text-accent-primary" size={20} />
              <input
                className="pl-12 py-4 text-xl font-bold tracking-widest text-center uppercase focus:border-accent-primary bg-white/5 transition-all"
                type="text"
                placeholder="EJ: B2"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                required
              />
            </div>
            <button disabled={loading} className="btn-primary w-full py-4 text-xl font-bold mt-4 shadow-accent-primary/20 shadow-xl border-t border-white/20">
              {loading ? 'Ingresando...' : 'EMPEZAR PRÁCTICA'}
            </button>
          </form>
        )}

        {error && <p className="text-error text-sm text-center mt-4 bg-error/10 p-3 rounded-lg border border-error/20">{error}</p>}
      </div>
      
      <p className="mt-8 text-text-secondary text-sm">
        Sistema de Evaluación de Tórax © 2026
      </p>
    </div>
  )
}

export default Login
