// Définition du routage principal et des pages protégées par rôle
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { HomePage } from './features/home/HomePage'
import { UsersPage } from './features/users/UsersPage'
import { UserProfilePage } from './features/users/UserProfilePage'
import CommitteePage from './features/committee/CommitteePage'
import { ElectionsPage } from './features/elections/ElectionsPage'
import { GradesPage } from './features/grades/GradesPage'
import { SchedulePage } from './features/schedule/SchedulePage'
import { ResourcesPage } from './features/resources/ResourcesPage'
import { MessagingPage } from './features/messaging/MessagingPage'
import { AnnouncementsPage } from './features/announcements/AnnouncementsPage'
import { StaffPage } from './features/staff/StaffPage'
import { WelcomePage } from './features/welcome/WelcomePage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<Layout /> }>
          <Route index element={<HomePage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route element={<ProtectedRoute roles={["Admin", "Professor", "Student"]} /> }>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserProfilePage />} />
            <Route path="/committee" element={<CommitteePage />} />
            <Route path="/elections" element={<ElectionsPage />} />
            <Route path="/grades" element={<GradesPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/messaging" element={<MessagingPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}


