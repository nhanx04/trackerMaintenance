import { authFetch } from '@/lib/api'
import type { Equipment, EquipmentFilter, EquipmentFormValues, EquipmentPage } from '@/types/equipment'

type ApiResponse<T> = { code?: number; message?: string; result: T }

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authFetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const data = (await res.json()) as ApiResponse<T>
  return data.result
}

async function reqForm<T>(path: string, form: FormData): Promise<T> {
  const res = await authFetch(path, {
    method: 'POST',
    body: form
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Upload failed: ${res.status}`)
  }

  const data = (await res.json()) as ApiResponse<T>
  return data.result
}

export const equipmentApi = {
  getAll: async (filter: EquipmentFilter): Promise<EquipmentPage> => {
    const params = new URLSearchParams()
    if (filter.name) params.set('name', filter.name)
    if (filter.status) params.set('status', filter.status)
    if (filter.location) params.set('location', filter.location)
    params.set('page', String(filter.page))
    params.set('size', String(filter.size))

    return req<EquipmentPage>(`/api/devices?${params.toString()}`)
  },

  getById: async (id: number | string): Promise<Equipment> => req<Equipment>(`/api/devices/${id}`),

  create: async (payload: EquipmentFormValues): Promise<Equipment> =>
    req<Equipment>('/api/devices', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  update: async (id: number | string, payload: Partial<EquipmentFormValues>): Promise<Equipment> =>
    req<Equipment>(`/api/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  delete: async (id: number | string): Promise<void> => {
    await req<void>(`/api/devices/${id}`, { method: 'DELETE' })
  },

  uploadImage: async (id: number | string, file: File): Promise<Equipment> => {
    const formData = new FormData()
    formData.append('file', file)
    return reqForm<Equipment>(`/api/devices/${id}/image`, formData)
  },

  deleteImage: async (id: number | string): Promise<void> => {
    await req<void>(`/api/devices/${id}/image`, { method: 'DELETE' })
  }
}
