import { useState } from 'react'
import { Link } from 'react-router-dom'
import DataState from '../components/DataState.jsx'
import PageTitle from '../components/PageTitle.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductFormModal from '../components/ProductFormModal.jsx'
import { useProducts } from '../context/ProductsContext.jsx'

export default function Favorites() {
  const { products, loading, error, reload, toggleFavorite, updateProduct, deleteProduct } = useProducts()
  const [editing, setEditing] = useState(null)

  const favoriteProducts = products.filter((product) => product.favorite)

  return (
    <>
      <PageTitle>Favorites</PageTitle>

      {loading || error ? (
        <DataState loading={loading} error={error} onRetry={reload} />
      ) : favoriteProducts.length === 0 ? (
        <div className="panel p-10 text-center text-sm text-ink-muted dark:text-ink-light">
          <p>Nothing saved yet. Tap the heart on any product to keep it here.</p>
          <Link to="/products" className="btn-primary mt-4">Browse products</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite
              onToggleFavorite={toggleFavorite}
              onEdit={setEditing}
              imageSrc={product.image || undefined}
            />
          ))}
        </div>
      )}

      {editing && (
        <ProductFormModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={(values) => updateProduct(editing.id, values)}
          onDelete={() => deleteProduct(editing.id)}
        />
      )}
    </>
  )
}
