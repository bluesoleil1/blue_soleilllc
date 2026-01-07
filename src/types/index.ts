export enum ServiceType {
  TERM_LIFE = 'TERM_LIFE',
  PERMANENT_LIFE = 'PERMANENT_LIFE',
  INDEX_UNIVERSAL_LIFE = 'INDEX_UNIVERSAL_LIFE',
  INDEX_ANNUITY = 'INDEX_ANNUITY',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string
  email: string
  name?: string
  role: Role
  createdAt: string
}

export interface Booking {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceType: ServiceType
  message?: string
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  createdAt: string
}

export interface Email {
  id: string
  to: string
  subject: string
  html: string
  text?: string
  sentBy: string
  status: string
  messageId?: string
  createdAt: string
}
