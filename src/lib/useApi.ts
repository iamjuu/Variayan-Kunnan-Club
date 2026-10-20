import { useCallback, useEffect, useState } from 'react'
import { api, errorMessage } from './api'

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(Boolean(url))
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!url) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<T>(url)
      setData(res.data)
    } catch (err) {
      setError(errorMessage(err))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, loading, error, reload, setData }
}
