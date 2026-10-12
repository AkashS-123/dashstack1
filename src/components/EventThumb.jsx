/** Event cover photo, or a coloured tile with the first letter when there is none. */
export default function EventThumb({ event, className = '' }) {
  if (event.image) {
    return <img src={event.image} alt={`${event.title} cover`} loading="lazy" className={`object-cover ${className}`} />
  }
  return (
    <div
      aria-hidden="true"
      style={{ backgroundColor: `${event.color}22`, color: event.color }}
      className={`grid place-items-center text-lg font-bold ${className}`}
    >
      {event.title.slice(0, 1).toUpperCase()}
    </div>
  )
}
