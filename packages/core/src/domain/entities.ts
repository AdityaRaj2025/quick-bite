import { z } from 'zod';
import { BaseEntity, AuditableEntity, ORDER_STATUSES, USER_ROLES } from '@quick-bite/shared';

// Base types
export type UUID = string;
export type Currency = 'JPY' | 'USD' | 'EUR';
export type Locale = 'en' | 'ja' | 'ko' | 'zh';

// Restaurant entity
export interface Restaurant extends BaseEntity {
  name: string;
  localeDefault: Locale;
  taxRatePercent: number;
  serviceChargePercent: number;
  timezone: string;
  isActive: boolean;
  settings: RestaurantSettings;
}

export interface RestaurantSettings {
  allowTableOrders: boolean;
  allowTakeaway: boolean;
  allowDelivery: boolean;
  maxOrderAmount: number;
  minOrderAmount: number;
  orderLeadTime: number; // minutes
}

// Table entity
export interface Table extends BaseEntity {
  restaurantId: UUID;
  code: string;
  displayName?: string;
  capacity: number;
  isActive: boolean;
  location?: TableLocation;
}

export interface TableLocation {
  floor: number;
  section: string;
  coordinates?: { x: number; y: number };
}

// Category entity
export interface Category extends BaseEntity {
  restaurantId: UUID;
  nameI18n: Record<Locale, string>;
  descriptionI18n?: Record<Locale, string>;
  imagePath?: string;
  sortOrder: number;
  isActive: boolean;
  parentCategoryId?: UUID;
}

// Item entity
export interface Item extends BaseEntity {
  restaurantId: UUID;
  categoryId?: UUID;
  nameI18n: Record<Locale, string>;
  descriptionI18n?: Record<Locale, string>;
  priceJpy: number;
  allergens?: string[];
  dietaryInfo?: DietaryInfo;
  imagePath?: string;
  isActive: boolean;
  sortOrder: number;
  preparationTime: number; // minutes
  availability: ItemAvailability;
}

export interface DietaryInfo {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isHalal: boolean;
  isKosher: boolean;
  containsNuts: boolean;
  containsDairy: boolean;
  containsSeafood: boolean;
}

export interface ItemAvailability {
  isAvailable: boolean;
  availableFrom?: string; // HH:mm format
  availableTo?: string; // HH:mm format
  availableDays: number[]; // 0-6 (Sunday-Saturday)
  maxDailyOrders?: number;
}

// Option groups and options
export interface OptionGroup extends BaseEntity {
  restaurantId: UUID;
  nameI18n: Record<Locale, string>;
  descriptionI18n?: Record<Locale, string>;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface Option extends BaseEntity {
  groupId: UUID;
  nameI18n: Record<Locale, string>;
  descriptionI18n?: Record<Locale, string>;
  priceDeltaJpy: number;
  isAvailable: boolean;
  sortOrder: number;
}

// Order entity
export interface Order extends BaseEntity {
  restaurantId: UUID;
  tableId?: UUID;
  tableCode?: string;
  customerId?: UUID;
  locale: Locale;
  status: keyof typeof ORDER_STATUSES;
  orderType: 'table' | 'takeaway' | 'delivery';
  items: OrderItem[];
  subtotalJpy: number;
  taxJpy: number;
  serviceChargeJpy: number;
  discountJpy: number;
  totalJpy: number;
  notes?: string;
  specialInstructions?: string;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: 'cash' | 'card' | 'mobile';
}

// Order item entity
export interface OrderItem extends BaseEntity {
  orderId: UUID;
  itemId?: UUID;
  nameSnapshot: string;
  descriptionSnapshot?: string;
  quantity: number;
  basePriceJpy: number;
  options: OrderItemOption[];
  lineTotalJpy: number;
  notes?: string;
  preparationStatus: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface OrderItemOption extends BaseEntity {
  orderItemId: UUID;
  nameSnapshot: string;
  priceDeltaJpy: number;
}

// User entities
export interface User extends BaseEntity {
  email: string;
  role: keyof typeof USER_ROLES;
  restaurantId?: UUID;
  profile: UserProfile;
  preferences: UserPreferences;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
}

export interface UserPreferences {
  locale: Locale;
  currency: Currency;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  orderUpdates: boolean;
  promotions: boolean;
}

// Staff user entity
export interface StaffUser extends BaseEntity {
  restaurantId: UUID;
  userId: UUID;
  role: 'staff' | 'manager' | 'kitchen' | 'cashier';
  permissions: string[];
  isActive: boolean;
  schedule?: StaffSchedule;
}

export interface StaffSchedule {
  workDays: number[]; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breakStart?: string;
  breakEnd?: string;
}

// Validation schemas
export const restaurantSchema = z.object({
  name: z.string().min(1).max(100),
  localeDefault: z.enum(['en', 'ja', 'ko', 'zh']),
  taxRatePercent: z.number().min(0).max(100),
  serviceChargePercent: z.number().min(0).max(100),
  timezone: z.string(),
  isActive: z.boolean(),
});

export const itemSchema = z.object({
  nameI18n: z.record(z.enum(['en', 'ja', 'ko', 'zh']), z.string().min(1)),
  descriptionI18n: z.record(z.enum(['en', 'ja', 'ko', 'zh']), z.string()).optional(),
  priceJpy: z.number().positive(),
  allergens: z.array(z.string()).optional(),
  preparationTime: z.number().min(0),
  isActive: z.boolean(),
});

export const orderSchema = z.object({
  restaurantId: z.string().uuid(),
  tableCode: z.string().optional(),
  locale: z.enum(['en', 'ja', 'ko', 'zh']),
  items: z.array(z.object({
    nameSnapshot: z.string().min(1),
    quantity: z.number().positive(),
    basePriceJpy: z.number().positive(),
    lineTotalJpy: z.number().positive(),
  })).min(1),
  notes: z.string().optional(),
});
