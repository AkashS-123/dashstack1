import { createContext, useCallback, useContext, useMemo } from 'react'
import { api } from '../api/client.js'
import useCollection from '../hooks/useCollection.js'

const ProductsContext = createContext(null)

/**
 * Single source of truth for products. Favourites are just a `favorite` flag
 * on each product, so the Products and Favorites pages always agree and the
 * choice is saved in db.json.
 */
export function ProductsProvider({ children }) {
  const { items, setItems, loading, error, reload, create, update, remove } = useCollection('products')

  const toggleFavorite = useCallback(
    async (id) => {
      const product = items.find((item) => item.id === id)
      if (!product) return
      const next = !product.favorite
      // Optimistic: flip the heart straight away, roll back if the save fails.
      setItems((current) => current.map((item) => (item.id === id ? { ...item, favorite: next } : item)))
      try {
        await api.patch(`/products/${id}`, { favorite: next })
      } catch {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, favorite: !next } : item)))
      }
    },
    [items, setItems],
  )

  const value = useMemo(
    () => ({
      products: items,
      loading,
      error,
      reload,
      addProduct: (values) => create({ favorite: false, reviews: 0, ...values }),
      updateProduct: update,
      deleteProduct: remove,
      toggleFavorite,
      isFavorite: (id) => items.some((item) => item.id === id && item.favorite),
    }),
    [items, loading, error, reload, create, update, remove, toggleFavorite],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used inside a ProductsProvider')
  return context
}
