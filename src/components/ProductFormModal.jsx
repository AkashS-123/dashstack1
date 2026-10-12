import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { fileToDataUrl } from '../utils/image.js'

const CATEGORIES = ['Watches', 'Shoes', 'Fashion', 'Electronics', 'Mobile', 'Accessories', 'Home', 'Fitness']

/**
 * Add / edit dialog for a product. Pass `product` to edit, omit it to add.
 * `onSave(values)` and `onDelete()` may return promises; errors are shown inline.
 */
export default function ProductFormModal({ product, onSave, onDelete, onClose }) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? CATEGORIES[0],
    price: product ? String(product.price) : '',
    rating: product?.rating ?? 4,
    reviews: product ? String(product.reviews ?? 0) : '0',
    image: product?.image ?? '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && !busy && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, onClose])

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const pickImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const image = await fileToDataUrl(file)
      setForm((current) => ({ ...current, image }))
      setError('')
    } catch (err) {
      setError(err.message)
    }
    event.target.value = ''
  }

  const submit = async (event) => {
    event.preventDefault()
    const price = Number(form.price)
    if (!form.name.trim()) return setError('Enter a product name.')
    if (form.price === '' || Number.isNaN(price) || price < 0) return setError('Enter a valid price, for example 24.99.')

    setBusy(true)
    setError('')
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category.trim() || 'General',
        price: Math.round(price * 100) / 100,
        rating: Number(form.rating),
        reviews: Math.max(0, parseInt(form.reviews, 10) || 0),
        image: form.image,
      })
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await onDelete()
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? `Edit ${product.name}` : 'Add product'}
    >
      <form onSubmit={submit} className="panel my-auto w-full max-w-md p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink dark:text-white">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="text-ink-muted hover:text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          {form.image ? (
            <img src={form.image} alt="" className="h-20 w-20 rounded-lg bg-white object-contain" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-lg bg-surface-page text-ink-light dark:bg-night-soft">
              <ImagePlus size={24} />
            </span>
          )}
          <div className="flex flex-col items-start gap-1">
            <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="sr-only" aria-label="Upload product image" />
            <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-bold text-primary">
              {form.image ? 'Change image' : 'Upload image'}
            </button>
            {form.image && (
              <button type="button" onClick={() => setForm((c) => ({ ...c, image: '' }))} className="text-xs font-semibold text-ink-muted hover:text-[#EF3826] dark:text-ink-light">
                Remove image
              </button>
            )}
          </div>
        </div>

        <label className="mt-4 block text-sm font-semibold text-ink-muted dark:text-ink-light">
          Product name
          <input value={form.name} onChange={set('name')} className="field mt-2" autoFocus />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink-muted dark:text-ink-light">
            Price ($)
            <input type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={set('price')} className="field mt-2" />
          </label>
          <label className="block text-sm font-semibold text-ink-muted dark:text-ink-light">
            Category
            <input list="product-categories" value={form.category} onChange={set('category')} className="field mt-2" />
            <datalist id="product-categories">
              {CATEGORIES.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>
          <label className="block text-sm font-semibold text-ink-muted dark:text-ink-light">
            Rating
            <select value={form.rating} onChange={set('rating')} className="field mt-2">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink-muted dark:text-ink-light">
            Reviews
            <input type="number" min="0" value={form.reviews} onChange={set('reviews')} className="field mt-2" />
          </label>
        </div>

        {error && <p role="alert" className="mt-4 text-sm font-semibold text-[#EF3826]">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {isEdit ? (
            confirmDelete ? (
              <span className="flex items-center gap-2">
                <button type="button" onClick={remove} disabled={busy} className="rounded-lg bg-[#EF3826] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                  Yes, delete
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} disabled={busy} className="btn-ghost">No</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} disabled={busy} className="text-sm font-bold text-[#EF3826]">
                Delete product
              </button>
            )
          ) : (
            <span />
          )}
          <span className="flex gap-3">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
            </button>
          </span>
        </div>
      </form>
    </div>
  )
}
