// Barre latérale: navigation entre les principales fonctionnalités, filtrée par rôle
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

function Item({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `block rounded px-3 py-2 text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
    >
      {label}
    </NavLink>
  )
}

export function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="card p-4 h-max sticky top-6">
      <nav className="space-y-1">
        <Item to="/" label="Accueil" />
        <Item to="/welcome" label="Bienvenue" />
        <Item to="/staff" label="Personnel" />
        <Item to="/announcements" label="Annonces" />
        <Item to="/resources" label="Cours & ressources" />
        <Item to="/schedule" label="Emploi du temps" />
        <Item to="/messaging" label="Messagerie" />
        <Item to="/committee" label="Comité de classe" />
        <Item to="/elections" label="Élections" />
        <Item to="/grades" label="Notes" />
        {user?.role === 'Admin' && <Item to="/users" label="Utilisateurs" />}
      </nav>
    </aside>
  )
}


