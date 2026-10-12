/** Shared loading / error panel for pages that read from the API. */
export default function DataState({ loading, error, onRetry }) {
  if (loading) {
    return (
      <p className="panel p-10 text-center text-sm text-ink-muted dark:text-ink-light" role="status">
        Loading…
      </p>
    )
  }
  if (error) {
    return (
      <div className="panel p-10 text-center" role="alert">
        <p className="text-sm font-semibold text-[#EF3826]">{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary mt-4">
            Try again
          </button>
        )}
      </div>
    )
  }
  return null
}
