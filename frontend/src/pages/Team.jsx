import React, { useState } from 'react'
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Star,
  Award,
  Briefcase,
  Globe,
  MessageSquare,
  Video,
  FileText,
  MoreVertical
} from 'lucide-react'

const Team = () => {
  const [activeTab, setActiveTab] = useState('members')

  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      role: 'Lead CFD Engineer',
      email: 'sarah.chen@example.com',
      phone: '+1 (555) 123-4567',
      expertise: ['CFD', 'Thermodynamics', 'Python'],
      projects: 5,
      contributions: 42,
      avatarColor: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Prof. Alex Rodriguez',
      role: 'Physics Specialist',
      email: 'alex.rodriguez@example.com',
      phone: '+1 (555) 987-6543',
      expertise: ['Numerical Methods', 'Fortran', 'HPC'],
      projects: 3,
      contributions: 28,
      avatarColor: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Dr. Maria Schmidt',
      role: 'AI Research Scientist',
      email: 'maria.schmidt@example.com',
      phone: '+49 123 456789',
      expertise: ['Machine Learning', 'TensorFlow', 'Data Science'],
      projects: 4,
      contributions: 35,
      avatarColor: 'bg-purple-500'
    },
    {
      id: 4,
      name: 'James Wilson',
      role: 'Software Engineer',
      email: 'james.wilson@example.com',
      phone: '+44 20 1234 5678',
      expertise: ['React', 'Node.js', 'Database Design'],
      projects: 2,
      contributions: 19,
      avatarColor: 'bg-orange-500'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      user: 'Sarah Chen',
      action: 'a terminé la simulation "Turbine Optimization"',
      time: 'Il y a 2 heures',
      type: 'simulation'
    },
    {
      id: 2,
      action: 'Nouveau projet "Hydrogen Reactor Analysis" créé',
      time: 'Il y a 4 heures',
      type: 'project'
    },
    {
      id: 3,
      user: 'Alex Rodriguez',
      action: 'a modernisé 3 fichiers Fortran',
      time: 'Il y a 6 heures',
      type: 'code'
    },
    {
      id: 4,
      user: 'Maria Schmidt',
      action: 'a publié de nouveaux résultats d\'optimisation',
      time: 'Il y a 1 jour',
      type: 'results'
    }
  ]

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Équipe R&D</h1>
              <p className="text-gray-600 mt-2">
                Gérez votre équipe et collaborez efficacement
              </p>
            </div>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <UserPlus className="h-5 w-5 mr-2" />
          Inviter un membre
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Team Members */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {['members', 'projects', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab === 'members' && 'Membres'}
                    {tab === 'projects' && 'Projets'}
                    {tab === 'analytics' && 'Analytiques'}
                  </button>
                ))}
              </nav>
            </div>

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className={`${member.avatarColor} h-12 w-12 rounded-full flex items-center justify-center text-white font-bold`}>
                            {getInitials(member.name)}
                          </div>
                          <div className="ml-4">
                            <h3 className="font-semibold text-gray-900">{member.name}</h3>
                            <p className="text-sm text-gray-600">{member.role}</p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {member.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {member.phone}
                        </div>
                      </div>

                      {/* Expertise */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          {member.expertise.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{member.projects}</p>
                          <p className="text-gray-600">Projets</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{member.contributions}</p>
                          <p className="text-gray-600">Contributions</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">4.8</p>
                          <p className="text-gray-600">Évaluation</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 mt-4">
                        <button className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </button>
                        <button className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
                          <Video className="h-4 w-4 mr-1" />
                          Appel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Collaboration Tools */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Outils de collaboration
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Chat</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Video className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Visioconférence</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Documents partagés</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Briefcase className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium">Tâches</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Activity and Stats */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activité récente
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">
                      {activity.user && <span className="font-medium">{activity.user} </span>}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Statistiques de l'équipe
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Productivité globale</span>
                  <span className="font-medium text-gray-900">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Simulations terminées</span>
                  <span className="font-medium text-gray-900">42</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Collaboration</span>
                  <span className="font-medium text-gray-900">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Awards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 text-yellow-500 mr-2" />
              Récompenses d'équipe
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium">Top Contributor</span>
                </div>
                <span className="text-sm text-gray-600">Dr. Sarah Chen</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium">Innovation Award</span>
                </div>
                <span className="text-sm text-gray-600">Prof. Alex Rodriguez</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Team
