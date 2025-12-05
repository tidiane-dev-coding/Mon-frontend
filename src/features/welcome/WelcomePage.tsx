// Page de bienvenue: introduction au département et lien vers inscription interne
import { useState } from 'react';

export function WelcomePage() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [niveau, setNiveau] = useState('L1');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setNom('');
    setEmail('');
    setNiveau('L1');
    setMessage('');
  };

  return (
    <div className="relative w-full">
      {/* Héros avec image d'étudiants modernes dans le campus qui occupe toute la page */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ 
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
        aria-label="Bienvenue"
      >
        {/* Image de fond d'étudiants modernes dans le campus avec sacs et livres */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&auto=format&fit=crop')",
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
              Bienvenue au Département
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Rejoignez notre communauté d'étudiants passionnés par les mathématiques. 
              Une formation d'excellence vous attend dans un environnement moderne et stimulant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <a
                href="#content"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Découvrir
              </a>
              <a
                href="#inscription"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-colors duration-200 border border-white/20"
              >
                S'inscrire
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
      <div id="content" className="space-y-6">
      {/* Présentation complète du département */}
      <section className="card p-6 space-y-4">
        <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-primary-700 whitespace-nowrap">Bienvenue au Département de Mathématiques</h1>
        <p className="text-gray-700">
          Le Département de Mathématiques de l’Université de Labé propose une formation d’excellence, de la Licence au Master, dans un environnement stimulant et convivial. Nos enseignants-chercheurs accompagnent chaque étudiant dans la réussite de son projet académique et professionnel.
        </p>
        <h2 className="text-lg font-semibold text-primary-600 mt-4">Nos atouts</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Enseignement de qualité, encadrement personnalisé</li>
          <li>Corps professoral expérimenté et accessible</li>
          <li>Ouverture sur la recherche et l’innovation</li>
          <li>Vie associative et événements scientifiques</li>
        </ul>
        <h2 className="text-lg font-semibold text-primary-600 mt-4">Débouchés après la formation</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Enseignement (collège, lycée, supérieur)</li>
          <li>Recherche scientifique et doctorat</li>
          <li>Statistique, actuariat, data science</li>
          <li>Informatique, développement logiciel</li>
          <li>Banque, finance, assurance</li>
          <li>Concours administratifs et grandes écoles</li>
          <li>Ingénierie, modélisation, optimisation</li>
        </ul>
        <h2 className="text-lg font-semibold text-primary-600 mt-4">Contacts & Informations</h2>
        <ul className="text-gray-700">
          <li>Email : <a href="mailto:math@univ.com" className="text-primary-600 hover:underline">math@univ.com</a></li>
          <li>Téléphone : +224 628 31 98 00</li>
          <li>Bureau d’accueil : Bâtiment A, 1er étage</li>
        </ul>
      </section>
      {/* Formulaire d'inscription interne */}
      <section id="inscription" className="card p-6 mt-4">
        <h2 className="text-lg font-semibold text-primary-700 mb-2">Inscription interne (nouveaux étudiants)</h2>
        {submitted ? (
          <div className="text-green-700 font-medium">Merci pour votre inscription ! Nous vous contacterons prochainement.</div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium">Nom complet</label>
              <input className="mt-1 w-full rounded border-gray-300" value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre Nom" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input className="mt-1 w-full rounded border-gray-300" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre Email"  required />
            </div>
            <div>
              <label className="block text-sm font-medium">Niveau</label>
              <select className="mt-1 w-full rounded border-gray-300" value={niveau} onChange={e => setNiveau(e.target.value)}>
                <option value="L1">Licence 1</option>
                <option value="L2">Licence 2</option>
                <option value="L3">Licence 3</option>
                <option value="M1">Master 1</option>
                <option value="M2">Master 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Message (optionnel)</label>
              <textarea className="mt-1 w-full rounded border-gray-300" rows={3} value={message} onChange={e => setMessage(e.target.value)}  placeholder="Ecrivez un message"/>
            </div>
            <button className="btn-primary">Envoyer l'inscription</button>
          </form>
        )}
      </section>

      {/* Témoignages d'anciens étudiants */}
      <section className="card p-6 mt-4">
        <h2 className="text-lg font-semibold text-primary-700 mb-2">Témoignages d'anciens étudiants</h2>
        <div className="space-y-3">
          <blockquote className="border-l-4 border-primary-500 pl-4 text-gray-700 italic">
            "Grâce au département, j'ai pu intégrer un master en data science et décrocher un stage dans une grande entreprise. L'accompagnement des professeurs a été déterminant !"
            <div className="mt-1 text-sm text-gray-500">— Awa, diplômée 2023</div>
          </blockquote>
          <blockquote className="border-l-4 border-primary-500 pl-4 text-gray-700 italic">
            "L'ambiance de travail et la vie associative m'ont permis de m'épanouir et de réussir mes études. Je recommande vivement ce département !"
            <div className="mt-1 text-sm text-gray-500">— Mamadou, diplômé 2022</div>
          </blockquote>
        </div>
      </section>

      {/* FAQ pour les nouveaux étudiants */}
      <section className="card p-6 mt-4">
        <h2 className="text-lg font-semibold text-primary-700 mb-2">Questions fréquentes (FAQ)</h2>
        <ul className="space-y-2 text-gray-700">
          <li>
            <span className="font-semibold">Comment s’inscrire ?</span><br />
            Remplissez le formulaire ci-dessus ou contactez le secrétariat du département.
          </li>
          <li>
            <span className="font-semibold">Quels sont les horaires de cours ?</span><br />
            Les cours ont lieu du lundi au vendredi, généralement de 9h à 17h.
          </li>
          <li>
            <span className="font-semibold">Peut-on faire un double cursus ?</span><br />
            Oui, sous conditions. Renseignez-vous auprès de la scolarité.
          </li>
          <li>
            <span className="font-semibold">Y a-t-il des activités extra-scolaires ?</span><br />
            Oui, clubs, conférences, sorties et événements sont régulièrement organisés.
          </li>
        </ul>
      </section>
      </div>
    </div>
  )
}


