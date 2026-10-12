import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import Avatar from '../components/Avatar.jsx'
import DataState from '../components/DataState.jsx'
import PageTitle from '../components/PageTitle.jsx'
import useCollection from '../hooks/useCollection.js'

export default function Team() {
  const { items: members, loading, error, reload, remove } = useCollection('team')
  const [confirmId, setConfirmId] = useState(null)
  const [actionError, setActionError] = useState('')

  const handleDelete = async (id) => {
    try {
      await remove(id)
      setConfirmId(null)
      setActionError('')
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <>
      <PageTitle action={<Link to="/team/new" className="btn-primary">Add New Member</Link>}>
        Team
      </PageTitle>

      {actionError && <p role="alert" className="mb-4 text-sm font-semibold text-[#EF3826]">{actionError}</p>}

      {loading || error ? (
        <DataState loading={loading} error={error} onRetry={reload} />
      ) : members.length === 0 ? (
        <p className="panel p-10 text-center text-sm text-ink-muted dark:text-ink-light">
          No team members yet. Use “Add New Member” to create the first one.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <article key={member.id} className="panel relative p-6 text-center">
              <button
                type="button"
                onClick={() => setConfirmId(member.id)}
                aria-label={`Remove ${member.name}`}
                className="absolute right-3 top-3 text-ink-light hover:text-[#EF3826]"
              >
                <Trash2 size={16} />
              </button>

              <Avatar name={member.name} src={member.avatar} size={96} className="mx-auto" />
              <h2 className="mt-4 text-base font-bold text-ink dark:text-white">{member.name}</h2>
              <p className="mt-1 text-sm text-ink-muted dark:text-ink-light">{member.role}</p>
              <a href={`mailto:${member.email}`} className="mt-2 block break-all text-sm text-ink-muted hover:text-primary dark:text-ink-light">
                {member.email}
              </a>
              {member.phone && <p className="mt-1 text-sm text-ink-muted dark:text-ink-light">{member.phone}</p>}

              {confirmId === member.id && (
                <div className="mt-4 flex items-center justify-center gap-2" role="group" aria-label={`Confirm removing ${member.name}`}>
                  <button type="button" onClick={() => handleDelete(member.id)} className="rounded-lg bg-[#EF3826] px-3 py-1.5 text-xs font-bold text-white">
                    Remove
                  </button>
                  <button type="button" onClick={() => setConfirmId(null)} className="btn-ghost px-3 py-1.5 text-xs">
                    Cancel
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  )
}
