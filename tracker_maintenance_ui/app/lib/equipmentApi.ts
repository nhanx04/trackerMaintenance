import axios from 'axios'

import { API_BASE_URL } from '@/lib/api'
import { getAuth } from '@/lib/auth'
import type { Equipment, EquipmentFilter, EquipmentFormValues, EquipmentPage } from '@/types/equipment'

type ApiResponse<T> = { code?: number; message?: string; result: T }

function token(): string {
  const auth = getAuth()
  if (!auth?.token) throw new Error('Unauthenticated')
  return auth.token
}

const equipmentClient = axios.create({
  baseURL: API_BASE_URL
})

equipmentClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${token()}`
  return config
})

function unwrap<T>(data: ApiResponse<T>) {
  return data.result
}

export const equipmentApi = {
  getAll: async (filter: EquipmentFilter): Promise<EquipmentPage> => {
    const { data } = await equipmentClient.get<ApiResponse<EquipmentPage>>('/api/devices', {
      params: {
        ...(filter.name ? { name: filter.name } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.location ? { location: filter.location } : {}),
        page: filter.page,
        size: filter.size
      }
    })
    return unwrap(data)
  },

  getById: async (id: number | string): Promise<Equipment> => {
    const { data } = await equipmentClient.get<ApiResponse<Equipment>>(`/api/devices/${id}`)
    return unwrap(data)
  },

  create: async (payload: EquipmentFormValues): Promise<Equipment> => {
    const { data } = await equipmentClient.post<ApiResponse<Equipment>>('/api/devices', payload)
    return unwrap(data)
  },

  update: async (id: number | string, payload: Partial<EquipmentFormValues>): Promise<Equipment> => {
    const { data } = await equipmentClient.put<ApiResponse<Equipment>>(`/api/devices/${id}`, payload)
    return unwrap(data)
  },

  delete: async (id: number | string): Promise<void> => {
    await equipmentClient.delete(`/api/devices/${id}`)
  },

  uploadImage: async (id: number | string, file: File): Promise<Equipment> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await equipmentClient.post<ApiResponse<Equipment>>(`/api/devices/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return unwrap(data)
  },

  deleteImage: async (id: number | string): Promise<void> => {
    await equipmentClient.delete(`/api/devices/${id}/image`)
  }
}
