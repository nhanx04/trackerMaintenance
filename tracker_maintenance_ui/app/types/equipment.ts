export type EquipmentStatus = 'AVAILABLE' | 'MAINTENANCE' | 'BROKEN'

export interface Equipment {
  id: number
  code: string
  name: string
  description?: string
  location?: string
  imageUrl?: string
  status: EquipmentStatus
  createdAt?: string
  updatedAt?: string
}

export interface EquipmentFilter {
  name?: string
  status?: EquipmentStatus | ''
  location?: string
  page: number
  size: number
}

export interface EquipmentFormValues {
  code: string
  name: string
  location?: string
  status: EquipmentStatus
  description?: string
}

export interface EquipmentPage {
  content: Equipment[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}
