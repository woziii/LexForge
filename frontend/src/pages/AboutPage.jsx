import React from 'react';
import { Shield, BookOpen, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const AboutPage = () => {
  return (
    <>
      <SEO 
        title="À propos"
        description="À propos de LexForge, plateforme française dédiée à la création automatisée de contrats juridiques : droit d'auteur, droit à l'image, CGU. Une solution développée par des experts du droit pour répondre aux besoins des créateurs et entrepreneurs."
        keywords="à propos, lexforge, contrats juridiques, mission, expertise juridique, protection des droits, plateforme française, générateur automatisé, droit d'auteur, droit à l'image"
        canonical="https://www.lexforge.fr/about"
      />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">À propos de LexForge</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            LexForge est votre solution pour la création de contrats sur mesure, conçue pour simplifier la rédaction de documents légaux complexes avec une touche d'humour.
          </p>
          <p className="text-md text-amber-700 max-w-3xl mx-auto bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="font-medium">⚠️ Attention :</span> LexForge ne propose que des contrats types, adaptés à des besoins simples ne nécessitant pas d'accompagnement juridique particulier. Notre plateforme ne se substitue pas aux services d'un juriste ou d'un avocat pour les situations complexes.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre mission</h2>
          <p className="text-gray-600 mb-4">
            LexForge a été créé avec une mission claire : démocratiser l'accès aux outils juridiques professionnels. 
            Nous croyons que chacun devrait pouvoir protéger ses droits et ses créations sans avoir à engager des frais juridiques considérables.
          </p>
          <p className="text-gray-600 mb-4">
            Notre plateforme permet principalement aux startups de la tech, mais aussi aux créateurs, entrepreneurs et particuliers, de générer des contrats juridiquement solides, 
            adaptés à leurs besoins spécifiques, grâce à une interface intuitive et un processus guidé pas à pas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sécurité et confidentialité</h3>
            <p className="text-gray-600 mb-3">
              Le backend de LexForge est hébergé sur Render et le frontend sur Vercel. Nous mettons un point d'honneur sur la confidentialité et le respect de la vie privée et entrepreneuriale de nos utilisateurs. Ce qui est sur l'espace privé de l'utilisateur n'intéresse que l'utilisateur (à part s'il transfère le contrat).
            </p>
            <p className="text-gray-600 mb-3">
              Notez que cette version Bêta peut être soumise à des évolutions. Le niveau de sécurité n'est pas encore optimal, et il est fortement déconseillé, pour le moment, de laisser des informations personnelles ou confidentielles sur la plateforme.
            </p>
            <p className="text-gray-600">
              Important : LexForge est en constante évolution. Bien que nos serveurs soient désormais opérationnels en permanence pour une meilleure expérience utilisateur, nous tenons à souligner que notre plateforme est toujours en phase bêta. En tant qu'utilisateur, vous devez être conscient que la sécurité de vos données n'est pas encore garantie à 100%. Nous vous recommandons donc de faire preuve de prudence et d'éviter de partager des informations personnelles ou confidentielles jusqu'à la sortie de notre version stable.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expertise juridique</h3>
            <p className="text-gray-600 mb-4">
              Les modèles de contrats sont élaborés par un juriste et régulièrement mis à jour pour refléter les évolutions législatives et réglementaires. Chaque template a été construit avec soin pour éviter toute erreur et garantir une qualité juridique optimale.
            </p>
            <div className="mt-4">
              <Link to="/versions" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                <BookOpen size={16} className="mr-1" />
                <span>Consulter les versions et corrections</span>
              </Link>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Support utilisateur</h3>
            <p className="text-gray-600">
              Le support utilisateur est actuellement en cours de création. Nous travaillons pour vous offrir un accompagnement de qualité dans l'utilisation de notre plateforme.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mentions légales</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Éditeur</h3>
              <p className="text-gray-600">
                Lucas MAURICI
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Hébergement</h3>
              <p className="text-gray-600">
                Frontend hébergé par Vercel, backend hébergé par Render.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Propriété intellectuelle</h3>
              <p className="text-gray-600">
                L'ensemble des éléments constituant ce site (textes, graphismes, logiciels, images, etc.) 
                est la propriété exclusive de Lucas MAURICI. 
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Limitation de responsabilité</h3>
              <p className="text-gray-600">
                Les contrats générés par LexForge sont fournis à titre informatif et ne remplacent pas les conseils 
                d'un professionnel du droit. Nous recommandons de faire vérifier tout contrat par un avocat avant 
                signature, particulièrement pour les situations complexes ou à enjeux importants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage; 
