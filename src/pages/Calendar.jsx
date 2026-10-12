import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DataState from '../components/DataState.jsx'
import EventThumb from '../components/EventThumb.jsx'
import PageTitle from '../components/PageTitle.jsx'
import PersonPhoto from '../components/PersonPhoto.jsx'
import useCollection from '../hooks/useCollection.js'
import { addDays, formatEventWhen, fromKey, startOfWeek, toKey } from '../utils/dates.js'

const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const VIEWS = ['Day', 'Week', 'Month']
const PREVIEW_COUNT = 2

const monthTitle = (date) => date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
const dayTitle = (date) => date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const shortDay = (date) => date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

export default function Calendar() {
  const [searchParams] = useSearchParams()
  const { items: events, loading, error, reload, remove } = useCollection('events')

  const [view, setView] = useState('Month')
  const [anchor, setAnchor] = useState(() => {
    const month = searchParams.get('month')
    return month && /^\d{4}-\d{2}$/.test(month) ? fromKey(`${month}-01`) : null
  })
  const [activeEvent, setActiveEvent] = useState(null)
  const [showAllEvents, setShowAllEvents] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionError, setActionError] = useState('')

  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.date.localeCompare(b.date)), [events])

  // Until the user navigates, open on the next upcoming event's month, else the latest event's.
  const fallbackAnchor = useMemo(() => {
    const todayKey = toKey(new Date())
    const target = sortedEvents.find((e) => (e.endDate || e.date) >= todayKey) || sortedEvents[sortedEvents.length - 1]
    return target ? fromKey(target.date) : new Date()
  }, [sortedEvents])
  const current = anchor ?? fallbackAnchor

  useEffect(() => {
    if (!activeEvent) return undefined
    const onKey = (event) => event.key === 'Escape' && closeDialog()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeEvent])

  const closeDialog = () => {
    setActiveEvent(null)
    setConfirmDelete(false)
    setActionError('')
  }

  const eventsOn = (key) => sortedEvents.filter((e) => e.date <= key && key <= (e.endDate || e.date))

  // ----- visible period -----
  const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
  const gridStart = startOfWeek(monthStart)
  const weeks = Math.ceil(((monthStart.getDay() + 6) % 7 + new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()) / 7)
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i))

  let periodDays
  if (view === 'Month') {
    const last = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()
    periodDays = Array.from({ length: last }, (_, i) => new Date(current.getFullYear(), current.getMonth(), i + 1))
  } else if (view === 'Week') {
    const start = startOfWeek(current)
    periodDays = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  } else {
    periodDays = [current]
  }
  const agenda = periodDays.map((date) => ({ date, events: eventsOn(toKey(date)) })).filter((d) => view !== 'Month' || d.events.length > 0)

  const step = (direction) => {
    if (view === 'Month') setAnchor(new Date(current.getFullYear(), current.getMonth() + direction, 1))
    else setAnchor(addDays(current, direction * (view === 'Week' ? 7 : 1)))
  }

  const title =
    view === 'Month'
      ? monthTitle(current)
      : view === 'Week'
        ? `${shortDay(periodDays[0])} – ${shortDay(periodDays[6])}`
        : dayTitle(current)

  const deleteActive = async () => {
    try {
      await remove(activeEvent.id)
      closeDialog()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const todayKey = toKey(new Date())
  const visibleEvents = showAllEvents ? sortedEvents : sortedEvents.slice(0, PREVIEW_COUNT)

  return (
    <>
      <PageTitle action={<Link to="/calendar/new-event" className="btn-primary lg:hidden">+ Add New Event</Link>}>
        Calendar
      </PageTitle>

      {loading || error ? (
        <DataState loading={loading} error={error} onRetry={reload} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[300px,minmax(0,1fr)]">
          {/* Calendar first on phones, sidebar first on desktop. */}
          <section className="panel order-1 min-w-0 p-3 sm:p-4 lg:order-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => setAnchor(new Date())} className="btn-ghost px-3 py-1.5">Today</button>

              <div className="order-last flex w-full items-center justify-between gap-2 sm:order-none sm:w-auto sm:justify-center sm:gap-3">
                <button type="button" aria-label={`Previous ${view.toLowerCase()}`} onClick={() => step(-1)} className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-page dark:text-ink-light dark:hover:bg-night-soft">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-center text-base font-bold text-ink dark:text-white sm:text-lg" aria-live="polite">{title}</h2>
                <button type="button" aria-label={`Next ${view.toLowerCase()}`} onClick={() => step(1)} className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-page dark:text-ink-light dark:hover:bg-night-soft">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex overflow-hidden rounded-lg border border-surface-line dark:border-night-line">
                {VIEWS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setView(item)}
                    aria-pressed={view === item}
                    className={`px-3 py-1.5 text-sm font-semibold sm:px-4 sm:py-2 ${view === item ? 'bg-primary text-white' : 'text-ink-muted dark:text-ink-light'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {view === 'Month' && (
              <>
                <div className="grid grid-cols-7 border-b border-surface-line pb-2 text-center text-[10px] font-bold text-ink-muted dark:border-night-line dark:text-ink-light sm:text-xs">
                  {WEEK_DAYS.map((day) => (
                    <span key={day}>
                      <span className="sm:hidden">{day[0]}</span>
                      <span className="hidden sm:inline">{day}</span>
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 border-l border-surface-line dark:border-night-line">
                  {cells.map((date) => {
                    const key = toKey(date)
                    const muted = date.getMonth() !== current.getMonth()
                    const dayEvents = eventsOn(key)
                    return (
                      <div
                        key={key}
                        className={`min-h-[52px] min-w-0 border-b border-r border-surface-line p-1 dark:border-night-line sm:min-h-[96px] sm:p-2 ${
                          muted ? 'bg-surface-page/60 dark:bg-night-soft/40' : ''
                        }`}
                      >
                        <span
                          className={`inline-grid h-6 min-w-6 place-items-center rounded-full text-xs font-semibold sm:text-sm ${
                            key === todayKey ? 'bg-primary text-white' : muted ? 'text-ink-light' : 'text-ink dark:text-white'
                          }`}
                        >
                          {date.getDate()}
                        </span>

                        {/* Phones: coloured dots. Larger screens: titled chips. */}
                        <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
                          {dayEvents.map((event) => (
                            <button key={event.id} type="button" onClick={() => setActiveEvent(event)} aria-label={event.title} style={{ backgroundColor: event.color }} className="h-2.5 w-2.5 rounded-full" />
                          ))}
                        </div>
                        <div className="hidden sm:block">
                          {dayEvents.slice(0, 2).map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => setActiveEvent(event)}
                              style={{ borderLeftColor: event.color, backgroundColor: `${event.color}1A`, color: event.color }}
                              className="mt-1 block w-full truncate rounded-r border-l-4 px-2 py-1 text-left text-[11px] font-bold"
                            >
                              {event.title}
                            </button>
                          ))}
                          {dayEvents.length > 2 && (
                            <p className="mt-1 text-[11px] font-semibold text-ink-muted dark:text-ink-light">+{dayEvents.length - 2} more</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Agenda: the whole story on phones, and the main content for Day / Week. */}
            <div className={view === 'Month' ? 'mt-5 sm:hidden' : 'mt-1'}>
              {view === 'Month' && <h3 className="mb-2 text-sm font-bold text-ink dark:text-white">Events this month</h3>}
              {agenda.length === 0 && (
                <p className="py-4 text-center text-sm text-ink-muted dark:text-ink-light">No events this month.</p>
              )}
              <ul className="divide-y divide-surface-line dark:divide-night-line">
                {agenda.map(({ date, events: dayEvents }) => (
                  <li key={toKey(date)} className="flex gap-3 py-3">
                    <div className="w-14 shrink-0 text-center">
                      <p className="text-[11px] font-bold uppercase text-ink-muted dark:text-ink-light">
                        {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                      </p>
                      <p className={`mx-auto mt-0.5 grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${toKey(date) === todayKey ? 'bg-primary text-white' : 'text-ink dark:text-white'}`}>
                        {date.getDate()}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      {dayEvents.length === 0 && <p className="py-1.5 text-sm text-ink-light">No events</p>}
                      {dayEvents.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => setActiveEvent(event)}
                          style={{ borderLeftColor: event.color, backgroundColor: `${event.color}1A` }}
                          className="block w-full rounded-r border-l-4 px-3 py-2 text-left"
                        >
                          <span className="block truncate text-sm font-bold" style={{ color: event.color }}>{event.title}</span>
                          <span className="block truncate text-xs text-ink-muted dark:text-ink-light">{formatEventWhen(event)}</span>
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <aside className="panel order-2 h-max min-w-0 p-4 lg:order-1">
            <Link to="/calendar/new-event" className="btn-primary hidden w-full lg:flex">+ Add New Event</Link>

            <h2 className="mb-4 text-base font-bold text-ink dark:text-white lg:mt-6">You are going to</h2>
            {sortedEvents.length === 0 && <p className="text-sm text-ink-muted dark:text-ink-light">No events yet.</p>}
            <ul className="space-y-5">
              {visibleEvents.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <button type="button" onClick={() => setActiveEvent(event)} aria-label={`Open ${event.title}`} className="shrink-0">
                    <EventThumb event={event} className="h-10 w-10 rounded-full" />
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink dark:text-white">{event.title}</p>
                    <p className="mt-1 text-xs text-ink-muted dark:text-ink-light">{formatEventWhen(event)}</p>
                    {event.address && <p className="text-xs text-ink-muted dark:text-ink-light">{event.address}</p>}
                    {event.place && <p className="text-xs text-ink-muted dark:text-ink-light">{event.place}</p>}
                    {event.guests > 0 && (
                      <div className="mt-2 flex items-center">
                        {[0, 1, 2].map((index) => (
                          <PersonPhoto key={index} name={`event-${event.id}-guest-${index}`} className="-ml-2 h-6 w-6 rounded-full border-2 border-white first:ml-0 dark:border-night-card" />
                        ))}
                        <span className="-ml-2 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-primary-soft text-[10px] font-bold text-primary dark:border-night-card dark:bg-night-soft">
                          {event.guests}+
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {sortedEvents.length > PREVIEW_COUNT && (
              <button type="button" onClick={() => setShowAllEvents((prev) => !prev)} className="btn-ghost mx-auto mt-6 flex">
                {showAllEvents ? 'See Less' : 'See More'}
              </button>
            )}
          </aside>
        </div>
      )}

      {activeEvent && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={activeEvent.title}>
          <div className="panel my-auto w-full max-w-sm p-5">
            <EventThumb event={activeEvent} className="h-40 w-full rounded-lg" />
            <h2 className="mt-4 text-lg font-bold text-ink dark:text-white">{activeEvent.title}</h2>
            {activeEvent.host && <p className="text-sm text-ink-muted dark:text-ink-light">{activeEvent.host}</p>}
            <p className="mt-2 text-sm text-ink-muted dark:text-ink-light">{formatEventWhen(activeEvent)}</p>
            {activeEvent.address && <p className="text-sm text-ink-muted dark:text-ink-light">{activeEvent.address}</p>}
            {activeEvent.contact && <p className="text-sm text-ink-muted dark:text-ink-light">Contact: {activeEvent.contact}</p>}
            {activeEvent.guests > 0 && <p className="mt-3 text-sm font-bold text-primary">+{activeEvent.guests} going</p>}

            {actionError && <p role="alert" className="mt-3 text-sm font-semibold text-[#EF3826]">{actionError}</p>}

            <div className="mt-5 flex gap-3">
              {confirmDelete ? (
                <>
                  <button type="button" onClick={deleteActive} className="flex-1 rounded-lg bg-[#EF3826] px-4 py-3 text-sm font-bold text-white">Yes, delete</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="btn-ghost flex-1">Keep</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setConfirmDelete(true)} className="btn-ghost flex-1 hover:border-[#EF3826] hover:text-[#EF3826]">Delete</button>
                  <button type="button" onClick={closeDialog} className="btn-primary flex-1">Close</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
