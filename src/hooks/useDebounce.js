/* =====================================================================
   ÉTAPE 5 — useDebounce.js  (hook personnalisé)
   ---------------------------------------------------------------------
   PROBLÈME : si on filtre à chaque frappe, taper "iphone" déclenche
   6 calculs/rendus. 
   SOLUTION : le debounce attend que l'utilisateur ARRÊTE de taper
   pendant `delay` ms avant de mettre à jour la valeur.

   Exemple : tu tapes "i","p","h" rapidement -> `debounced` reste inchangé,
   puis 300 ms après la dernière touche -> `debounced` = "iph".
   ===================================================================== */
import { useEffect, useState } from 'react';

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // On programme la mise à jour dans `delay` ms.
    const t = setTimeout(() => setDebounced(value), delay);

    // Fonction de nettoyage : si `value` change avant la fin du délai,
    // React l'exécute -> on annule l'ancien timer et on en relance un nouveau.
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
