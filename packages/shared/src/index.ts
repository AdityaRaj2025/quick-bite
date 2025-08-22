// Common types and utilities shared across the application

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common entity types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditableEntity extends BaseEntity {
  createdBy?: string;
  updatedBy?: string;
}

// Validation schemas
export const commonSchemas = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
};

// Utility functions
export function generateId(): string {
  return crypto.randomUUID();
}

export function formatCurrency(amount: number, currency = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date, locale = 'ja-JP'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Error handling
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

// Constants
export const ORDER_STATUSES = {
  PLACED: 'placed',
  ACKNOWLEDGED: 'acknowledged',
  IN_KITCHEN: 'in_kitchen',
  READY: 'ready',
  SERVED: 'served',
  CANCELLED: 'cancelled',
} as const;

export const USER_ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
  KITCHEN: 'kitchen',
} as const;

export const SUPPORTED_LOCALES = ['en', 'ja', 'ko', 'zh'] as const;

// Type guards
export function isValidOrderStatus(status: string): status is keyof typeof ORDER_STATUSES {
  return Object.values(ORDER_STATUSES).includes(status as any);
}

export function isValidUserRole(role: string): role is keyof typeof USER_ROLES {
  return Object.values(USER_ROLES).includes(role as any);
}

export function isValidLocale(locale: string): locale is typeof SUPPORTED_LOCALES[number] {
  return SUPPORTED_LOCALES.includes(locale as any);
}
