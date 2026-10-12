import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import DataState from '../components/DataState.jsx'
import PageTitle from '../components/PageTitle.jsx'
import Pagination from '../components/Pagination.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductFormModal from '../components/ProductFormModal.jsx'
import { useProducts } from '../context/ProductsContext.jsx'

const banners = [
  { id: 1, dates: 'September 12-22', title: 'Enjoy free home delivery in this summer', note: 'Designer Dresses - Pick from trendy Designer Dress.' },
  { id: 2, dates: 'October 01-14', title: 'Save more on every second order', note: 'Electronics - Fresh arrivals with two year warranty.' },
]

const PAGE_SIZE = 9

export default function Products() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') || '').trim().toLowerCase()
  const { products, loading, error, reload, isFavorite, toggleFavorite, addProduct, updateProduct, deleteProduct } = useProducts()

  const [slide, setSlide] = useState(0)
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  // `null` = closed, `{}` = adding, a product = editing it.
  const [dialog, setDialog] = useState(null)

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category).filter(Boolean))], [products])

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === 'All' || product.category === category) &&
          (!query || `${product.name} ${product.category}`.toLowerCase().includes(query)),
      ),
    [products, category, query],
  )

  useEffect(() => setPage(1), [query, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const rangeStart = filtered.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(current * PAGE_SIZE, filtered.length)

  const banner = banners[slide]
  const goPrev = () => setSlide((n) => (n === 0 ? banners.length - 1 : n - 1))
  const goNext = () => setSlide((n) => (n + 1) % banners.length)

  return (
    <>
      <PageTitle
        action={
          <button type="button" onClick={() => setDialog({})} className="btn-primary">
            <Plus size={16} /> Add Product
          </button>
        }
      >
        Products
      </PageTitle>

      <section className="relative overflow-hidden rounded-card bg-primary px-6 py-10 text-white sm:px-16 sm:py-14">
        <p className="text-sm font-semibold opacity-90">{banner.dates}</p>
        <h2 className="mt-3 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">{banner.title}</h2>
        <p className="mt-3 text-sm opacity-90">{banner.note}</p>
        <button type="button" className="mt-6 rounded-lg bg-[#FF9500] px-7 py-3 text-sm font-bold text-white hover:bg-[#E88600]">
          Get Started
        </button>
        <button type="button" onClick={goPrev} aria-label="Previous banner" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-primary">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={goNext} aria-label="Next banner" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-primary">
          <ChevronRight size={18} />
        </button>
      </section>

      {loading || error ? (
        <div className="mt-6"><DataState loading={loading} error={error} onRetry={reload} /></div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted dark:text-ink-light">
              {query
                ? `${filtered.length} result${filtered.length === 1 ? '' : 's'} for “${query}”`
                : `${filtered.length} product${filtered.length === 1 ? '' : 's'}`}
            </p>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-muted dark:text-ink-light">
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="field w-auto py-2">
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={Boolean(product.favorite)}
                onToggleFavorite={toggleFavorite}
                onEdit={setDialog}
                imageSrc={product.image || undefined}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="panel mt-6 p-8 text-center text-sm text-ink-muted dark:text-ink-light">
              No products match. Try a different name or category.
            </p>
          )}

          {filtered.length > PAGE_SIZE && (
            <Pagination
              label={`Showing ${rangeStart}-${rangeEnd} of ${filtered.length}`}
              prevLabel="Prev"
              nextLabel="Next"
              onPrev={() => setPage((n) => Math.max(1, n - 1))}
              onNext={() => setPage((n) => Math.min(totalPages, n + 1))}
              disabledPrev={current === 1}
              disabledNext={current >= totalPages}
            />
          )}
        </>
      )}

      {dialog && (
        <ProductFormModal
          product={dialog.id ? dialog : undefined}
          onClose={() => setDialog(null)}
          onSave={(values) => (dialog.id ? updateProduct(dialog.id, values) : addProduct(values))}
          onDelete={() => deleteProduct(dialog.id)}
        />
      )}
    </>
  )
}
