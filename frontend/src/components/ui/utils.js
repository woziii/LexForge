/**
 * Fonction utilitaire pour la manipulation des classes CSS
 * Combine et applique conditionnellement les classes Tailwind CSS
 * @param {...string} inputs - Noms de classes CSS ou objets de classe conditionnels
 * @returns {string} - Chaîne de classes CSS combinée
 */
export function cn(...inputs) {
  return inputs
    .filter(Boolean)
    .join(" ")
    .trim();
} 