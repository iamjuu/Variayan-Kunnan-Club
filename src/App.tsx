import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { AuthProvider } from './context/AuthContext'
import { CompetitionsPage } from './pages/admin/CompetitionsPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { AdminGalleryPage } from './pages/admin/GalleryPage'
import { LoginPage } from './pages/admin/LoginPage'
import { RegistrationsPage } from './pages/admin/RegistrationsPage'
import { SettingsPage } from './pages/admin/SettingsPage'
import { GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { SuccessPage } from './pages/SuccessPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/success" element={<SuccessPage />} />
          </Route>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="registrations" element={<RegistrationsPage />} />
            <Route path="competitions" element={<CompetitionsPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
