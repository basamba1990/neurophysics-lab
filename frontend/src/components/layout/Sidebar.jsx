import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Cpu, Code2, Network, BarChart3, Users, Settings } from 'lucide-react'

const navItems = [
  { name: 'Espace de Travail', icon: Home, path: '/' },
  { name: 'Simulations PINN', icon: Cpu, path: '/simulations' },
  { name: 'Scientific Copilot', icon: Code2, path: '/copilot' },
  { name: 'Digital Twins', icon: Network, path: '/digital-twins' },
  { name: 'Analytics', icon: BarChart3, path: '/usage' },
  { name: 'Équipe', icon: Users, path: '/team' },
  { name: 'Paramètres', icon: Settings, path: '/settings' },
]

const Sidebar = ({ open, onClose }) => {
  const location = useLocation()

  return (
    <>
      {/* Overlay pour mobile */}
      {open && (
        <div 
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden" 
          onClick={onClose}
        ></div>
      )}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <span className="text-xl font-semibold">R&D Accelerator</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose} // Fermer la sidebar après la navigation sur mobile
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
