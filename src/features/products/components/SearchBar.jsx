/* =====================================================================
   ÉTAPE 6 — SearchBar.jsx  (champ de recherche)
   ---------------------------------------------------------------------
   Deux niveaux de state :
     - `value`      : state LOCAL, mis à jour à chaque frappe (l'input reste fluide)
     - `debounced`  : la valeur « calmée », envoyée à Redux
   On ne met dans Redux que ce qui est utile globalement (la requête finale).
   ===================================================================== */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from '../../../hooks/useDebounce';
import { setQuery } from '../productsSlice';

export default function SearchBar() {
  const dispatch = useDispatch(); // permet d'envoyer des actions au store
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, 300);

  // Quand la valeur « calmée » change -> on met à jour Redux.
  // Le selector selectFilteredProducts se recalcule, le tableau se met à jour.
  useEffect(() => {
    dispatch(setQuery(debounced));
  }, [debounced, dispatch]);

  return (
    <input
      type="search"
      className="input"
      placeholder="Rechercher un produit ou une marque…"
      value={value}                         // input « contrôlé » par React
      onChange={(e) => setValue(e.target.value)}
      aria-label="Rechercher"               // accessibilité (lecteurs d'écran)
    />
  );
}
