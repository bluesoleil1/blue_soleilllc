const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api'

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    let errorMessage = 'An error occurred'
    try {
      const error = await response.json()
      errorMessage = error.message || errorMessage
    } catch {
      // If response is not JSON, try to get text
      try {
        const text = await response.text()
        errorMessage = text || errorMessage
      } catch {
        errorMessage = `Request failed with status ${response.status}`
      }
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name?: string) =>
    apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  me: () => apiRequest<any>('/auth/me'),
}

// Booking API
export const bookingApi = {
  create: (data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    serviceType: string
    message?: string
  }) =>
    apiRequest<{ booking: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () => apiRequest<{ bookings: any[] }>('/bookings'),

  updateStatus: (id: string, status: string) =>
    apiRequest<{ booking: any }>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// Contact API
export const contactApi = {
  create: (data: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
  }) =>
    apiRequest<{ contact: any }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () => apiRequest<{ contacts: any[] }>('/contact'),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/contact/${id}`, {
      method: 'DELETE',
    }),
}

// Email API
export const emailApi = {
  send: (data: {
    to: string | string[]
    subject: string
    html: string
    text?: string
    replyTo?: string
    cc?: string | string[]
    bcc?: string | string[]
  }) =>
    apiRequest<{ success: boolean; messageId?: string; message: string }>('/email/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () => apiRequest<{ emails: any[] }>('/email'),
}
