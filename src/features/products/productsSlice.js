/* =====================================================================
   ÉTAPE 2 — productsSlice.js  (le cerveau de la feature)
   ---------------------------------------------------------------------
   Un « slice » = un morceau du state global + les actions qui le modifient.
   Ce fichier contient 5 parties :
     A. l'adapter et l'état initial
     B. les thunks (actions asynchrones = appels API)
     C. le slice (reducers synchrones + extraReducers)
     D. l'export des actions
     E. les selectors (lire / calculer des données depuis le state)
   ===================================================================== */
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { productsApi } from './productsApi';

/* ---------------------------------------------------------------------
   A. ADAPTER + ÉTAT INITIAL
   --------------------------------------------------------------------- */

// createEntityAdapter gère une collection « normalisée » :
//    { ids: [1, 2, 3], entities: { 1: {...}, 2: {...}, 3: {...} } }
// Avantages : accès/modif par id en O(1) (pas de .find() dans un tableau),
// et il nous fournit des fonctions prêtes : addOne, updateOne, removeOne, setAll…
// Par défaut il utilise la propriété « id » de chaque objet comme clé.
const adapter = createEntityAdapter();

// getInitialState() renvoie { ids: [], entities: {} } + nos champs personnalisés.
const initialState = adapter.getInitialState({
  status: 'idle',   // état du chargement : idle | loading | succeeded | failed
  error: null,      // message d'erreur à afficher (ou null)
  query: '',        // texte de la recherche
  category: 'all',  // filtre de catégorie
  page: 1,          // page courante de la pagination
  pageSize: 10,     // nombre de lignes par page
});

/* ---------------------------------------------------------------------
   B. THUNKS (actions asynchrones)
   ---------------------------------------------------------------------
   createAsyncThunk('nom', fonctionAsync) génère AUTOMATIQUEMENT 3 actions :
     - nom/pending    -> la requête démarre
     - nom/fulfilled  -> succès (le return de la fonction = action.payload)
     - nom/rejected   -> erreur
   On les écoute ensuite dans extraReducers (partie C).

   NOTE DummyJSON : les écritures sont SIMULÉES (rien n'est sauvegardé).
   On appelle quand même l'API (comme avec un vrai backend), puis on met
   à jour le store avec le résultat.
   --------------------------------------------------------------------- */

// READ ---------------------------------------------------------------
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  // 1er argument (_) : paramètre passé au dispatch (ici aucun)
  // 2e argument : "thunkAPI" — on en extrait rejectWithValue
  async (_, { rejectWithValue }) => {
    try {
      return await productsApi.getAll(); // -> devient action.payload
    } catch (e) {
      // rejectWithValue permet de renvoyer un message propre dans action.payload
      return rejectWithValue(e.message);
    }
  },
  {
    // "condition" : si elle renvoie false, le thunk n'est PAS exécuté.
    // Ici : on n'appelle pas l'API si un chargement est déjà en cours
    // (évite le double appel de React.StrictMode en développement).
    condition: (_, { getState }) => getState().products.status !== 'loading',
  }
);

// CREATE -------------------------------------------------------------
export const createProduct = createAsyncThunk(
  'products/create',
  async (values, { rejectWithValue }) => {
    try {
      const created = await productsApi.create(values);
      // DummyJSON renvoie TOUJOURS le même id (195) -> collisions dans le store.
      // On génère donc un id unique côté client et on marque le produit "local".
      // Avec un vrai backend : return created; (l'id vient du serveur).
      return { ...created, id: Date.now(), local: true };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// UPDATE -------------------------------------------------------------
export const updateProduct = createAsyncThunk(
  'products/update',
  // On reçoit un seul objet (un thunk n'accepte qu'UN argument) : { id, changes, local }
  async ({ id, changes, local }, { rejectWithValue }) => {
    try {
      // Un produit "local" n'existe pas sur le serveur -> un PUT donnerait 404.
      // On saute donc l'appel API pour lui.
      const updated = local ? {} : await productsApi.update(id, changes);
      // Format attendu par adapter.updateOne : { id, changes: {champs modifiés} }
      return { id, changes: { ...changes, ...updated, id } };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// DELETE -------------------------------------------------------------
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async ({ id, local }, { rejectWithValue }) => {
    try {
      if (!local) await productsApi.remove(id); // même logique que update
      return id; // on renvoie l'id pour que le reducer sache quoi supprimer
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

/* ---------------------------------------------------------------------
   C. LE SLICE
   --------------------------------------------------------------------- */
const productsSlice = createSlice({
  name: 'products', // préfixe des types d'actions : "products/setQuery", etc.
  initialState,

  // reducers = actions SYNCHRONES (pas d'API). Chacune génère un action creator.
  // Grâce à Immer, on peut « muter » state directement : RTK le transforme
  // en mise à jour immuable en coulisses.
  reducers: {
    setQuery(state, { payload }) {
      state.query = payload;
      state.page = 1; // nouvelle recherche => retour à la page 1
    },
    setCategory(state, { payload }) {
      state.category = payload;
      state.page = 1;
    },
    setPage(state, { payload }) {
      state.page = payload;
    },
    clearError(state) {
      state.error = null;
    },
  },

  // extraReducers = réagir à des actions définies AILLEURS (ici : les thunks).
  extraReducers: (builder) => {
    builder
      // --- Chargement de la liste ---
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        adapter.setAll(state, payload); // remplace toute la collection
      })
      .addCase(fetchProducts.rejected, (state, { payload, error }) => {
        state.status = 'failed';
        // payload = message de rejectWithValue ; error.message = erreur brute
        state.error = payload ?? error.message;
      })

      // --- CRUD : on utilise les fonctions de l'adapter ---
      .addCase(createProduct.fulfilled, (state, { payload }) => {
        adapter.addOne(state, payload); // ajoute un produit
      })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        adapter.updateOne(state, payload); // { id, changes }
      })
      .addCase(deleteProduct.fulfilled, (state, { payload }) => {
        adapter.removeOne(state, payload); // payload = id
      })

      // addMatcher : une seule règle pour plusieurs actions.
      // Ici : toute erreur (create/update/delete) remplit state.error.
      // (fetchAll est déjà géré plus haut avec status = 'failed').
      .addMatcher(
        (a) =>
          a.type.startsWith('products/') &&
          a.type.endsWith('/rejected') &&
          !a.type.includes('fetchAll'),
        (state, { payload, error }) => {
          state.error = payload ?? error.message;
        }
      );
  },
});

/* ---------------------------------------------------------------------
   D. EXPORTS : actions synchrones + reducer
   --------------------------------------------------------------------- */
export const { setQuery, setCategory, setPage, clearError } = productsSlice.actions;
export default productsSlice.reducer; // sera branché dans le store

/* ---------------------------------------------------------------------
   E. SELECTORS — « lire » le state
   ---------------------------------------------------------------------
   Règle pro : les composants ne connaissent PAS la forme du state.
   Ils utilisent des selectors. Si la structure change, on corrige ici seulement.
   --------------------------------------------------------------------- */

// getSelectors fabrique selectAll, selectById, selectIds, selectTotal…
// On lui dit où se trouve notre slice dans le state global : state.products
const selectors = adapter.getSelectors((state) => state.products);
export const selectAllProducts = selectors.selectAll; // renvoie un tableau

// Selectors simples
export const selectStatus = (s) => s.products.status;
export const selectError = (s) => s.products.error;
export const selectQuery = (s) => s.products.query;
export const selectCategory = (s) => s.products.category;
export const selectPage = (s) => s.products.page;

// createSelector = selector MÉMOÏSÉ : le calcul n'est refait que si les
// entrées ont changé. Sinon il renvoie le résultat précédent (même référence),
// ce qui évite des re-rendus inutiles.

// Liste unique des catégories, triées (pour le <select>)
export const selectCategories = createSelector([selectAllProducts], (items) =>
  [...new Set(items.map((p) => p.category))].sort()
);

// Produits filtrés par recherche + catégorie
export const selectFilteredProducts = createSelector(
  [selectAllProducts, selectQuery, selectCategory], // entrées
  (items, query, category) => {                     // calcul
    const q = query.trim().toLowerCase();
    return items.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q ||
          p.title.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)) // ?. = au cas où brand est absent
    );
  }
);

// Pagination calculée à partir des produits filtrés
export const selectPagination = createSelector(
  [selectFilteredProducts, selectPage, (s) => s.products.pageSize],
  (filtered, page, pageSize) => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const current = Math.min(page, totalPages); // sécurité si on supprime des éléments
    return {
      items: filtered.slice((current - 1) * pageSize, current * pageSize), // la page visible
      total: filtered.length,
      page: current,
      totalPages,
    };
  }
);
