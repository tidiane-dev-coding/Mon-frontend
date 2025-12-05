// Page dédiée au personnel clé du département (direction et responsables)
import React from 'react'
type StaffMember = {
  name: string
  title: string
  responsibility: string
  email: string
  phone: string
  office: string
  bio: string
  focus: string[]
  photo?: string
}

const staffMembers: StaffMember[] = [
  {
    name: 'Dr. Alpha Oumar Bah',
    title: 'Chef du département',
    responsibility: 'Orientation stratégique et supervision globale',
    email: 'alpha.bahp@univ-math.edu',
    phone: '+224 627 64 62 00',
    office: 'Bâtiment I, bureau 302',
    bio: 'Spécialiste en analyse appliquée, elle coordonne l’ensemble des projets pédagogiques et de recherche.',
    focus: ['Planification académique', 'Relations institutionnelles', 'Accompagnement des enseignants'],
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop'
  },
  {
    name: 'Mme. Mariame Diallo',
    title: 'Directrice du programme ',
    responsibility: 'Qualité pédagogique et innovation pédagogique',
    email: 'souleymane.kaba@univ-math.edu',
    phone: '+224 628 31 98 00',
    office: 'Bâtiment A, bureau 214',
    bio: 'Garant de la cohérence des parcours étudiants, il travaille avec les enseignants pour améliorer l’expérience d’apprentissage.',
    focus: ['Révision des maquettes', 'Suivi des jurys', 'Accompagnement des étudiants'],
    photo: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=600&auto=format&fit=crop'
  },
  {
    name: 'Mr . Mamadou Saliou Baldé',
    title: 'Responsable administrative',
    responsibility: 'Gestion des dossiers et suivi des procédures',
    email: 'rokhaya.ndiaye@univ-math.edu',
    phone: '+224 622 31 90 78',
    office: 'Bâtiment B, guichet central',
    bio: 'Référence pour toutes les démarches administratives des étudiants et du personnel.',
    focus: ['Inscriptions', 'Contrats enseignants', 'Support logistique'],
    photo: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=600&auto=format&fit=crop'
  },
  {
    name: 'M. Idrissa Bah',
    title: 'Coordinateur des stages & partenariats',
    responsibility: 'Insertion professionnelle et partenariats entreprises',
    email: 'idrissa.bah@univ-math.edu',
    phone: '+221 77 000 00 04',
    office: 'Bâtiment C, bureau 118',
    bio: 'Anime le réseau d’anciens et aide les étudiants à trouver des stages pertinents.',
    focus: ['Partenariats entreprises', 'Suivi des conventions', 'Organisation de forums'],
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop'
  }
]

export function StaffPage() {
  return (
    <div className="relative w-full">
      {/* Hero immersif pleine largeur */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl"
        style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
        aria-label="Équipe du département"
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&auto=format&fit=crop')",
            width: '100vw',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-primary-900/70 to-primary-950/80" />
          <div className="absolute right-10 top-10 w-48 h-48 bg-white/5 blur-3xl rounded-full" />
          <div className="absolute left-10 bottom-10 w-40 h-40 bg-primary-300/10 blur-3xl rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6">
          <p className="text-sm uppercase tracking-[0.4rem] text-primary-200">Direction & support</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Les personnes ressources du département</h1>
          <p className="text-lg md:text-xl text-white/85">
            Un annuaire clair pour joindre rapidement la direction, la coordination pédagogique et l’appui administratif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <a
              href="#staff-directory"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 transition-colors duration-200 rounded-lg font-semibold shadow-lg"
            >
              Voir les membres
            </a>
            <a
              href="#contact-staff"
              className="px-6 py-3 border border-white/40 hover:bg-white/10 rounded-lg font-semibold"
            >
              Contacter le secrétariat
            </a>
          </div>
        </div>
      </section>

      <div id="staff-directory" className="container-app py-12 space-y-10">
        <header className="card p-8 bg-gradient-to-r from-primary-50 to-white border-primary-100 relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-48 bg-primary-100/60 blur-3xl" />
          <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">Personnel du département</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">L’équipe dirigeante & support</h2>
          <p className="mt-4 text-gray-600 max-w-3xl">
            Retrouvez les membres clés qui pilotent le département, leur rôle précis ainsi que les canaux de contact pour
            orienter vos demandes. Cette page est statique : modifiez simplement les informations ci-dessous selon vos besoins.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-bold text-primary-700">4+</p>
              <p className="text-gray-500 text-sm">Profils ajoutés</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-700">100%</p>
              <p className="text-gray-500 text-sm">Contact direct</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-700">24h</p>
              <p className="text-gray-500 text-sm">Délai moyen de réponse</p>
            </div>
          </div>
        </header>

        <section aria-label="Membres du personnel" className="grid gap-6 md:grid-cols-2">
          {staffMembers.map((member) => (
            <article key={member.email} className="card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-inner">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={`Portrait de ${member.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-semibold">
                      {member.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-primary-600 font-semibold">{member.title}</p>
                  <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
                  <p className="text-gray-600">{member.responsibility}</p>
                </div>
              </div>

              <p className="text-gray-700">{member.bio}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Contact</p>
                  <p className="text-gray-900 font-medium">{member.email}</p>
                  <p className="text-gray-900 font-medium">{member.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Lieu d’accueil</p>
                  <p className="text-gray-900 font-medium">{member.office}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium mb-2">Focus prioritaires</p>
                <ul className="flex flex-wrap gap-2">
                  {member.focus.map((item) => (
                    <li key={item} className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        <section
          id="contact-staff"
          className="card p-8 bg-gradient-to-r from-white to-gray-50 border-dashed border-2 border-gray-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">Besoin d’un rendez-vous ?</p>
            <h3 className="mt-2 text-2xl font-semibold text-gray-900">Parlez directement au secrétariat</h3>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Envoyez un message ou planifiez un créneau pour être orienté vers la bonne personne (direction, programme, administratif).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:secretariat.math@univ-math.edu" className="btn-primary">secretariat.math@univ-math.edu</a>
            <a href="tel:+221770000005" className="btn-secondary">+224 628 31 98 00</a>
          </div>
        </section>
      </div>
    </div>
  )
}


