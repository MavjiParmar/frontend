import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, DecorPackage, ConsultationBooking } from './data.service';

@Component({
  selector: 'app-decor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="decor-container container animate-fade-in">
      
      <header class="decor-header text-center">
        <span class="badge badge-green">Greenspace Landscaping & Styling</span>
        <h1>Custom Space Plantation Planner</h1>
        <p>Design your dream room, office, balcony, or garden with proper plant species selected by experts.</p>
      </header>

      <!-- Multi-Step Questionnaire Wizard -->
      <section class="wizard-section card glass-card">
        <!-- Wizard Navigation Steps -->
        <div class="wizard-steps">
          <div class="step-num" [class.active]="step() === 1">1. Select Space</div>
          <div class="step-num" [class.active]="step() === 2">2. Conditions</div>
          <div class="step-num" [class.active]="step() === 3">3. Review Packages</div>
        </div>

        <!-- Step 1: Space Choice -->
        <div *ngIf="step() === 1" class="step-pane animate-fade-in">
          <h2>Which space are we greening?</h2>
          <p class="pane-subtitle">Choose the target zone to personalize layout suggestions.</p>
          
          <div class="space-selector-grid">
            <div class="space-box" [class.selected]="selectedSpaceType() === 'Office'" (click)="selectedSpaceType.set('Office')">
              <span class="space-icon">🏢</span>
              <h3>Office</h3>
              <p>Low-maintenance air filters for office productivity.</p>
            </div>
            <div class="space-box" [class.selected]="selectedSpaceType() === 'Room'" (click)="selectedSpaceType.set('Room')">
              <span class="space-icon">🛏️</span>
              <h3>Room</h3>
              <p>Oxygen boosters for bedrooms and living rooms.</p>
            </div>
            <div class="space-box" [class.selected]="selectedSpaceType() === 'Balcony'" (click)="selectedSpaceType.set('Balcony')">
              <span class="space-icon">🪴</span>
              <h3>Balcony</h3>
              <p>Vertical planters, climbers and railing greens.</p>
            </div>
            <div class="space-box" [class.selected]="selectedSpaceType() === 'Garden'" (click)="selectedSpaceType.set('Garden')">
              <span class="space-icon">🌳</span>
              <h3>Garden</h3>
              <p>Flowering shrubs, landscaping audits, and soil care.</p>
            </div>
          </div>

          <div class="wizard-actions">
            <button class="btn btn-primary" (click)="goToStep(2)" [disabled]="!selectedSpaceType()">Continue</button>
          </div>
        </div>

        <!-- Step 2: Condition Questionnaire -->
        <div *ngIf="step() === 2" class="step-pane animate-fade-in">
          <h2>Tell us about the environment</h2>
          <p class="pane-subtitle">We select plants that will survive your specific conditions.</p>

          <div class="form-container">
            <div class="form-group">
              <label class="form-label">Approximate Area Dimensions (e.g. 5x10 ft)</label>
              <input type="text" [(ngModel)]="dimensions" placeholder="e.g. 10x12 feet" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Natural Light Availability</label>
              <select [(ngModel)]="lightLevel" class="form-input">
                <option value="Low">Low Light (artificial light or deep shade)</option>
                <option value="Medium">Medium Bright (indirect light, shaded windows)</option>
                <option value="Bright Indirect">Bright Indirect (near sunny windows, no direct rays)</option>
                <option value="Direct Sun">Direct Sun (open balconies, gardens)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Do you have pets at home?</label>
              <div class="radio-group">
                <label>
                  <input type="radio" name="pets" [value]="true" [(ngModel)]="hasPets">
                  Yes, show pet-safe plants
                </label>
                <label>
                  <input type="radio" name="pets" [value]="false" [(ngModel)]="hasPets">
                  No, show any plants
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Budget Range</label>
              <select [(ngModel)]="budget" class="form-input">
                <option value="Economy">Economy (Under ₹2,000)</option>
                <option value="Standard">Standard (₹2,000 - ₹5,000)</option>
                <option value="Premium">Premium (Above ₹5,000)</option>
              </select>
            </div>
          </div>

          <div class="wizard-actions">
            <button class="btn btn-secondary" (click)="goToStep(1)">Back</button>
            <button class="btn btn-primary" (click)="loadMatchingPackages()">Get Recommendations</button>
          </div>
        </div>

        <!-- Step 3: Recommendation Results -->
        <div *ngIf="step() === 3" class="step-pane animate-fade-in">
          <h2>Your Custom Recommendations</h2>
          <p class="pane-subtitle">Here are the packages designed specifically for a {{ selectedSpaceType() }} under {{ lightLevel }} light.</p>

          <div class="packages-grid" *ngIf="matchingPackages().length > 0; else noPackages">
            <div *ngFor="let pack of matchingPackages()" class="package-item card">
              <img [src]="pack.imageUrl || 'assets/images/placeholder.jpg'" [alt]="pack.packageName" class="package-img">
              <div class="package-details">
                <span class="badge badge-green">{{ pack.spaceType }} Package</span>
                <h3>{{ pack.packageName }}</h3>
                <p class="dimensions-tag">📏 Best for: {{ pack.targetDimensions }}</p>
                <p>{{ pack.description }}</p>
                
                <div class="package-footer">
                  <span class="price">₹{{ pack.basePrice }}</span>
                  <div class="action-buttons">
                    <button (click)="buyPackage(pack)" class="btn btn-primary btn-sm">Buy Package</button>
                    <button (click)="openBookingModal()" class="btn btn-secondary btn-sm">Book Consultation</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noPackages>
            <div class="no-packages card text-center">
              <h3>We want to design this custom for you!</h3>
              <p>We don't have a standard pre-curated pack matching your exact light and size combo. Book a personalized landscaping consultation and our horticulturist will call you.</p>
              <button (click)="openBookingModal()" class="btn btn-primary">Book Consultation Audit</button>
            </div>
          </ng-template>

          <div class="wizard-actions">
            <button class="btn btn-secondary" (click)="goToStep(2)">Back</button>
          </div>
        </div>
      </section>

      <!-- Consultation Booking Modal -->
      <div class="modal-overlay" *ngIf="showBookingForm()" (click)="closeBookingModal()">
        <div class="booking-modal card" (click)="$event.stopPropagation()">
          <button class="close-modal-btn" (click)="closeBookingModal()">✕</button>
          
          <h2>Book Landscaping Audit</h2>
          <p>Provide contact details and our certified garden designer will arrange a site audit (virtual or offline).</p>
          
          <form (submit)="submitBooking()" class="booking-form">
            <div class="form-group">
              <label class="form-label">Your Name</label>
              <input type="text" [(ngModel)]="bookingName" name="name" required class="form-input">
            </div>
            
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" [(ngModel)]="bookingEmail" name="email" required class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" [(ngModel)]="bookingPhone" name="phone" required class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Preferred Audit Date</label>
              <input type="date" [(ngModel)]="bookingDate" name="date" required class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Custom Requirements / Notes</label>
              <textarea [(ngModel)]="bookingNotes" name="notes" placeholder="Tell us if you want vertical garden walls, specific color themes, or timing preferences..." class="form-input" rows="3"></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeBookingModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="bookingInProgress()">
                {{ bookingInProgress() ? 'Registering Booking...' : 'Request Consultation' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .decor-header {
      margin-bottom: 3rem;
      margin-top: 2rem;
    }
    .decor-header h1 {
      font-size: 2.5rem;
      color: var(--primary-color);
      margin-top: 0.5rem;
    }
    
    .wizard-section {
      max-width: 800px;
      margin: 0 auto 5rem auto;
      padding: 3rem 2rem;
    }
    
    .wizard-steps {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3rem;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 1rem;
    }
    .step-num {
      font-weight: 600;
      color: #94a3b8;
      position: relative;
    }
    .step-num.active {
      color: var(--primary-color);
    }
    .step-num.active::after {
      content: '';
      position: absolute;
      bottom: -18px; left: 0; right: 0;
      height: 4px;
      background-color: var(--primary-color);
      border-radius: 2px;
    }
    
    .step-pane h2 {
      font-size: 1.6rem;
      margin-bottom: 0.5rem;
      color: var(--primary-color);
    }
    .pane-subtitle {
      color: #64748b;
      margin-bottom: 2rem;
    }
    
    .space-selector-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .space-box {
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 2rem 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: var(--transition-smooth);
      background: white;
    }
    .space-box:hover {
      border-color: var(--accent-color);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .space-box.selected {
      border-color: var(--primary-color);
      background-color: var(--soft-green);
    }
    .space-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }
    
    .form-container {
      max-width: 500px;
      margin-bottom: 2rem;
    }
    .radio-group {
      display: flex;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }
    .radio-group label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.9rem;
      cursor: pointer;
    }
    
    .packages-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .package-item {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 1.5rem;
      padding: 1.5rem;
      background: white;
    }
    .package-img {
      width: 100%;
      height: 100%;
      max-height: 200px;
      object-fit: cover;
      border-radius: 8px;
    }
    .dimensions-tag {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0.25rem 0 0.75rem 0;
      font-weight: 500;
    }
    .package-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
    }
    
    .wizard-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
    }
    
    .no-packages {
      padding: 3rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    /* Modal Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0,0,0,0.5); z-index: 300;
      display: flex; align-items: center; justify-content: center; padding: 2rem;
    }
    .booking-modal {
      width: 100%; max-width: 550px; background: white; padding: 2.5rem;
      position: relative; max-height: 90vh; overflow-y: auto;
    }
    .close-modal-btn {
      position: absolute; top: 1.5rem; right: 1.5rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;
    }
    .booking-form {
      margin-top: 1.5rem;
    }
    .modal-actions {
      display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;
    }
    
    @media (max-width: 768px) {
      .space-selector-grid { grid-template-columns: 1fr; }
      .package-item { grid-template-columns: 1fr; }
    }
  `]
})
export class DecorComponent implements OnInit {
  public step = signal<number>(1);
  public selectedSpaceType = signal<string>('');
  
  // Environment model
  public dimensions = '';
  public lightLevel = 'Medium Bright';
  public hasPets = false;
  public budget = 'Standard';

  public matchingPackages = signal<DecorPackage[]>([]);

  // Modal Consultation Form
  public showBookingForm = signal(false);
  public bookingName = '';
  public bookingEmail = '';
  public bookingPhone = '';
  public bookingDate = '';
  public bookingNotes = '';
  public bookingInProgress = signal(false);

  constructor(private dataService: DataService) {}

  ngOnInit() {}

  goToStep(num: number) {
    this.step.set(num);
  }

  loadMatchingPackages() {
    this.dataService.getDecorPackages(this.selectedSpaceType()).subscribe({
      next: (packs) => {
        this.matchingPackages.set(packs);
        this.goToStep(3);
      },
      error: (err) => console.error('Failed to query design packages', err)
    });
  }

  buyPackage(pack: DecorPackage) {
    // Add custom package mock implementation
    alert(`Added "${pack.packageName}" layout bundle containing standard plants to your active basket.\nRedirecting to checkout...`);
    
    // Seed items to cart
    let productIds: number[] = JSON.parse(pack.includedProductIdsJson);
    
    // Fetch products and add
    this.dataService.getProducts().subscribe(prods => {
      let filtered = prods.filter(p => productIds.includes(p.id));
      if (filtered.length > 0) {
        filtered.forEach(p => this.dataService.addToCart(p, 1));
      } else {
        // Mock a generic product representation representing the bundle
        const mockBundleProd = {
          id: 9990 + pack.id,
          name: `${pack.packageName} (Layout Bundle)`,
          sku: `BD-DECOR-${pack.id}`,
          shortDescription: pack.description,
          detailedDescription: pack.description,
          price: pack.basePrice,
          categoryId: 4,
          isGiftable: false,
          weight: 5.0
        };
        this.dataService.addToCart(mockBundleProd, 1);
      }
    });
  }

  openBookingModal() {
    this.showBookingForm.set(true);
    this.bookingNotes = `Space: ${this.selectedSpaceType()}\nDimensions: ${this.dimensions}\nLight: ${this.lightLevel}\nPets: ${this.hasPets ? 'Yes' : 'No'}\nBudget: ${this.budget}`;
  }

  closeBookingModal() {
    this.showBookingForm.set(false);
  }

  submitBooking() {
    if (!this.bookingName || !this.bookingEmail || !this.bookingPhone || !this.bookingDate) {
      alert('Please fill out all booking fields.');
      return;
    }

    this.bookingInProgress.set(true);

    const bookingPayload: ConsultationBooking = {
      customerId: 1, // mock customer ID
      customerName: this.bookingName,
      customerEmail: this.bookingEmail,
      customerPhone: this.bookingPhone,
      preferredDate: this.bookingDate,
      spaceType: this.selectedSpaceType(),
      dimensions: this.dimensions,
      customRequirements: this.bookingNotes
    };

    this.dataService.bookConsultation(bookingPayload).subscribe({
      next: () => {
        this.bookingInProgress.set(false);
        this.closeBookingModal();
        alert('Thank you! Your garden audit has been scheduled. An advisor will contact you shortly.');
      },
      error: (err) => {
        this.bookingInProgress.set(false);
        alert('Failed to register booking.');
      }
    });
  }
}
