// Page de profil utilisateur: affichage des informations et actions liées au compte
export function UserProfilePage() {
  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm"
        aria-label="Profil utilisateur"
      >
        <div
          className="h-[200px] w-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600&auto=format&fit=crop')" }}
        >
          <div className="h-full w-full bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex items-end p-6">
          <h1 className="text-2xl font-semibold text-white">Profil</h1>
        </div>
      </section>
      {/* Carte de contenu: détails du profil */}
      <div className="card p-6">
        <h1 className="text-xl font-semibold text-primary-700">Profil utilisateur</h1>
        <p className="text-gray-600 mt-2">Photo, informations personnelles, et actions.</p>
      </div>
    </div>
  )
}


