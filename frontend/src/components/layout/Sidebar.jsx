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

const Sidebar = () => {
  const location = useLocation()

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <span className="text-xl font-semibold">R&D Accelerator</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
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
  )
}

export default Sidebar
