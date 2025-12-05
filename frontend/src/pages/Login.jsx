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
  Cpu,
  Code2
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo et Titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <Cpu className="h-12 w-12 text-blue-600" />
              <Code2 className="h-8 w-8 text-green-600 absolute -bottom-2 -right-2" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            R&D Accelerator Platform
          </h1>
          <p className="text-gray-600">
            Plateforme d'Ingénierie Accélérée par IA
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connexion
          </h2>
          <p className="text-gray-600 mb-6">
            Connectez-vous à votre compte pour accéder à la plateforme
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 text-right">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">Ou</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Bouton démo */}
          <button
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 mb-4"
          >
            <Cpu className="h-5 w-5 mr-2" />
            Accéder à la version démo
          </button>

          {/* Lien d'inscription */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
                S'inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 R&D Accelerator Platform. Tous droits réservés.
          </p>
          <div className="mt-2 flex justify-center space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700">Conditions d'utilisation</a>
            <a href="#" className="hover:text-gray-700">Politique de confidentialité</a>
            <a href="#" className="hover:text-gray-700">Support</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
