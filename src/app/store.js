/* =====================================================================
   ÉTAPE 3 — store.js  (le store global Redux)
   ---------------------------------------------------------------------
   Le store = l'unique objet qui contient tout le state de l'application.
   configureStore configure automatiquement :
     - Redux DevTools (extension navigateur pour voir les actions)
     - le middleware thunk (pour createAsyncThunk)
     - des vérifications en dev (mutations accidentelles, valeurs non sérialisables)
   ===================================================================== */
import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productsSlice';

export const store = configureStore({
  reducer: {
    // La clé "products" devient state.products.
    // Pour ajouter une feature (cart, auth…), on ajoute une ligne ici.
    products: productsReducer,
  },
});
