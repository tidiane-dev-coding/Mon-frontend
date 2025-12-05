// Layout principal: barre de navigation horizontale + zone de contenu + footer
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden">
      <Navbar />
      <main className="container-app py-6 flex-grow w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}


