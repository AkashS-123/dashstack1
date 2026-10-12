import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import PageTitle from '../components/PageTitle.jsx'
import { api } from '../api/client.js'
import { fileToDataUrl } from '../utils/image.js'

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', position: '', gender: 'Male' }

export default function AddTeamMember() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [photo, setPhoto] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const pickPhoto = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setPhoto(await fileToDataUrl(file, 256))
      setError('')
    } catch (err) {
      setError(err.message)
    }
    event.target.value = ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.firstName.trim()) return setError('Enter a first name before saving.')
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Enter a valid email address before saving.')

    setSaving(true)
    setError('')
    try {
      await api.post('/team', {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        role: form.position.trim() || 'Member',
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        avatar: photo,
      })
      navigate('/team')
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <>
      <PageTitle>Add Team Member</PageTitle>

      <form onSubmit={handleSubmit} className="panel p-6 sm:p-10">
        <div className="flex flex-col items-center">
          {photo ? (
            <img src={photo} alt="Selected profile" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-full bg-surface-page text-ink dark:bg-night-soft dark:text-white">
              <Camera size={26} />
            </span>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} className="sr-only" aria-label="Upload photo" />
          <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 text-sm font-bold text-primary">
            {photo ? 'Change Photo' : 'Upload Photo'}
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <label className="text-sm font-semibold text-ink dark:text-white">
            First Name
            <input value={form.firstName} onChange={update('firstName')} placeholder="Enter your first name" className="field mt-2" />
          </label>
          <label className="text-sm font-semibold text-ink dark:text-white">
            Last Name
            <input value={form.lastName} onChange={update('lastName')} placeholder="Enter your last name" className="field mt-2" />
          </label>
          <label className="text-sm font-semibold text-ink dark:text-white">
            Your email
            <input type="email" value={form.email} onChange={update('email')} placeholder="Enter your email" className="field mt-2" />
          </label>
          <label className="text-sm font-semibold text-ink dark:text-white">
            Phone Number
            <input type="tel" value={form.phone} onChange={update('phone')} placeholder="Enter your phone number" className="field mt-2" />
          </label>
          <label className="text-sm font-semibold text-ink dark:text-white">
            Position
            <input value={form.position} onChange={update('position')} placeholder="CEO" className="field mt-2" />
          </label>
          <label className="text-sm font-semibold text-ink dark:text-white">
            Gender
            <select value={form.gender} onChange={update('gender')} className="field mt-2">
              <option>Male</option>
              <option>Female</option>
              <option>Prefer not to say</option>
            </select>
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
