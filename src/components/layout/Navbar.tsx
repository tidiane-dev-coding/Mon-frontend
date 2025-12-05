// Barre de navigation: logo, menu horizontal, liens d'authentification et profil
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container-app">
        {/* Première ligne : Logo et authentification */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary-600" />
            <span className="font-semibold text-primary-700">Département de Mathématiques</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.name} · {user.role}</span>
                <button className="btn-secondary" onClick={logout}>Se déconnecter</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Connexion</Link>
                <Link to="/register" className="btn-primary">Inscription</Link>
              </>
            )}
          </div>
        </div>
        
        {/* Deuxième ligne : Menu de navigation horizontal */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2">
          <NavLink
            to="/"
            className={({ isActive }) => 
              `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Accueil
          </NavLink>
          <NavLink
            to="/welcome"
            className={({ isActive }) => 
              `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Bienvenue
          </NavLink>
          <NavLink
            to="/staff"
            className={({ isActive }) => 
              `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Personnel
          </NavLink>
          <NavLink
            to="/announcements"
            className={({ isActive }) => 
              `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Annonces
          </NavLink>
          <NavLink
            to="/resources"
            className={({ isActive }) => 
              `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Cours & ressources
          </NavLink>
          <NavLink
            to="/schedule"
            className={({ isActive }) => 
              `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Emploi du temps
          </NavLink>
          <NavLink
            to="/messaging"
            className={({ isActive }) => 
              `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Messagerie
          </NavLink>
          <NavLink
            to="/committee"
            className={({ isActive }) => 
              `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Comité de classe
          </NavLink>
          <NavLink
            to="/elections"
            className={({ isActive }) => 
              `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Élections
          </NavLink>
          <NavLink
            to="/grades"
            className={({ isActive }) => 
              `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Notes
          </NavLink>
          {user?.role === 'Admin' && (
            <NavLink
              to="/users"
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              Utilisateurs
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}


