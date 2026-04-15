import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [studentSession, setStudentSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for student session in localStorage
    const savedSession = localStorage.getItem('student_session')
    if (savedSession) {
      setStudentSession(JSON.parse(savedSession))
    }

    // Check active Supabase sessions (Teacher)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else if (!savedSession) setLoading(false)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        if (!localStorage.getItem('student_session')) setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (id) => {
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) setProfile(data)
    setLoading(false)
  }

  const loginAsStudent = async (grupo) => {
    // Create a new entry in seguimiento for this student
    const tempName = `Estudiante-${Math.random().toString(36).substring(7)}`
    
    const { data, error } = await supabase
      .from('seguimiento')
      .insert([
        { 
          grupo, 
          nombre_estudiante: tempName,
          fase_actual: 1 
        }
      ])
      .select()
      .single()

    if (error) throw error

    const session = { 
      id: data.id, 
      grupo: data.grupo, 
      nombre_estudiante: data.nombre_estudiante,
      role: 'estudiante'
    }
    
    setStudentSession(session)
    localStorage.setItem('student_session', JSON.stringify(session))
    return session
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setStudentSession(null)
    localStorage.removeItem('student_session')
  }

  const isTeacher = user?.email === 'ricardoaldo@unisabana.edu.co'

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      studentSession, 
      loading, 
      loginAsStudent, 
      logout,
      isTeacher,
      role: isTeacher ? 'docente' : (studentSession ? 'estudiante' : null)
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
