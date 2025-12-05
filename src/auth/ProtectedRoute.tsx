// Garde de route: vérifie la connexion et l'appartenance au rôle requis
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, type Role } from './AuthContext'

export function ProtectedRoute({ roles }: { roles: Role[] }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles.length && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}


