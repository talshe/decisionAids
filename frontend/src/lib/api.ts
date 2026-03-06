const getApiBaseUrl = () =>
  import.meta.env.VITE_API_BASE_URL?.toString() || 'http://localhost:5000'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string | null
  body?: unknown
}

export const apiRequest = async <T>(
  path: string,
  { method = 'GET', token, body }: RequestOptions = {},
): Promise<T> => {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const json = (await response.json()) as { error?: string }
      throw new Error(json.error || 'Request failed.')
    }

    const text = await response.text()
    throw new Error(text || 'Request failed.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
