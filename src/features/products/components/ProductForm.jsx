/* =====================================================================
   ÉTAPE 8 — ProductForm.jsx  (formulaire créer / modifier)
   ---------------------------------------------------------------------
   Un seul formulaire pour les 2 cas :
     - product = null      -> mode CRÉATION
     - product = {objet}   -> mode MODIFICATION (champs pré-remplis)
   ===================================================================== */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct } from '../productsSlice';

// Valeurs de départ en mode création (chaînes vides = inputs contrôlés).
const empty = { title: '', price: '', stock: '', category: '', thumbnail: '' };

// Validation côté client : renvoie un objet { champ: 'message' }.
// (Le serveur doit AUSSI valider : ne jamais faire confiance au client seul.)
function validate(v) {
  const errors = {};
  if (!v.title.trim()) errors.title = 'Titre obligatoire';
  if (v.price === '' || Number(v.price) < 0) errors.price = 'Prix invalide';
  if (v.stock !== '' && Number(v.stock) < 0) errors.stock = 'Stock invalide';
  if (!v.category.trim()) errors.category = 'Catégorie obligatoire';
  return errors;
}

export default function ProductForm({ product, onClose }) {
  const dispatch = useDispatch();
  const isEdit = Boolean(product); // true si on modifie

  // State LOCAL du formulaire : pas besoin de Redux pour une saisie en cours.
  const [values, setValues] = useState(
    isEdit
      ? {
          title: product.title,
          price: product.price,
          stock: product.stock ?? '',
          category: product.category,
          thumbnail: product.thumbnail ?? '',
        }
      : empty
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false); // bloque le double-clic

  // Un seul handler pour tous les champs : on utilise l'attribut name="…"
  // de l'input comme clé. [e.target.name] = « clé dynamique ».
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault(); // empêche le rechargement de la page

    // 1) Validation
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return; // erreurs -> on s'arrête

    // 2) Conversion des types : les inputs donnent des STRINGS, l'API veut des nombres
    const body = {
      ...values,
      price: Number(values.price),
      stock: values.stock === '' ? 0 : Number(values.stock),
    };

    // 3) Dispatch du bon thunk selon le mode
    setSubmitting(true);
    const action = isEdit
      ? updateProduct({ id: product.id, changes: body, local: product.local })
      : createProduct(body);

    // `await dispatch(thunk)` renvoie l'action finale (fulfilled OU rejected).
    // Si rejected, elle contient la clé `error` -> on laisse le modal ouvert
    // (le message d'erreur s'affiche dans la page grâce au slice).
    const result = await dispatch(action);
    setSubmitting(false);
    if (!result.error) onClose();
  };

  // Petite fonction qui génère un champ (évite de répéter 5 fois le même JSX).
  const field = (name, label, type = 'text') => (
    <label className="field">
      {label}
      <input className="input" name={name} type={type} value={values[name]} onChange={onChange} step="any" />
      {errors[name] && <span className="error">{errors[name]}</span>}
    </label>
  );

  return (
    // Clic sur le fond sombre = fermer le modal
    <div className="overlay" onClick={onClose}>
      {/* stopPropagation : un clic DANS le formulaire ne doit pas le fermer.
          noValidate : on désactive la validation native du navigateur
          pour utiliser la nôtre. */}
      <form className="modal" onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} noValidate>
        <h2>{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h2>
        {field('title', 'Titre')}
        {field('price', 'Prix', 'number')}
        {field('stock', 'Stock', 'number')}
        {field('category', 'Catégorie')}
        {field('thumbnail', 'URL image')}
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? 'Envoi…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
