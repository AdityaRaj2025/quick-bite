import { z } from 'zod';
import { ValidationError } from '@quick-bite/shared';

// Money value object
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: 'JPY' | 'USD' | 'EUR' = 'JPY'
  ) {
    if (amount < 0) {
      throw new ValidationError('Amount cannot be negative');
    }
    if (!Number.isFinite(amount)) {
      throw new ValidationError('Amount must be a finite number');
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new ValidationError('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new ValidationError('Cannot subtract money with different currencies');
    }
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new ValidationError('Result cannot be negative');
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new ValidationError('Factor cannot be negative');
    }
    return new Money(this.amount * factor, this.currency);
  }

  format(locale = 'ja-JP'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  static zero(currency: 'JPY' | 'USD' | 'EUR' = 'JPY'): Money {
    return new Money(0, currency);
  }

  static fromString(value: string, currency: 'JPY' | 'USD' | 'EUR' = 'JPY'): Money {
    const amount = parseFloat(value);
    if (isNaN(amount)) {
      throw new ValidationError('Invalid money string');
    }
    return new Money(amount, currency);
  }
}

// Percentage value object
export class Percentage {
  constructor(public readonly value: number) {
    if (value < 0 || value > 100) {
      throw new ValidationError('Percentage must be between 0 and 100');
    }
    if (!Number.isFinite(value)) {
      throw new ValidationError('Percentage must be a finite number');
    }
  }

  of(amount: number): number {
    return (amount * this.value) / 100;
  }

  format(): string {
    return `${this.value.toFixed(2)}%`;
  }

  static fromString(value: string): Percentage {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new ValidationError('Invalid percentage string');
    }
    return new Percentage(num);
  }
}

// Time value object
export class Time {
  constructor(
    public readonly hour: number,
    public readonly minute: number
  ) {
    if (hour < 0 || hour > 23) {
      throw new ValidationError('Hour must be between 0 and 23');
    }
    if (minute < 0 || minute > 59) {
      throw new ValidationError('Minute must be between 0 and 59');
    }
  }

  static fromString(timeString: string): Time {
    const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      throw new ValidationError('Invalid time format. Use HH:MM');
    }
    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    return new Time(hour, minute);
  }

  static fromDate(date: Date): Time {
    return new Time(date.getHours(), date.getMinutes());
  }

  toDate(baseDate: Date = new Date()): Date {
    const date = new Date(baseDate);
    date.setHours(this.hour, this.minute, 0, 0);
    return date;
  }

  format(): string {
    return `${this.hour.toString().padStart(2, '0')}:${this.minute.toString().padStart(2, '0')}`;
  }

  isBefore(other: Time): boolean {
    return this.hour < other.hour || (this.hour === other.hour && this.minute < other.minute);
  }

  isAfter(other: Time): boolean {
    return this.hour > other.hour || (this.hour === other.hour && this.minute > other.minute);
  }

  addMinutes(minutes: number): Time {
    const totalMinutes = this.hour * 60 + this.minute + minutes;
    const newHour = Math.floor(totalMinutes / 60) % 24;
    const newMinute = totalMinutes % 60;
    return new Time(newHour, newMinute);
  }
}

// Duration value object
export class Duration {
  constructor(public readonly minutes: number) {
    if (minutes < 0) {
      throw new ValidationError('Duration cannot be negative');
    }
    if (!Number.isInteger(minutes)) {
      throw new ValidationError('Duration must be an integer');
    }
  }

  static fromHours(hours: number): Duration {
    return new Duration(Math.round(hours * 60));
  }

  static fromString(durationString: string): Duration {
    const match = durationString.match(/^(\d+):(\d{2})$/);
    if (!match) {
      throw new ValidationError('Invalid duration format. Use HH:MM');
    }
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return new Duration(hours * 60 + minutes);
  }

  toHours(): number {
    return this.minutes / 60;
  }

  format(): string {
    const hours = Math.floor(this.minutes / 60);
    const minutes = this.minutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  add(other: Duration): Duration {
    return new Duration(this.minutes + other.minutes);
  }

  subtract(other: Duration): Duration {
    const result = this.minutes - other.minutes;
    if (result < 0) {
      throw new ValidationError('Result cannot be negative');
    }
    return new Duration(result);
  }
}

// Validation schemas
export const moneySchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['JPY', 'USD', 'EUR']),
});

export const percentageSchema = z.object({
  value: z.number().min(0).max(100),
});

export const timeSchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});

export const durationSchema = z.object({
  minutes: z.number().int().min(0),
});

// Utility functions for calculations
export function computeTax(subtotal: Money, taxRate: Percentage): Money {
  return new Money(taxRate.of(subtotal.amount), subtotal.currency);
}

export function computeServiceCharge(subtotal: Money, serviceChargeRate: Percentage): Money {
  return new Money(serviceChargeRate.of(subtotal.amount), subtotal.currency);
}

export function computeTotal(
  subtotal: Money,
  tax: Money,
  serviceCharge: Money,
  discount: Money = Money.zero(subtotal.currency)
): Money {
  return subtotal.add(tax).add(serviceCharge).subtract(discount);
}

export function computeLineTotal(
  basePrice: Money,
  quantity: number,
  options: Money[] = []
): Money {
  const baseTotal = basePrice.multiply(quantity);
  const optionsTotal = options.reduce((sum, option) => sum.add(option), Money.zero(basePrice.currency));
  return baseTotal.add(optionsTotal);
}
