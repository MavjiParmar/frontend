import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Product, Category, CartItem } from './data.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shop-container container animate-fade-in">
      
      <!-- Filters Sidebar -->
      <aside class="sidebar">
        <div class="filter-group">
          <h3>Search Catalog</h3>
          <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()" placeholder="Search plants, tools..." class="form-input search-input">
        </div>

        <div class="filter-group">
          <h3>Categories</h3>
          <div class="checkbox-list">
            <label class="filter-label">
              <input type="radio" name="category" [checked]="selectedCategoryId() === null" (change)="selectCategory(null)">
              All Items
            </label>
            <label *ngFor="let cat of categories()" class="filter-label">
              <input type="radio" name="category" [checked]="selectedCategoryId() === cat.id" (change)="selectCategory(cat.id)">
              {{ cat.name }}
            </label>
          </div>
        </div>

        <div class="filter-group">
          <h3>Light Requirements</h3>
          <select [(ngModel)]="selectedLight" (change)="applyFilters()" class="form-input">
            <option value="">Any Light</option>
            <option value="Low">Low Light (Indoor)</option>
            <option value="Medium">Medium Light</option>
            <option value="Bright Indirect">Bright Indirect</option>
            <option value="Direct Sun">Direct Sun</option>
          </select>
        </div>

        <div class="filter-group">
          <h3>Plant Care Level</h3>
          <select [(ngModel)]="selectedDifficulty" (change)="applyFilters()" class="form-input">
            <option value="">Any Level</option>
            <option value="Beginner">Beginner Friendly</option>
            <option value="Intermediate">Intermediate Care</option>
            <option value="Expert">Expert Level</option>
          </select>
        </div>

        <div class="filter-group">
          <h3>Pet Safety</h3>
          <label class="switch-container">
            <input type="checkbox" [(ngModel)]="petFriendlyOnly" (change)="applyFilters()">
            <span class="switch-label">Safe for Pets (Non-toxic)</span>
          </label>
        </div>
      </aside>

      <!-- Main Products Grid -->
      <main class="products-area">
        <div class="area-header">
          <h2>Our Botanicals</h2>
          <span class="product-count">{{ products().length }} items found</span>
        </div>

        <div class="grid-3" *ngIf="products().length > 0; else noProducts">
          <div *ngFor="let prod of products()" class="product-item card">
            <div class="product-img-wrapper" (click)="openProductModal(prod)">
              <img [src]="prod.imageUrl || 'assets/images/placeholder.jpg'" [alt]="prod.name" class="product-img">
            </div>
            <div class="product-info">
              <span class="badge badge-green">{{ prod.category?.name }}</span>
              <h3 (click)="openProductModal(prod)" class="clickable-title">{{ prod.name }}</h3>
              <p class="product-desc">{{ prod.shortDescription }}</p>
              
              <div class="product-footer">
                <span class="price">₹{{ prod.price }}</span>
                <button (click)="addToCart(prod)" class="btn btn-primary btn-sm">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noProducts>
          <div class="no-results card text-center">
            <div class="no-results-icon">🍂</div>
            <h3>No Products Found</h3>
            <p>Try adjusting your search filters or clear filters to view all products.</p>
            <button (click)="clearFilters()" class="btn btn-secondary">Reset Filters</button>
          </div>
        </ng-template>
      </main>

      <!-- Cart Side Drawer Toggle Button -->
      <button class="cart-trigger btn btn-primary" (click)="toggleCartDrawer(true)">
        🛒 Cart ({{ cartCount() }}) - ₹{{ cartSubtotal() }}
      </button>

      <!-- Cart Drawer Overlay -->
      <div class="cart-drawer-overlay" [class.open]="cartOpen()" (click)="toggleCartDrawer(false)">
        <div class="cart-drawer" (click)="$event.stopPropagation()">
          <div class="drawer-header">
            <h2>Your Shopping Cart</h2>
            <button class="close-drawer-btn" (click)="toggleCartDrawer(false)">✕</button>
          </div>

          <div class="drawer-content">
            <div *ngIf="cart().length === 0" class="empty-cart text-center">
              <div class="empty-cart-icon">🛒</div>
              <p>Your cart is empty. Fill it with plants!</p>
              <button class="btn btn-primary" (click)="toggleCartDrawer(false)">Start Shopping</button>
            </div>

            <!-- Cart Items List -->
            <div *ngFor="let item of cart()" class="cart-item-row">
              <img [src]="item.product.imageUrl || 'assets/images/placeholder.jpg'" [alt]="item.product.name" class="cart-item-img">
              <div class="cart-item-details">
                <h4>{{ item.product.name }}</h4>
                <div *ngIf="item.customPotColor" class="custom-pot-badge">
                  Pot Color: {{ item.customPotColor }}
                </div>
                <div class="price">₹{{ item.product.price }}</div>
                <div class="quantity-controls">
                  <button (click)="decreaseQty(item)" class="qty-btn">-</button>
                  <span class="qty-val">{{ item.quantity }}</span>
                  <button (click)="increaseQty(item)" class="qty-btn">+</button>
                </div>
              </div>
              <button class="remove-item-btn" (click)="removeFromCart(item)">✕</button>
            </div>
          </div>

          <!-- Checkout Section in Cart -->
          <div class="drawer-footer" *ngIf="cart().length > 0">
            <div class="subtotal-row">
              <span>Subtotal:</span>
              <span class="price">₹{{ cartSubtotal() }}</span>
            </div>
            
            <div *ngIf="!checkoutMode()" class="action-row">
              <button (click)="enterCheckout()" class="btn btn-primary w-100">Proceed to Checkout</button>
            </div>

            <!-- Checkout Form -->
            <div *ngIf="checkoutMode()" class="checkout-form animate-fade-in">
              <h3>Shipping Details</h3>
              <div class="form-group">
                <input type="text" [(ngModel)]="shippingName" placeholder="Full Name" class="form-input">
              </div>
              <div class="form-group">
                <input type="email" [(ngModel)]="shippingEmail" placeholder="Email Address" class="form-input">
              </div>
              <div class="form-group">
                <input type="text" [(ngModel)]="shippingAddress" placeholder="Delivery Address" class="form-input">
              </div>
              <div class="form-row grid-2">
                <input type="text" [(ngModel)]="shippingCity" placeholder="City" class="form-input">
                <input type="text" [(ngModel)]="shippingPostalCode" placeholder="Pincode" class="form-input">
              </div>

              <!-- Gift Checkbox -->
              <div class="form-group gift-toggle">
                <label>
                  <input type="checkbox" [(ngModel)]="isGiftOrder">
                  🎁 Mark this order as a Gift (+₹50 for Premium Wrap)
                </label>
              </div>

              <div *ngIf="isGiftOrder" class="gift-fields animate-fade-in">
                <div class="form-group">
                  <input type="text" [(ngModel)]="recipientName" placeholder="Recipient's Name" class="form-input">
                </div>
                <div class="form-group">
                  <input type="text" [(ngModel)]="recipientPhone" placeholder="Recipient's Phone Number" class="form-input">
                </div>
                <div class="form-group">
                  <textarea [(ngModel)]="giftMessage" placeholder="Gift Greeting Message (write a warm note...)" class="form-input" rows="2"></textarea>
                </div>
              </div>

              <div class="totals-summary">
                <div class="summary-line">
                  <span>Shipping:</span>
                  <span>{{ cartSubtotal() > 1000 ? 'FREE' : '₹99' }}</span>
                </div>
                <div class="summary-line" *ngIf="isGiftOrder">
                  <span>Gift Wrapping:</span>
                  <span>₹50</span>
                </div>
                <div class="summary-line total">
                  <span>Grand Total:</span>
                  <span class="price">₹{{ grandTotal() }}</span>
                </div>
              </div>

              <div class="action-buttons">
                <button (click)="checkoutMode.set(false)" class="btn btn-secondary">Back</button>
                <button (click)="payWithRazorpay()" class="btn btn-primary" [disabled]="processingPayment()">
                  {{ processingPayment() ? 'Initializing Razorpay...' : 'Pay with Razorpay' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Detail Modal -->
      <div class="modal-overlay" *ngIf="activeProductModal()" (click)="closeProductModal()">
        <div class="product-modal card" (click)="$event.stopPropagation()">
          <button class="close-modal-btn" (click)="closeProductModal()">✕</button>
          
          <div class="grid-2 modal-grid">
            <div class="modal-image-wrapper">
              <img [src]="activeProductModal()?.imageUrl || 'assets/images/placeholder.jpg'" [alt]="activeProductModal()?.name">
            </div>
            
            <div class="modal-info">
              <span class="badge badge-green">{{ activeProductModal()?.category?.name }}</span>
              <h2>{{ activeProductModal()?.name }}</h2>
              <div class="price-row">
                <span class="price-val">₹{{ activeProductModal()?.price }}</span>
                <span *ngIf="activeProductModal()?.compareAtPrice" class="compare-price">₹{{ activeProductModal()?.compareAtPrice }}</span>
              </div>
              <p class="long-desc">{{ activeProductModal()?.detailedDescription }}</p>

              <!-- Plant Care Attributes -->
              <div class="care-attributes-grid" *ngIf="activeProductModal()?.plantDetail">
                <div class="attr-box">
                  <span class="attr-icon">☀️</span>
                  <div class="attr-content">
                    <label>Light</label>
                    <span>{{ activeProductModal()?.plantDetail?.lightRequirements }}</span>
                  </div>
                </div>
                <div class="attr-box">
                  <span class="attr-icon">💧</span>
                  <div class="attr-content">
                    <label>Water</label>
                    <span>{{ activeProductModal()?.plantDetail?.wateringFrequency }}</span>
                  </div>
                </div>
                <div class="attr-box">
                  <span class="attr-icon">🐾</span>
                  <div class="attr-content">
                    <label>Pet Safe</label>
                    <span>{{ activeProductModal()?.plantDetail?.toxicityToPets ? 'No (Toxic)' : 'Yes (Safe)' }}</span>
                  </div>
                </div>
                <div class="attr-box">
                  <span class="attr-icon">🛠️</span>
                  <div class="attr-content">
                    <label>Care Level</label>
                    <span>{{ activeProductModal()?.plantDetail?.difficultyLevel }}</span>
                  </div>
                </div>
              </div>

              <!-- Gift custom pot selection -->
              <div class="custom-pot-selection" *ngIf="activeProductModal()?.isGiftable">
                <label class="form-label">Customize Designer Pot Color</label>
                <div class="pot-colors">
                  <span *ngFor="let color of potColors" 
                        class="pot-dot" 
                        [style.background-color]="color"
                        [class.selected]="selectedPotColor() === color"
                        (click)="selectedPotColor.set(color)"
                        [title]="color">
                  </span>
                </div>
              </div>

              <div class="modal-footer">
                <button (click)="addProductFromModal()" class="btn btn-primary w-100">Add to Bag</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .shop-container {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
      padding-top: 2rem;
      padding-bottom: 5rem;
    }
    
    .sidebar {
      background-color: white;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 100px;
    }
    
    .filter-group {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1.5rem;
    }
    .filter-group:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .filter-group h3 {
      font-size: 1.05rem;
      color: var(--primary-color);
      margin-bottom: 0.75rem;
    }
    
    .checkbox-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .filter-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      cursor: pointer;
    }
    
    .switch-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .products-area {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .area-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .product-count {
      color: #64748b;
      font-size: 0.9rem;
    }
    
    .clickable-title {
      cursor: pointer;
    }
    .clickable-title:hover {
      color: var(--primary-light);
    }
    
    .no-results {
      padding: 4rem 2rem;
    }
    .no-results-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .cart-trigger {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 100;
      box-shadow: var(--shadow-xl);
      border-radius: 50px;
      padding: 1rem 1.5rem;
      font-size: 1.05rem;
    }
    
    /* Cart Side Drawer */
    .cart-drawer-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0,0,0,0.5);
      z-index: 200;
      opacity: 0;
      pointer-events: none;
      transition: var(--transition-smooth);
    }
    .cart-drawer-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .cart-drawer {
      position: absolute;
      top: 0; right: -450px; bottom: 0;
      width: 450px;
      background-color: white;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      transition: var(--transition-smooth);
    }
    .cart-drawer-overlay.open .cart-drawer {
      right: 0;
    }
    @media (max-width: 480px) {
      .cart-drawer { width: 100%; right: -100%; }
    }
    
    .drawer-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .close-drawer-btn {
      background: none; border: none; font-size: 1.5rem; cursor: pointer;
    }
    
    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
    .empty-cart-icon {
      font-size: 4rem; margin-bottom: 1rem; color: #cbd5e1;
    }
    
    .cart-item-row {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color);
      position: relative;
    }
    .cart-item-img {
      width: 70px; height: 70px; object-fit: cover; border-radius: 6px;
    }
    .cart-item-details {
      flex: 1;
    }
    .cart-item-details h4 {
      font-size: 0.95rem; margin-bottom: 0.25rem;
    }
    .custom-pot-badge {
      font-size: 0.75rem; background-color: var(--soft-green); color: var(--primary-color);
      padding: 0.1rem 0.4rem; border-radius: 4px; display: inline-block; margin-bottom: 0.25rem;
    }
    .quantity-controls {
      display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;
    }
    .qty-btn {
      width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--border-color);
      background: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .remove-item-btn {
      background: none; border: none; font-size: 1.1rem; color: #94a3b8; cursor: pointer;
      position: absolute; top: 10px; right: 0;
    }
    
    .drawer-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--border-color);
      background-color: var(--light-bg);
      box-shadow: 0 -4px 10px rgba(0,0,0,0.02);
    }
    .subtotal-row {
      display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 600; margin-bottom: 1rem;
    }
    
    .checkout-form {
      max-height: 350px;
      overflow-y: auto;
      padding: 0.5rem;
      border-top: 1px solid var(--border-color);
      margin-top: 1rem;
    }
    .checkout-form h3 {
      font-size: 1rem; margin-bottom: 0.75rem; color: var(--primary-color);
    }
    .gift-toggle {
      font-size: 0.85rem; font-weight: 500;
    }
    .totals-summary {
      background: white; border-radius: 8px; padding: 0.75rem; margin: 1rem 0; border: 1px solid var(--border-color);
    }
    .summary-line {
      display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.4rem;
    }
    .summary-line.total {
      font-size: 1rem; font-weight: 700; border-top: 1px solid var(--border-color); padding-top: 0.5rem; margin-top: 0.5rem;
    }
    .action-buttons {
      display: flex; gap: 0.5rem;
    }
    
    /* Product Modal */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0,0,0,0.5); z-index: 300;
      display: flex; align-items: center; justify-content: center; padding: 2rem;
    }
    .product-modal {
      width: 100%; max-width: 800px; background: white; padding: 2rem;
      position: relative; max-height: 90vh; overflow-y: auto;
    }
    .close-modal-btn {
      position: absolute; top: 1.5rem; right: 1.5rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; z-index: 10;
    }
    .modal-image-wrapper {
      background: var(--light-bg); border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .modal-image-wrapper img {
      max-width: 100%; max-height: 400px; object-fit: contain;
    }
    .price-row {
      margin: 0.5rem 0 1rem 0;
    }
    .price-val {
      font-size: 1.8rem; font-weight: 700; color: var(--primary-color);
    }
    .compare-price {
      font-size: 1.2rem; text-decoration: line-through; color: #94a3b8; margin-left: 0.75rem;
    }
    .long-desc {
      font-size: 0.95rem; color: #475569; margin-bottom: 1.5rem;
    }
    .care-attributes-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;
    }
    .attr-box {
      display: flex; align-items: center; gap: 0.75rem; background: var(--light-bg); padding: 0.75rem; border-radius: 8px;
    }
    .attr-icon { font-size: 1.5rem; }
    .attr-content label { display: block; font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
    .attr-content span { font-size: 0.85rem; font-weight: 600; color: var(--primary-color); }
    
    .custom-pot-selection {
      margin-bottom: 1.5rem;
    }
    .pot-colors {
      display: flex; gap: 0.75rem; margin-top: 0.5rem;
    }
    .pot-dot {
      width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: var(--transition-smooth);
    }
    .pot-dot.selected {
      border-color: var(--primary-color); transform: scale(1.15); box-shadow: var(--shadow-sm);
    }
    
    @media (max-width: 768px) {
      .shop-container { grid-template-columns: 1fr; }
      .sidebar { position: static; height: auto; }
      .modal-grid { grid-template-columns: 1fr; }
    }
    .w-100 { width: 100%; }
  `]
})
export class ShopComponent implements OnInit {
  // Filters
  public searchQuery = '';
  public selectedLight = '';
  public selectedDifficulty = '';
  public petFriendlyOnly = false;
  public selectedCategoryId = signal<number | null>(null);

  public categories = signal<Category[]>([]);
  public products = signal<Product[]>([]);
  
  // Cart & checkout UI state
  public cartOpen = signal(false);
  public checkoutMode = signal(false);
  
  // Checkout Form Models
  public shippingName = '';
  public shippingEmail = 'guest@greenspace.com';
  public shippingAddress = '';
  public shippingCity = '';
  public shippingPostalCode = '';
  
  public isGiftOrder = false;
  public recipientName = '';
  public recipientPhone = '';
  public giftMessage = '';

  public processingPayment = signal(false);

  // Modal Detail state
  public activeProductModal = signal<Product | null>(null);
  public selectedPotColor = signal<string>('#ffffff');
  public potColors = ['#ffffff', '#e5e7eb', '#fbcfe8', '#fed7aa', '#fde047'];

  // Global State bindings
  public cart: any;
  public cartCount: any;
  public cartSubtotal: any;
  public grandTotal: any;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) {
    this.cart = this.dataService.cart;
    this.cartCount = this.dataService.cartCount;
    this.cartSubtotal = this.dataService.cartSubtotal;
    
    this.grandTotal = computed(() => {
      let base = this.cartSubtotal();
      let shipping = base > 1000 ? 0 : 99;
      let wrap = this.isGiftOrder ? 50 : 0;
      return base + shipping + wrap;
    });
  }

  ngOnInit() {
    this.dataService.getCategories().subscribe(cats => this.categories.set(cats));
    this.applyFilters();
  }

  selectCategory(id: number | null) {
    this.selectedCategoryId.set(id);
    this.applyFilters();
  }

  applyFilters() {
    this.dataService.getProducts({
      categoryId: this.selectedCategoryId() ?? undefined,
      difficulty: this.selectedDifficulty || undefined,
      light: this.selectedLight || undefined,
      petFriendly: this.petFriendlyOnly ? true : undefined,
      search: this.searchQuery || undefined
    }).subscribe(prods => this.products.set(prods));
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedLight = '';
    this.selectedDifficulty = '';
    this.petFriendlyOnly = false;
    this.selectedCategoryId.set(null);
    this.applyFilters();
  }

  addToCart(product: Product) {
    this.dataService.addToCart(product, 1);
    this.toggleCartDrawer(true);
  }

  toggleCartDrawer(open: boolean) {
    this.cartOpen.set(open);
    if (!open) {
      this.checkoutMode.set(false);
    }
  }

  decreaseQty(item: CartItem) {
    this.dataService.updateCartQuantity(item.productId, item.quantity - 1, item.customPotColor);
  }

  increaseQty(item: CartItem) {
    this.dataService.updateCartQuantity(item.productId, item.quantity + 1, item.customPotColor);
  }

  removeFromCart(item: CartItem) {
    this.dataService.removeFromCart(item.productId, item.customPotColor);
  }

  enterCheckout() {
    if (!this.authService.isLoggedIn()) {
      alert('Please log in or sign up to complete your purchase.');
      this.toggleCartDrawer(false);
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/shop' } });
      return;
    }
    
    const user = this.authService.currentUser();
    if (user) {
      this.shippingEmail = user.email;
      this.shippingName = user.fullName;
    }

    this.checkoutMode.set(true);
  }

  // Razorpay Checkout integration
  payWithRazorpay() {
    if (!this.shippingName || !this.shippingAddress || !this.shippingCity || !this.shippingPostalCode) {
      alert('Please fill all shipping fields.');
      return;
    }

    this.processingPayment.set(true);

    const orderPayload = {
      customerName: this.shippingName,
      customerEmail: this.shippingEmail,
      shippingAddress: this.shippingAddress,
      shippingCity: this.shippingCity,
      shippingPostalCode: this.shippingPostalCode,
      isGift: this.isGiftOrder,
      recipientName: this.isGiftOrder ? this.recipientName : undefined,
      recipientPhone: this.isGiftOrder ? this.recipientPhone : undefined,
      giftMessage: this.isGiftOrder ? this.giftMessage : undefined,
      giftWrapOption: this.isGiftOrder,
      orderItems: this.cart().map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        customPotColor: item.customPotColor
      }))
    };

    // 1. Create Checkout Session
    this.dataService.checkout(orderPayload).subscribe({
      next: (res) => {
        // 2. Open Razorpay options
        const options = {
          key: res.razorpayKey,
          amount: Math.round(res.amount * 100), // paise
          currency: res.currency,
          name: 'GreenSpace Ltd',
          description: 'Botanical Plant Order',
          order_id: res.razorpayOrderId,
          handler: (paymentRes: any) => {
            // Success handler -> verify signature
            this.verifyPaymentSignature(
              res.razorpayOrderId,
              paymentRes.razorpay_payment_id,
              paymentRes.razorpay_signature
            );
          },
          prefill: {
            name: this.shippingName,
            email: this.shippingEmail
          },
          theme: {
            color: '#1b4332'
          },
          modal: {
            ondismiss: () => {
              this.processingPayment.set(false);
            }
          }
        };

        // If in mock sandbox mode, simulate payment gateway callback
        if (res.razorpayOrderId.startsWith('order_mock_')) {
          setTimeout(() => {
            const mockConfirm = confirm('Simulate payment gateway success? (Click Cancel to fail)');
            if (mockConfirm) {
              this.verifyPaymentSignature(res.razorpayOrderId, 'pay_mock_' + Guid(), 'mock_success_signature');
            } else {
              this.processingPayment.set(false);
              alert('Payment failed/cancelled.');
            }
          }, 1000);
        } else {
          // Trigger actual Razorpay popup (if Razorpay script is loaded globally)
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      },
      error: (err) => {
        this.processingPayment.set(false);
        alert(err.error || 'Failed to place order.');
      }
    });
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
    this.dataService.verifyPayment(
      { razorpayOrderId: orderId, razorpayPaymentId: paymentId, razorpaySignature: signature }
    ).subscribe({
      next: (verificationResult) => {
        this.processingPayment.set(false);
        this.dataService.clearCart();
        this.toggleCartDrawer(false);
        alert(`Order placed successfully!\nYour Third-Party Tracking ID: ${verificationResult.trackingId}`);
      },
      error: (err) => {
        this.processingPayment.set(false);
        alert('Payment verification failed.');
      }
    });
  }

  // Modal triggers
  openProductModal(prod: Product) {
    this.activeProductModal.set(prod);
    this.selectedPotColor.set('#ffffff');
  }

  closeProductModal() {
    this.activeProductModal.set(null);
  }

  addProductFromModal() {
    const prod = this.activeProductModal();
    if (prod) {
      this.dataService.addToCart(prod, 1, prod.isGiftable ? this.selectedPotColor() : undefined);
      this.closeProductModal();
      this.toggleCartDrawer(true);
    }
  }
}

// Simple GUID generator for mock IDs
function Guid() {
  return 'xxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
