import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowLeft, Bookmark, Inbox as InboxIcon, Info, Mic,
  Paperclip, Pencil, Printer, Search, Send, Star, Trash2, X, Image as ImageIcon,
} from 'lucide-react'
import { api } from '../api/client.js'
import Avatar from '../components/Avatar.jsx'
import DataState from '../components/DataState.jsx'
import PageTitle from '../components/PageTitle.jsx'
import Pagination from '../components/Pagination.jsx'
import useCollection from '../hooks/useCollection.js'
import { mailLabels } from '../data/mockData.js'

const FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: InboxIcon },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'draft', label: 'Draft', icon: Pencil },
  { id: 'spam', label: 'Spam', icon: AlertTriangle },
  { id: 'important', label: 'Important', icon: Bookmark },
  { id: 'bin', label: 'Bin', icon: Trash2 },
]

const LABEL_COLORS = {
  Primary: { color: '#00B69B', bg: 'rgba(0, 182, 155, 0.15)' },
  Social: { color: '#2E5BFF', bg: 'rgba(46, 91, 255, 0.15)' },
  Work: { color: '#FFA756', bg: 'rgba(255, 167, 86, 0.2)' },
  Friends: { color: '#E93CAC', bg: 'rgba(233, 60, 172, 0.15)' },
}

const EMPTY_COMPOSE = { to: '', subject: '', message: '' }
const PAGE_SIZE = 6

const nowLabel = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

function LabelChip({ label, className = '' }) {
  const style = LABEL_COLORS[label]
  if (!label || !style) return null
  return (
    <span style={{ color: style.color, backgroundColor: style.bg }} className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${className}`}>
      {label}
    </span>
  )
}

export default function Inbox() {
  const { items: mailList, loading, error, reload, create, update, remove } = useCollection('mails')

  const [folder, setFolder] = useState('inbox')
  const [selectedIds, setSelectedIds] = useState([])
  const [openId, setOpenId] = useState(null)
  const [thread, setThread] = useState([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [reply, setReply] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [compose, setCompose] = useState(EMPTY_COMPOSE)
  const [composeError, setComposeError] = useState('')
  const [notice, setNotice] = useState({ text: '', isError: false })
  const [page, setPage] = useState(1)

  const flash = (text, isError = false) => {
    setNotice({ text, isError })
    window.setTimeout(() => setNotice({ text: '', isError: false }), 4000)
  }

  const openMail = mailList.find((mail) => mail.id === openId) || null

  // Load the conversation whenever a mail is opened.
  useEffect(() => {
    if (!openId) return undefined
    let cancelled = false
    setThreadLoading(true)
    api
      .get(`/messages?mailId=${openId}`)
      .then((data) => !cancelled && setThread(data))
      .catch((err) => !cancelled && flash(err.message, true))
      .finally(() => !cancelled && setThreadLoading(false))
    return () => {
      cancelled = true
    }
  }, [openId])

  const counts = useMemo(() => {
    const live = mailList.filter((mail) => mail.folder !== 'bin')
    return {
      inbox: mailList.filter((m) => m.folder === 'inbox').length,
      starred: live.filter((m) => m.starred).length,
      sent: mailList.filter((m) => m.folder === 'sent').length,
      draft: mailList.filter((m) => m.folder === 'draft').length,
      spam: mailList.filter((m) => m.folder === 'spam').length,
      important: live.filter((m) => m.important).length,
      bin: mailList.filter((m) => m.folder === 'bin').length,
    }
  }, [mailList])

  const visibleMails = useMemo(() => {
    const term = search.trim().toLowerCase()
    return mailList
      .filter((mail) => {
        if (folder === 'starred') return mail.starred && mail.folder !== 'bin'
        if (folder === 'important') return mail.important && mail.folder !== 'bin'
        return mail.folder === folder
      })
      .filter((mail) => !term || `${mail.sender} ${mail.subject}`.toLowerCase().includes(term))
      .sort((a, b) => b.id - a.id)
  }, [mailList, folder, search])

  const totalPages = Math.max(1, Math.ceil(visibleMails.length / PAGE_SIZE))
  const clampedPage = Math.min(page, totalPages)
  const pagedMails = visibleMails.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE)
  const rangeStart = visibleMails.length === 0 ? 0 : (clampedPage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(clampedPage * PAGE_SIZE, visibleMails.length)
  const allOnPageSelected = pagedMails.length > 0 && pagedMails.every((mail) => selectedIds.includes(mail.id))

  const changeFolder = (id) => {
    setFolder(id)
    setOpenId(null)
    setSelectedIds([])
    setPage(1)
  }

  const toggleSelect = (id) =>
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  const toggleSelectPage = () =>
    setSelectedIds(allOnPageSelected ? [] : pagedMails.map((mail) => mail.id))

  const guard = async (action) => {
    try {
      await action()
    } catch (err) {
      flash(err.message, true)
    }
  }

  const toggleStar = (mail) => guard(() => update(mail.id, { starred: !mail.starred }))

  const trash = (ids) =>
    guard(async () => {
      const targets = mailList.filter((mail) => ids.includes(mail.id))
      await Promise.all(
        targets.map((mail) => (mail.folder === 'bin' ? remove(mail.id) : update(mail.id, { folder: 'bin' }))),
      )
      setSelectedIds([])
      setOpenId(null)
      flash(folder === 'bin' ? 'Deleted permanently.' : `Moved to Bin (${targets.length}).`)
    })

  const markImportant = () =>
    guard(async () => {
      const targets = mailList.filter((mail) => selectedIds.includes(mail.id))
      const makeImportant = targets.some((mail) => !mail.important)
      await Promise.all(targets.map((mail) => update(mail.id, { important: makeImportant })))
      setSelectedIds([])
    })

  const sendReply = (event) => {
    event.preventDefault()
    const text = reply.trim()
    if (!text || !openMail) return
    guard(async () => {
      const saved = await api.post('/messages', { mailId: openMail.id, from: 'me', time: nowLabel(), text })
      setThread((current) => [...current, saved])
      setReply('')
    })
  }

  const closeCompose = () => {
    setIsComposing(false)
    setComposeError('')
  }

  const updateCompose = (field) => (event) => setCompose((current) => ({ ...current, [field]: event.target.value }))

  const sendCompose = async (event) => {
    event.preventDefault()
    const to = compose.to.trim()
    if (!to || !compose.message.trim()) return setComposeError('Add a recipient and a message before sending.')
    try {
      const mail = await create({
        sender: to,
        label: null,
        subject: compose.subject.trim() || '(No subject)',
        time: nowLabel(),
        starred: false,
        important: false,
        folder: 'sent',
      })
      await api.post('/messages', { mailId: mail.id, from: 'me', time: nowLabel(), text: compose.message.trim() })
      setCompose(EMPTY_COMPOSE)
      closeCompose()
      changeFolder('sent')
      flash(`Message sent to ${to}.`)
    } catch (err) {
      setComposeError(err.message)
    }
  }

  const iconButton = 'btn-ghost h-9 w-9 shrink-0 p-0'

  return (
    <>
      <PageTitle>Inbox</PageTitle>

      {loading || error ? (
        <DataState loading={loading} error={error} onRetry={reload} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px,minmax(0,1fr)] lg:gap-5">
          {/* Folders: a swipeable chip row on phones, a full sidebar on desktop. */}
          <aside className="panel h-max min-w-0 p-3 lg:p-4">
            <button type="button" onClick={() => setIsComposing(true)} className="btn-primary w-full">
              + Compose
            </button>

            <p className="mb-2 mt-6 hidden text-sm font-bold text-ink dark:text-white lg:block">My Email</p>
            <ul className="scroll-slim -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:mt-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
              {FOLDERS.map((item) => {
                const Icon = item.icon
                const isActive = folder === item.id
                return (
                  <li key={item.id} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => changeFolder(item.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors lg:w-full lg:gap-3 ${
                        isActive
                          ? 'bg-primary-soft text-primary dark:bg-night-soft'
                          : 'text-ink-muted hover:bg-surface-page dark:text-ink-light dark:hover:bg-night-soft'
                      }`}
                    >
                      <Icon size={17} />
                      <span className="lg:flex-1 lg:text-left">{item.label}</span>
                      <span className="text-xs">{counts[item.id]}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="hidden lg:block">
              <p className="mb-2 mt-6 text-sm font-bold text-ink dark:text-white">Label</p>
              <ul className="space-y-2">
                {mailLabels.map((label) => (
                  <li key={label.id} className="flex items-center gap-3 px-3 text-sm text-ink-muted dark:text-ink-light">
                    <span className="h-4 w-4 rounded border-2" style={{ borderColor: label.color }} />
                    {label.label}
                  </li>
                ))}
              </ul>
              <button type="button" className="mt-4 px-3 text-sm font-semibold text-ink-muted hover:text-primary dark:text-ink-light">
                + Create New Label
              </button>
            </div>
          </aside>

          <section className="panel min-w-0 p-3 sm:p-4">
            {notice.text && (
              <p
                role="status"
                className={`mb-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                  notice.isError ? 'bg-[#EF3826]/10 text-[#EF3826]' : 'bg-status-completed/10 text-status-completed'
                }`}
              >
                {notice.text}
              </p>
            )}

            {openMail ? (
              <div className="flex h-full min-h-[320px] flex-col">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-surface-line pb-4 dark:border-night-line">
                  <button type="button" onClick={() => setOpenId(null)} aria-label="Back to list" className="shrink-0 text-ink-muted hover:text-primary">
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="min-w-0 max-w-full flex-1 truncate text-base font-bold text-ink dark:text-white sm:flex-none sm:text-lg">
                    {openMail.sender}
                  </h2>
                  <LabelChip label={openMail.label} />
                  <div className="ml-auto flex items-center gap-2 text-ink-muted">
                    <button type="button" aria-label="Print message" onClick={() => window.print()} className={iconButton}><Printer size={16} /></button>
                    <button type="button" aria-label={openMail.starred ? 'Unstar message' : 'Star message'} onClick={() => toggleStar(openMail)} className={iconButton}>
                      <Star size={16} className={openMail.starred ? 'fill-[#FFB800] text-[#FFB800]' : ''} />
                    </button>
                    <button type="button" aria-label="Delete message" onClick={() => trash([openMail.id])} className={iconButton}><Trash2 size={16} /></button>
                  </div>
                </div>

                <p className="mt-4 break-words text-sm font-semibold text-ink dark:text-white">{openMail.subject}</p>

                <div className="flex-1 space-y-4 py-5 sm:space-y-5 sm:py-6">
                  {threadLoading && <p className="text-sm text-ink-muted dark:text-ink-light">Loading conversation…</p>}
                  {thread.map((message) => (
                    <div key={message.id} className={`flex gap-2 sm:gap-3 ${message.from === 'me' ? 'justify-end' : ''}`}>
                      {message.from === 'them' && <Avatar name={openMail.sender} size={32} className="mt-1" />}
                      <div
                        className={`max-w-[85%] break-words rounded-xl px-3 py-2.5 text-sm leading-relaxed sm:max-w-[75%] sm:px-4 sm:py-3 ${
                          message.from === 'me' ? 'bg-primary text-white' : 'bg-surface-page text-ink dark:bg-night-soft dark:text-white'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className={`mt-2 text-xs ${message.from === 'me' ? 'text-white/80' : 'text-ink-light'}`}>{message.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendReply} className="flex items-center gap-2 border-t border-surface-line pt-4 dark:border-night-line sm:gap-3">
                  <Mic size={18} className="hidden shrink-0 text-ink-muted sm:block" />
                  <label htmlFor="reply" className="sr-only">Write message</label>
                  <input
                    id="reply"
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Write message"
                    className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-light dark:text-white"
                  />
                  <Paperclip size={18} className="hidden shrink-0 text-ink-muted sm:block" />
                  <ImageIcon size={18} className="hidden shrink-0 text-ink-muted sm:block" />
                  <button type="submit" className="btn-primary shrink-0 px-4 py-2 sm:px-5">
                    <span className="hidden sm:inline">Send</span> <Send size={15} />
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3 border-b border-surface-line pb-4 dark:border-night-line">
                  <div className="relative min-w-0 flex-1 basis-40">
                    <label htmlFor="mail-search" className="sr-only">Search mail</label>
                    <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                    <input
                      id="mail-search"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value)
                        setPage(1)
                      }}
                      placeholder="Search mail"
                      className="w-full rounded-full border border-surface-line bg-white py-2.5 pl-11 pr-4 text-sm placeholder:text-ink-light focus:border-primary focus:outline-none dark:border-night-line dark:bg-night-soft dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex h-9 items-center gap-2 px-1 text-xs font-semibold text-ink-muted dark:text-ink-light">
                      <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectPage} className="h-4 w-4 accent-primary" aria-label="Select all on this page" />
                      <span className="hidden sm:inline">All</span>
                    </label>
                    <button type="button" aria-label="Mark selected as important" disabled={!selectedIds.length} onClick={markImportant} className={`${iconButton} disabled:opacity-40`}><Info size={16} /></button>
                    <button type="button" aria-label="Delete selected" disabled={!selectedIds.length} onClick={() => trash(selectedIds)} className={`${iconButton} disabled:opacity-40`}><Trash2 size={16} /></button>
                  </div>
                </div>

                <ul className="divide-y divide-surface-line dark:divide-night-line">
                  {pagedMails.map((mail) => {
                    const outgoing = mail.folder === 'sent' || mail.folder === 'draft'
                    const who = outgoing ? `To: ${mail.sender}` : mail.sender
                    return (
                      <li key={mail.id} className="flex items-start gap-2 px-1 py-3 hover:bg-surface-page dark:hover:bg-night-soft sm:items-center sm:gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(mail.id)}
                          onChange={() => toggleSelect(mail.id)}
                          aria-label={`Select mail from ${mail.sender}`}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-primary sm:mt-0"
                        />
                        <button type="button" onClick={() => toggleStar(mail)} aria-label={`${mail.starred ? 'Unstar' : 'Star'} mail from ${mail.sender}`} className="shrink-0">
                          <Star size={17} className={mail.starred ? 'fill-[#FFB800] text-[#FFB800]' : 'text-ink-light'} />
                        </button>

                        <button type="button" onClick={() => setOpenId(mail.id)} className="min-w-0 flex-1 text-left">
                          <span className="flex items-center gap-2 sm:gap-3">
                            <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink dark:text-white sm:w-36 sm:flex-none">{who}</span>
                            <LabelChip label={mail.label} className="hidden sm:inline-block" />
                            <span className="hidden min-w-0 flex-1 truncate text-sm text-ink-muted dark:text-ink-light sm:block">{mail.subject}</span>
                            <span className="shrink-0 text-xs font-semibold text-ink-muted dark:text-ink-light">{mail.time}</span>
                          </span>
                          <span className="mt-1 flex items-center gap-2 sm:hidden">
                            <LabelChip label={mail.label} />
                            <span className="min-w-0 flex-1 truncate text-sm text-ink-muted dark:text-ink-light">{mail.subject}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>

                {visibleMails.length === 0 && (
                  <p className="py-10 text-center text-sm text-ink-muted dark:text-ink-light">
                    No messages here. Try another folder or search term.
                  </p>
                )}

                <Pagination
                  label={`Showing ${rangeStart}-${rangeEnd} of ${visibleMails.length}`}
                  prevLabel=""
                  nextLabel=""
                  onPrev={() => setPage((current) => Math.max(1, current - 1))}
                  onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabledPrev={clampedPage === 1}
                  disabledNext={clampedPage >= totalPages}
                />
              </>
            )}
          </section>
        </div>
      )}

      {isComposing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="New message">
          <form onSubmit={sendCompose} className="panel max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none p-5 sm:rounded-b-card sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink dark:text-white">New Message</h2>
              <button type="button" onClick={closeCompose} aria-label="Close compose window" className="text-ink-muted hover:text-primary">
                <X size={20} />
              </button>
            </div>

            <label className="block text-sm font-semibold text-ink dark:text-white">
              To
              <input value={compose.to} onChange={updateCompose('to')} placeholder="Recipient name or email" className="field mt-2" autoFocus />
            </label>
            <label className="mt-4 block text-sm font-semibold text-ink dark:text-white">
              Subject
              <input value={compose.subject} onChange={updateCompose('subject')} placeholder="Subject" className="field mt-2" />
            </label>
            <label className="mt-4 block text-sm font-semibold text-ink dark:text-white">
              Message
              <textarea rows={5} value={compose.message} onChange={updateCompose('message')} placeholder="Write your message" className="field mt-2 resize-none" />
            </label>

            {composeError && <p role="alert" className="mt-3 text-sm font-semibold text-[#EF3826]">{composeError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeCompose} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary px-6">Send <Send size={15} /></button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
