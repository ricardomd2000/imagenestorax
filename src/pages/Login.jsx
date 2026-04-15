import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Activity, Mail, Lock, User, Users } from 'lucide-react'

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [group, setGroup] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isRegistering) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (authError) throw authError

        const { error: profileError } = await supabase
          .from('perfiles')
          .insert([
            {
              id: authData.user.id,
              nombre_completo: fullName,
              grupo: group,
              rol: 'estudiante'
            }
          ])
        if (profileError) throw profileError
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (loginError) throw loginError
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in">
        <div className="flex items-center justify-center mb-6">
          <Activity className="text-accent-primary mr-2" size={32} />
          <h1 className="text-2xl font-bold tracking-tight">Médica<span className="text-accent-primary">Base</span></h1>
        </div>

        <p className="text-center text-text-secondary mb-8">
          {isRegistering ? 'Crea tu cuenta para comenzar la práctica' : 'Ingresa para continuar con tu evaluación'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-3 text-text-secondary" size={18} />
                <input
                  className="pl-10"
                  type="text"
                  placeholder="Nombre Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-3 text-text-secondary" size={18} />
                <input
                  className="pl-10"
                  type="text"
                  placeholder="Grupo (Ej: A1, B2)"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-text-secondary" size={18} />
            <input
              className="pl-10"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-text-secondary" size={18} />
            <input
              className="pl-10"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <button disabled={loading} className="btn-primary w-full mt-4">
            {loading ? 'Procesando...' : isRegistering ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-accent-primary hover:underline text-sm"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
