# Products – Redux Toolkit + DummyJSON (version commentée)

    npm install
    npm run dev

## Ordre de lecture conseillé (du plus bas niveau au plus haut)

1. src/features/products/productsApi.js      -> parler au serveur (HTTP)
2. src/features/products/productsSlice.js    -> le cerveau : state + actions + selectors
3. src/app/store.js                          -> brancher le slice dans Redux
4. src/main.jsx                              -> donner le store à React (Provider)
5. src/hooks/useDebounce.js                  -> petit hook utilitaire
6. src/features/products/components/SearchBar.jsx
7. src/features/products/components/ProductTable.jsx
8. src/features/products/components/ProductForm.jsx
9. src/features/products/ProductsPage.jsx    -> la page qui assemble tout

## Flux de données (à retenir)

  UI (clic) --dispatch--> thunk --> API --> reducer (slice) --> store --> selector --> UI
