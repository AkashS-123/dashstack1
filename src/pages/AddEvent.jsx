import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import PageTitle from '../components/PageTitle.jsx'
import { api } from '../api/client.js'
import { fileToDataUrl } from '../utils/image.js'

const EMPTY_EVENT = { name: '', time: '', date: '', endDate: '', address: '', contact: '' }
const COLORS = ['#6226EF', '#E93CAC', '#FFA756', '#2E5BFF', '#00B69B', '#FF5B29']

export default function AddEvent() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_EVENT)
  const [cover, setCover] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const pickCover = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setCover(await fileToDataUrl(file, 640))
      setError('')
    } catch (err) {
      setError(err.message)
    }
    event.target.value = ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.date) return setError('Add an event name and date before saving.')
    if (form.endDate && form.endDate < form.date) return setError('The end date cannot be before the start date.')

    setSaving(true)
    setError('')
    try {
      const existing = await api.get('/events')
      await api.post('/events', {
        title: form.name.trim(),
        host: '',
        date: form.date,
        endDate: form.endDate || form.date,
        time: form.time,
        address: form.address.trim(),
        place: '',
        contact: form.contact.trim(),
        guests: 0,
        color: COLORS[existing.length % COLORS.length],
        image: cover,
      })
      // Open the calendar on the month of the new event so it is visible straight away.
      navigate(`/calendar?month=${form.date.slice(0, 7)}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <>
      <PageTitle>Add New Event</PageTitle>

      <form onSubmit={handleSubmit} className="panel p-6 sm:p-10">
        <div className="flex flex-col items-center">
          {cover ? (
            <img src={cover} alt="Selected cover" className="h-20 w-32 rounded-lg object-cover" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-full bg-surface-page text-ink dark:bg-night-soft dark:text-white">
              <Camera size={26} />
            </span>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={pickCover} className="sr-only" aria-label="Upload cover photo" />
          <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 text-sm font-bold text-primary">
            {cover ? 'Change Cover Photo' : 'Upload Cover Photo'}
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <label className="text-sm font-semibold text-ink dark:text-white">
            Event Name
            <input value={form.name} onChange={update('name')} placeholder="Enter event name" className="field mt-2" />
          </label>
          <label className="text-sm font-semibold text-ink dark:text-white">
            Time
            <input type="time" value={form.time} onChange={update('time')} className="field mt-2" />
          </label>
          <label className="text-sm font-semibold text-ink dark:text-white">
            Date
            <input type="date" value={form.date} onChange={update('date')} className="field mt-2" />
          </label>
          <label className="text-sm font-semibold text-ink dark:text-white">
            End Date <span className="font-normal text-ink-light">(optional)</span>
            <input type="date" value={form.endDate} min={form.date || undefined} onChange={update('endDate')} className="field mt-2" />
          </label>
          <label className="text-sm font-semibold text-ink dark:text-white">
            Address
            <input value={form.address} onChange={update('address')} placeholder="Address" className="field mt-2" />
          </label>
          <label className="text-sm font-semibold text-ink dark:text-white">
            Contact Number
            <input type="tel" value={form.contact} onChange={update('contact')} placeholder="Enter your Contact Number" className="field mt-2" />
          </label>
        </div>

        {error && <p role="alert" className="mt-4 text-center text-sm font-semibold text-[#EF3826]">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary mx-auto mt-10 flex w-full max-w-xs disabled:opacity-60">
          {saving ? 'Saving…' : 'Add Now'}
        </button>
      </form>
    </>
  )
}
