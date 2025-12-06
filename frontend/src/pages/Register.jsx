import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Cpu
} from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    expertise: '',
    organization: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const expertiseOptions = [
    'CFD / Mécanique des fluides',
    'Transfert thermique',
    'Mécanique des structures',
    'Électromagnétisme',
    'Chimie / Réacteurs',
    'Data Science / IA',
    'Développement logiciel',
    'Autre'
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Nom complet requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        expertiseArea: formData.expertise ? { primary: formData.expertise } : {}
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      setErrors({ submit: err.message || 'Erreur lors de l\'inscription' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const passwordStrength = (password) => {
    if (!password) return { score: 0, text: 'Faible', color: 'text-red-600' }
    
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    
    if (score >= 4) return { score: 4, text: 'Très fort', color: 'text-green-600' }
    if (score >= 3) return { score: 3, text: 'Fort', color: 'text-green-500' }
    if (score >= 2) return { score: 2, text: 'Moyen', color: 'text-yellow-600' }
    return { score: 1, text: 'Faible', color: 'text-red-600' }
  }

  const strength = passwordStrength(formData.password)

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Inscription réussie !
            </h2>
            <p className="text-gray-500 mb-6">
              Votre compte a été créé avec succès. Vous allez être redirigé vers la plateforme.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-3">
            <div className="relative">
              <Cpu className="h-10 w-10 text-gray-900" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Créer votre compte R&D Accelerator
          </h1>
          <p className="text-gray-500 text-lg">
            Rejoignez la plateforme d'ingénierie accélérée par IA
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-100">
          <div className="flex items-center mb-6">
            <UserPlus className="h-6 w-6 text-gray-900 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              Informations du compte
            </h2>
          </div>

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{errors.submit}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom complet */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nom complet *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Prénom Nom"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-150 ease-in-out ${
                      errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email professionnel *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-150 ease-in-out ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-150 ease-in-out ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'
                    }`}
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Force du mot de passe:</span>
                      <span className={strength.color}>{strength.text}</span>
                    </div>
                    <div className="mt-1 flex space-x-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= strength.score
                              ? strength.color === 'text-green-600' ? 'bg-green-600'
                              : strength.color === 'text-green-500' ? 'bg-green-500'
                              : strength.color === 'text-yellow-600' ? 'bg-yellow-600'
                              : 'bg-red-600'
                              : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition duration-150 ease-in-out ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Expertise et Organisation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Domaine d'expertise */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Domaine d'expertise
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-150 ease-in-out appearance-none bg-white"
                  >
                    <option value="">Sélectionnez votre expertise</option>
                    {expertiseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* Organisation */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Organisation
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Votre entreprise / université"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-150 ease-in-out"
                  />
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                required
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                J'accepte les{' '}
                <a href="#" className="font-medium text-gray-900 hover:text-blue-600 transition duration-150 ease-in-out">
                  conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="#" className="font-medium text-gray-900 hover:text-blue-600 transition duration-150 ease-in-out">
                  politique de confidentialité
                </a>{' '}
                *
              </label>
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-900/50 disabled:opacity-50 transition duration-150 ease-in-out"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          {/* Lien de connexion */}
          <div className="text-center mt-8">
            <p className="text-gray-500">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-semibold text-gray-900 hover:text-blue-600 transition duration-150 ease-in-out">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 font-medium">
            © 2024 R&D Accelerator Platform. Tous droits réservés.
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-900 transition duration-150 ease-in-out">Conditions d'utilisation</a>
            <a href="#" className="hover:text-gray-900 transition duration-150 ease-in-out">Politique de confidentialité</a>
            <a href="#" className="hover:text-gray-900 transition duration-150 ease-in-out">Support</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
