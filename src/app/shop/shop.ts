import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Product, Category, CartItem } from '../data.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.html',
  styleUrl: './shop.css'
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
