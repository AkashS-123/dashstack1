import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client.js'

/**
 * Loads a json-server collection and keeps it in sync after changes.
 *
 *   const { items, loading, error, create, update, remove } = useCollection('team')
 *
 * create / update / remove return a promise (they throw on failure so the
 * caller can show a message) and update `items` once the server has answered.
 */
export default function useCollection(name, query = '') {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const alive = useRef(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get(`/${name}${query}`)
      if (alive.current) setItems(data)
    } catch (err) {
      if (alive.current) setError(err.message)
    } finally {
      if (alive.current) setLoading(false)
    }
  }, [name, query])

  useEffect(() => {
    alive.current = true
    load()
    return () => {
      alive.current = false
    }
  }, [load])

  const create = useCallback(
    async (values) => {
      const saved = await api.post(`/${name}`, values)
      setItems((current) => [...current, saved])
      return saved
    },
    [name],
  )

  const update = useCallback(
    async (id, values) => {
      const saved = await api.patch(`/${name}/${id}`, values)
      setItems((current) => current.map((item) => (item.id === id ? saved : item)))
      return saved
    },
    [name],
  )

  const remove = useCallback(
    async (id) => {
      await api.remove(`/${name}/${id}`)
      setItems((current) => current.filter((item) => item.id !== id))
    },
    [name],
  )

  return { items, setItems, loading, error, reload: load, create, update, remove }
}
