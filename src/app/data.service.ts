import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
  id: number;
  title: string;
  targetUrl: string;
  icon?: string;
  parentId?: number;
  subMenus: MenuItem[];
  sortOrder: number;
  isActive: boolean;
  actionType: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isVisible: boolean;
}

export interface PlantDetail {
  id?: number;
  lightRequirements: string;
  wateringFrequency: string;
  temperatureRange: string;
  toxicityToPets: boolean;
  difficultyLevel: string;
  matureSize: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  shortDescription: string;
  detailedDescription: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  categoryId: number;
  category?: Category;
  isGiftable: boolean;
  weight: number;
  plantDetailId?: number;
  plantDetail?: PlantDetail;
}

export interface CartItem {
  productId: number;
  product: Product;
  quantity: number;
  customPotColor?: string;
}

export interface Order {
  id?: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  subtotal?: number;
  shippingCharges?: number;
  totalAmount?: number;
  deliveryStatus?: string;
  deliveryTrackingNumber?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentStatus?: string;
  isGift: boolean;
  giftMessage?: string;
  recipientName?: string;
  recipientPhone?: string;
  giftWrapOption: boolean;
  giftWrapCharge?: number;
  orderItems: { productId: number; quantity: number; customPotColor?: string }[];
}

export interface DecorPackage {
  id: number;
  spaceType: string;
  packageName: string;
  description: string;
  targetDimensions: string;
  basePrice: number;
  imageUrl?: string;
  includedProductIdsJson: string;
}

export interface ConsultationBooking {
  id?: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredDate: string;
  spaceType: string;
  dimensions: string;
  customRequirements: string;
  status?: string;
}

export interface WarehouseStock {
  id: number;
  productId: number;
  product?: Product;
  quantityOnHand: number;
  quantityReserved: number;
  lowStockThreshold: number;
  storageLocation: string;
}

export interface InventoryTransaction {
  id: number;
  productId: number;
  product?: Product;
  type: string;
  quantity: number;
  timestamp: string;
  changedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly apiUrl = 'https://localhost:44311/api';

  // Signals for application state
  public cart = signal<CartItem[]>([]);
  public menuItems = signal<MenuItem[]>([]);
  public activeUserEmail = signal<string>('guest@greenspace.com'); // mock user

  // Computed state
  public cartCount = computed(() => this.cart().reduce((acc, item) => acc + item.quantity, 0));
  
  public cartSubtotal = computed(() => 
    this.cart().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  constructor(private http: HttpClient) {
    // Load cart from LocalStorage on initialization
    const savedCart = localStorage.getItem('gs_cart');
    if (savedCart) {
      try {
        this.cart.set(JSON.parse(savedCart));
      } catch (e) {
        localStorage.removeItem('gs_cart');
      }
    }

    // Auto-save cart to LocalStorage on change
    effect(() => {
      localStorage.setItem('gs_cart', JSON.stringify(this.cart()));
    });

    // Initial load of dynamic menus
    this.loadNavigation();
  }

  // Cart actions
  public addToCart(product: Product, quantity = 1, customPotColor?: string) {
    const current = this.cart();
    const idx = current.findIndex(item => item.productId === product.id && item.customPotColor === customPotColor);
    
    if (idx > -1) {
      current[idx].quantity += quantity;
      this.cart.set([...current]);
    } else {
      this.cart.set([...current, { productId: product.id, product, quantity, customPotColor }]);
    }
  }

  public updateCartQuantity(productId: number, quantity: number, customPotColor?: string) {
    const current = this.cart();
    const idx = current.findIndex(item => item.productId === productId && item.customPotColor === customPotColor);
    if (idx > -1) {
      if (quantity <= 0) {
        current.splice(idx, 1);
      } else {
        current[idx].quantity = quantity;
      }
      this.cart.set([...current]);
    }
  }

  public removeFromCart(productId: number, customPotColor?: string) {
    this.cart.set(this.cart().filter(item => !(item.productId === productId && item.customPotColor === customPotColor)));
  }

  public clearCart() {
    this.cart.set([]);
  }

  // Navigation API
  public loadNavigation() {
    this.http.get<MenuItem[]>(`${this.apiUrl}/navigation`).subscribe({
      next: (items) => this.menuItems.set(items),
      error: (err) => console.error('Failed to load navigation config', err)
    });
  }

  public getAdminNavigation(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/navigation/all`);
  }

  public saveMenuItem(item: MenuItem): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.apiUrl}/navigation`, item);
  }

  public deleteMenuItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/navigation/${id}`);
  }

  // Catalog API
  public getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/product/categories`);
  }

  public getProducts(params?: { categoryId?: number; difficulty?: string; light?: string; petFriendly?: boolean; search?: string }): Observable<Product[]> {
    let queryParams: any = {};
    if (params) {
      if (params.categoryId) queryParams.categoryId = params.categoryId;
      if (params.difficulty) queryParams.difficulty = params.difficulty;
      if (params.light) queryParams.light = params.light;
      if (params.petFriendly !== undefined) queryParams.petFriendly = params.petFriendly;
      if (params.search) queryParams.search = params.search;
    }
    return this.http.get<Product[]>(`${this.apiUrl}/product`, { params: queryParams });
  }

  public getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/product/${id}`);
  }

  public saveProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/product`, product);
  }

  public deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/product/${id}`);
  }

  public seedProducts(): Observable<any> {
    return this.http.post(`${this.apiUrl}/product/seed`, {});
  }

  // Orders & Payment API
  public checkout(order: Order): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/order/checkout`, order);
  }

  public verifyPayment(paymentDetails: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/order/verify-payment`, paymentDetails);
  }

  public getCustomerOrders(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/order/customer/${email}`);
  }

  public getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/order/${id}`);
  }

  // Decoration Planner API
  public getDecorPackages(spaceType?: string): Observable<DecorPackage[]> {
    return this.http.get<DecorPackage[]>(`${this.apiUrl}/decor/packages`, {
      params: spaceType ? { spaceType } : {}
    });
  }

  public getDecorPackage(id: number): Observable<DecorPackage> {
    return this.http.get<DecorPackage>(`${this.apiUrl}/decor/packages/${id}`);
  }

  public bookConsultation(booking: ConsultationBooking): Observable<ConsultationBooking> {
    return this.http.post<ConsultationBooking>(`${this.apiUrl}/decor/book`, booking);
  }

  public getConsultationBookings(): Observable<ConsultationBooking[]> {
    return this.http.get<ConsultationBooking[]>(`${this.apiUrl}/decor/bookings`);
  }

  public updateBookingStatus(id: number, status: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/decor/bookings/${id}/status`, `"${status}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Warehouse & Inventory API
  public getWarehouseInventory(): Observable<WarehouseStock[]> {
    return this.http.get<WarehouseStock[]>(`${this.apiUrl}/inventory`);
  }

  public adjustStock(productId: number, quantityChange: number, changedBy: string = 'Admin'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inventory/adjust`, { productId, quantityChange, changedBy });
  }

  public updateStockLocation(productId: number, storageLocation: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inventory/location`, { productId, storageLocation });
  }

  public getInventoryTransactions(): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/inventory/transactions`);
  }

  // Dashboard Analytics API
  public getDashboardAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics/dashboard`);
  }
}
