/* =====================================================================
   ÉTAPE 7 — ProductTable.jsx  (composant d'AFFICHAGE)
   ---------------------------------------------------------------------
   Composant « présentation » (dumb component) :
     - il ne connaît PAS Redux
     - il reçoit tout par props : `items`, `onEdit`, `onDelete`
   -> réutilisable et facile à tester. C'est la page parent qui décide
      quoi faire quand on clique.
   ===================================================================== */
import { memo } from 'react';

// Intl.NumberFormat : formatage natif des monnaies (ex: 1 299,99 $US en fr-FR).
// Créé UNE fois en dehors du composant (pas recréé à chaque rendu).
const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' });

// memo : cette ligne ne se re-rend que si SES props changent.
// Si on modifie un produit, les 9 autres lignes ne sont pas recalculées.
// (Ça marche car onEdit/onDelete sont stabilisés avec useCallback dans la page.)
const Row = memo(function Row({ product, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        {/* loading="lazy" : l'image se charge quand elle approche de l'écran.
            width/height fixes : évitent le « saut » de mise en page. */}
        <img src={product.thumbnail} alt={product.title} width="48" height="48" loading="lazy" />
      </td>
      <td>
        <strong>{product.title}</strong>
        {product.brand && <div className="muted">{product.brand}</div>}
      </td>
      <td>{product.category}</td>
      <td>{money.format(product.price)}</td>
      <td>{product.stock ?? '—'}</td>
      <td className="actions">
        {/* On remonte l'événement au parent en lui passant le produit */}
        <button className="btn" onClick={() => onEdit(product)}>Modifier</button>
        <button className="btn danger" onClick={() => onDelete(product)}>Supprimer</button>
      </td>
    </tr>
  );
});

export default function ProductTable({ items, onEdit, onDelete }) {
  // Cas « liste vide » : message clair plutôt qu'un tableau vide.
  if (!items.length) return <p className="muted">Aucun produit trouvé.</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Image</th><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {/* key = identifiant STABLE et unique (jamais l'index du tableau)
            pour que React sache quelle ligne a changé. */}
        {items.map((p) => (
          <Row key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  );
}
