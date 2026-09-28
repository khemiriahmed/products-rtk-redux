/* =====================================================================
   ÉTAPE 9 — ProductsPage.jsx  (la page « conteneur »)
   ---------------------------------------------------------------------
   C'est le chef d'orchestre :
     - LIT le state Redux (useSelector)
     - ENVOIE des actions (useDispatch)
     - garde le state d'UI local (modal ouvert ? quel produit édité ?)
     - assemble les composants enfants (SearchBar, ProductTable, ProductForm)
   Pattern « container / presentational » très courant en entreprise.
   ===================================================================== */
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts, deleteProduct, setCategory, setPage, clearError,
  selectStatus, selectError, selectCategory, selectCategories, selectPagination,
} from './productsSlice';
import SearchBar from './components/SearchBar';
import ProductTable from './components/ProductTable';
import ProductForm from './components/ProductForm';

export default function ProductsPage() {
  const dispatch = useDispatch();

  // --- LIRE le state Redux via des selectors ---
  // useSelector re-rend le composant SEULEMENT si la valeur sélectionnée change.
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const category = useSelector(selectCategory);
  const categories = useSelector(selectCategories);
  const { items, total, page, totalPages } = useSelector(selectPagination);

  // --- State LOCAL d'interface (pas besoin de Redux pour ça) ---
  const [formOpen, setFormOpen] = useState(false); // modal visible ?
  const [editing, setEditing] = useState(null);    // null = création, objet = modification

  // Au premier affichage, on charge les produits depuis l'API.
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };

  // useCallback : garde la MÊME référence de fonction entre les rendus.
  // Sans ça, `memo` sur les lignes du tableau serait inutile (nouvelle fonction
  // à chaque rendu = props « différentes »).
  const openEdit = useCallback((p) => { setEditing(p); setFormOpen(true); }, []);

  const onDelete = useCallback(
    (p) => {
      // Confirmation avant une action destructive.
      if (window.confirm(`Supprimer « ${p.title} » ?`)) {
        dispatch(deleteProduct({ id: p.id, local: p.local }));
      }
    },
    [dispatch]
  );

  return (
    <main className="container">
      <header className="header">
        <h1>Produits <span className="muted">({total})</span></h1>
        <button className="btn primary" onClick={openCreate}>+ Ajouter</button>
      </header>

      {/* Barre d'outils : recherche + filtre catégorie */}
      <div className="toolbar">
        <SearchBar />
        <select className="input" value={category} onChange={(e) => dispatch(setCategory(e.target.value))}>
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Erreur de mutation (create/update/delete) avec bouton pour la fermer */}
      {error && (
        <div className="alert" role="alert">
          {error} <button className="btn" onClick={() => dispatch(clearError())}>OK</button>
        </div>
      )}

      {/* Affichage selon l'état du chargement : c'est ce qu'on appelle
          gérer les « états de la requête » (loading / error / success). */}
      {status === 'loading' && <p>Chargement…</p>}
      {status === 'failed' && <button className="btn" onClick={() => dispatch(fetchProducts())}>Réessayer</button>}
      {status === 'succeeded' && (
        <>
          <ProductTable items={items} onEdit={openEdit} onDelete={onDelete} />
          <nav className="pagination">
            <button className="btn" disabled={page <= 1} onClick={() => dispatch(setPage(page - 1))}>←</button>
            <span>Page {page} / {totalPages}</span>
            <button className="btn" disabled={page >= totalPages} onClick={() => dispatch(setPage(page + 1))}>→</button>
          </nav>
        </>
      )}

      {/* Le modal n'est monté que s'il est ouvert.
          `product={editing}` : null -> création, objet -> modification. */}
      {formOpen && <ProductForm product={editing} onClose={() => setFormOpen(false)} />}
    </main>
  );
}
