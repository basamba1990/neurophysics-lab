import React from 'react'
import { Bell, User } from 'lucide-react'

const Header = () => {
  return (
    <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6">
      <div className="text-lg font-medium text-gray-800">
        {/* Le titre de la page actuelle pourrait être affiché ici */}
        Tableau de Bord
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Utilisateur Test</span>
          <div className="p-2 rounded-full bg-blue-500 text-white">
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
