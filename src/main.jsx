/* =====================================================================
   ÉTAPE 4 — main.jsx  (point d'entrée de l'application)
   ---------------------------------------------------------------------
   C'est le premier fichier JS exécuté (référencé dans index.html).
   Il monte React dans <div id="root"> et fournit le store à toute l'app.
   ===================================================================== */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import ProductsPage from './features/products/ProductsPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode : en dev, React exécute certains effets 2 fois pour détecter
  // les bugs. C'est pour ça qu'on a "condition" dans fetchProducts.
  <React.StrictMode>
    {/* Provider rend le store accessible à TOUS les composants enfants
        via useSelector (lire) et useDispatch (envoyer des actions). */}
    <Provider store={store}>
      <ProductsPage />
    </Provider>
  </React.StrictMode>
);
