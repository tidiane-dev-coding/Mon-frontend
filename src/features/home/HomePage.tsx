// Page d'accueil du département: présente un héros avec image d'université moderne en plein écran
export function HomePage() {
  return (
    <div className="relative w-full">
      {/* Héros avec image d'université moderne qui occupe toute la page */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ 
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
        aria-label="Présentation du département"
      >
        {/* Image de fond qui occupe toute la page de façon dynamique et fixe (ne bouge pas au scroll) */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop')",
            width: '100vw',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Overlay avec dégradé pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" />
        </div>
        
        {/* Contenu centré sur l'image */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight whitespace-nowrap">
              Département de Mathématiques
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Une plateforme moderne pour la gestion académique, les cours, les annonces et la vie du département.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <a
                href="#content"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Découvrir
              </a>
              <a
                href="/announcements"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-colors duration-200 border border-white/20"
              >
                Voir les annonces
              </a>
            </div>
          </div>
        </div>

        {/* Indicateur de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Section de contenu en dessous de l'image hero */}
      <section id="content" className="container-app py-12">
        <div className="card p-6">
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-primary-700 mb-4 whitespace-nowrap">Bienvenue au Département de Mathématiques</h2>
          <p className="text-gray-700 leading-relaxed">
            Actualités, annonces et accès rapide aux fonctionnalités. Explorez notre plateforme pour accéder à vos cours, 
            consulter vos notes, participer aux élections et bien plus encore.
          </p>
        </div>
      </section>
    </div>
  )
}


