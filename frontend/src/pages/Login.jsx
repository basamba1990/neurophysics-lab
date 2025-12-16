import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { 
  LogIn, 
  Mail, 
  Lock, 
  AlertCircle,
  Eye,
  EyeOff,
  Cpu
} from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('demo@example.com')
    setPassword('demo123')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="max-w-lg w-full">
        {/* Logo et Titre */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-3">
            <div className="relative">
              <Cpu className="h-10 w-10 text-accent" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-text-primary mb-2 tracking-tight">
            R&D Accelerator Platform
          </h1>
          <p className="text-text-secondary text-lg">
            Plateforme d'Ingénierie Accélérée par IA
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-surface rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-800">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            Connexion
          </h2>
          <p className="text-text-secondary mb-8">
            Connectez-vous à votre compte pour accéder à la plateforme
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-xl flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="input-field pl-10 pr-4"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-accent"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-right">
                <a href="#" className="text-sm font-medium text-text-primary hover:text-accent transition duration-150 ease-in-out">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full focus:ring-4 focus:ring-accent/50 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-text-secondary text-sm">Ou</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Bouton démo */}
          <button
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center py-3 px-4 border-2 border-gray-700 text-text-primary font-medium rounded-xl hover:bg-surface/50 transition duration-150 ease-in-out mb-4"
          >
            <Cpu className="h-5 w-5 mr-2" />
            Accéder à la version démo
          </button>

          {/* Lien d'inscription */}
          <div className="text-center mt-6">
            <p className="text-text-secondary">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-semibold text-accent hover:text-accent/80 transition duration-150 ease-in-out">
                S'inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-text-secondary font-medium">
            © 2024 R&D Accelerator Platform. Tous droits réservés.
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-xs text-text-secondary">
            <a href="#" className="hover:text-accent transition duration-150 ease-in-out">Conditions d'utilisation</a>
            <a href="#" className="hover:text-accent transition duration-150 ease-in-out">Politique de confidentialité</a>
            <a href="#" className="hover:text-accent transition duration-150 ease-in-out">Support</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
