import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({ baseURL: '/api', withCredentials: true, timeout: 60_000 })

let csrfToken: string | null = null
let csrfRequest: Promise<string> | null = null

export async function ensureCsrfToken(force = false): Promise<string> {
  if (csrfToken && !force) return csrfToken
  csrfRequest ??= api
    .get<{ csrfToken: string }>('/csrf-token')
    .then((res) => (csrfToken = res.data.csrfToken))
    .finally(() => (csrfRequest = null))
  return csrfRequest
}

const UNSAFE = new Set(['post', 'put', 'patch', 'delete'])

api.interceptors.request.use(async (config) => {
  if (UNSAFE.has((config.method ?? 'get').toLowerCase())) {
    config.headers.set('x-csrf-token', await ensureCsrfToken())
  }
  return config
})

api.interceptors.response.use(undefined, async (error: AxiosError<{ message?: string }>) => {
  const config = error.config as (InternalAxiosRequestConfig & { _csrfRetried?: boolean }) | undefined
  if (error.response?.status === 403 && /CSRF/i.test(error.response.data?.message ?? '') && config && !config._csrfRetried) {
    config._csrfRetried = true
    config.headers.set('x-csrf-token', await ensureCsrfToken(true))
    return api.request(config)
  }
  throw error
})

export interface ApiIssue {
  path: string
  message: string
}

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Cannot reach the server. Check your connection and try again.'
    const data = error.response.data as { message?: string } | Blob | undefined
    if (data && !(data instanceof Blob) && data.message) return data.message
  }
  return fallback
}

export function errorIssues(error: unknown): string[] {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { issues?: (ApiIssue | string)[] } | undefined
    return (data?.issues ?? []).map((i) => (typeof i === 'string' ? i : i.message))
  }
  return []
}

/** Downloads a binary response (exports) and saves it using the server-provided filename. */
export async function downloadFile(url: string, params: Record<string, string | undefined>) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  const res = await api.get<Blob>(url, { params: clean, responseType: 'blob', timeout: 180_000 })
  const disposition = String(res.headers['content-disposition'] ?? '')
  const filename = /filename="?([^"]+)"?/.exec(disposition)?.[1] ?? 'export'
  const href = URL.createObjectURL(res.data)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(href), 10_000)
  return filename
}
