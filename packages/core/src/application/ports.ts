import { 
  Category, 
  Item, 
  Order, 
  OrderItem, 
  Table, 
  Restaurant, 
  User, 
  StaffUser,
  OptionGroup,
  Option 
} from "../domain/entities";
import { 
  ApiResponse, 
  PaginatedResponse, 
  AppError 
} from "@quick-bite/shared";

// Base repository interface
export interface BaseRepositoryPort<T> {
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

// Menu repository port
export interface MenuRepositoryPort {
  // Categories
  getCategories(restaurantId: string): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
  updateCategory(id: string, category: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Items
  getItems(restaurantId: string, categoryId?: string): Promise<Item[]>;
  getItemById(id: string): Promise<Item | null>;
  createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item>;
  updateItem(id: string, item: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Item>;
  deleteItem(id: string): Promise<void>;
  searchItems(restaurantId: string, query: string): Promise<Item[]>;
  
  // Option groups and options
  getOptionGroups(restaurantId: string): Promise<OptionGroup[]>;
  getOptionsByGroup(groupId: string): Promise<Option[]>;
  createOptionGroup(group: Omit<OptionGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<OptionGroup>;
  createOption(option: Omit<Option, 'id' | 'createdAt' | 'updatedAt'>): Promise<Option>;
}

// Table repository port
export interface TableRepositoryPort {
  findByRestaurantAndCode(restaurantId: string, code: string): Promise<Table | null>;
  getTablesByRestaurant(restaurantId: string): Promise<Table[]>;
  createTable(table: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>): Promise<Table>;
  updateTable(id: string, table: Partial<Omit<Table, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Table>;
  deleteTable(id: string): Promise<void>;
  isTableAvailable(tableId: string, date: Date): Promise<boolean>;
}

// Order repository port
export interface OrderRepositoryPort {
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByRestaurant(restaurantId: string, status?: string): Promise<Order[]>;
  findByTable(tableId: string): Promise<Order[]>;
  updateStatus(id: string, status: string, actorId?: string): Promise<Order>;
  addItems(orderId: string, items: Omit<OrderItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void>;
  getOrderHistory(restaurantId: string, limit?: number, offset?: number): Promise<PaginatedResponse<Order>>;
  getActiveOrders(restaurantId: string): Promise<Order[]>;
}

// Restaurant repository port
export interface RestaurantRepositoryPort {
  findById(id: string): Promise<Restaurant | null>;
  create(restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant>;
  update(id: string, restaurant: Partial<Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Restaurant>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<Restaurant[]>;
}

// User repository port
export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User>;
  delete(id: string): Promise<void>;
  authenticate(email: string, password: string): Promise<User | null>;
}

// Staff repository port
export interface StaffRepositoryPort {
  findById(id: string): Promise<StaffUser | null>;
  findByRestaurant(restaurantId: string): Promise<StaffUser[]>;
  create(staff: Omit<StaffUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<StaffUser>;
  update(id: string, staff: Partial<Omit<StaffUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<StaffUser>;
  delete(id: string): Promise<void>;
  getStaffByRole(restaurantId: string, role: string): Promise<StaffUser[]>;
}

// Notification service port
export interface NotificationServicePort {
  sendOrderConfirmation(order: Order): Promise<void>;
  sendOrderStatusUpdate(order: Order, newStatus: string): Promise<void>;
  sendKitchenNotification(order: Order): Promise<void>;
  sendCustomerNotification(userId: string, message: string): Promise<void>;
}

// Payment service port
export interface PaymentServicePort {
  processPayment(order: Order, paymentMethod: string): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  refundPayment(orderId: string, amount: number): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  getPaymentStatus(orderId: string): Promise<string>;
}

// File storage service port
export interface FileStorageServicePort {
  uploadImage(file: Buffer, filename: string, folder: string): Promise<string>;
  deleteImage(imagePath: string): Promise<void>;
  getImageUrl(imagePath: string): Promise<string>;
}

// Cache service port
export interface CacheServicePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

// Event bus port
export interface EventBusPort {
  publish(event: string, data: any): Promise<void>;
  subscribe(event: string, handler: (data: any) => Promise<void>): Promise<void>;
  unsubscribe(event: string, handler: (data: any) => Promise<void>): Promise<void>;
}

// Logger port
export interface LoggerPort {
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;
  debug(message: string, context?: any): void;
}

// Health check port
export interface HealthCheckPort {
  checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number }>;
  checkCache(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number }>;
  checkExternalServices(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number }>;
}
