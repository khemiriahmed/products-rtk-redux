/* =====================================================================
   ÉTAPE 1 — productsApi.js  (la couche « réseau »)
   ---------------------------------------------------------------------
   RÔLE : uniquement faire des appels HTTP. Aucune logique Redux ici.
   POURQUOI SÉPARER ?
     - Si demain tu remplaces DummyJSON par ton backend Laravel/Spring,
       tu modifies CE fichier seulement (slice et composants ne bougent pas).
     - C'est facile à tester et à mocker.
   ===================================================================== */

// URL de base : évite de répéter l'adresse partout.
// En vrai projet on la met dans un fichier .env (import.meta.env.VITE_API_URL).
const BASE_URL = 'https://dummyjson.com/products';

/**
 * Petite fonction générique qui enveloppe fetch().
 * Pourquoi ? fetch() NE lance PAS d'erreur sur un 404/500 :
 * il faut vérifier res.ok nous-mêmes, sinon on croit que tout va bien.
 */
async function request(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' }, // on envoie du JSON
    ...options, // method, body... fournis par l'appelant
  });

  // Si le serveur répond une erreur (404, 500...), on lance une exception.
  // Elle sera attrapée par le thunk (try/catch) dans le slice.
  if (!res.ok) throw new Error(`Erreur API (${res.status})`);

  return res.json(); // on convertit la réponse en objet JS
}

// On exporte un objet avec une méthode par opération CRUD.
export const productsApi = {
  // READ — récupérer tous les produits
  getAll: async () => {
    // limit=0  -> DummyJSON renvoie TOUS les produits (194) en une requête
    // select=… -> on ne demande que les champs utiles (réponse plus légère)
    const data = await request(
      `${BASE_URL}?limit=0&select=title,price,thumbnail,category,stock,brand`
    );
    // DummyJSON répond { products: [...], total, skip, limit } : on ne garde que le tableau.
    return data.products;
  },

  // CREATE — POST /products/add
  create: (body) =>
    request(`${BASE_URL}/add`, { method: 'POST', body: JSON.stringify(body) }),

  // UPDATE — PUT /products/:id
  update: (id, body) =>
    request(`${BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // DELETE — DELETE /products/:id
  remove: (id) => request(`${BASE_URL}/${id}`, { method: 'DELETE' }),
};
