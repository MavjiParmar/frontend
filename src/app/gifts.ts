import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Product } from './data.service';

@Component({
  selector: 'app-gifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gifts-container container animate-fade-in">
      <header class="gifts-header text-center">
        <span class="badge badge-green">GreenSpace Gifting Boutique</span>
        <h1>Gift a Plant, Share a Life</h1>
        <p>Choose from our handpicked easy-care plants, pair them with premium colorful pots, and add a personalized card.</p>
      </header>

      <div class="gifts-layout">
        <!-- Interactive Gift Combo Builder -->
        <section class="builder-section card glass-card">
          <h2>🎁 Design Your Gift Box</h2>
          <p class="section-desc">Create a custom botanical gift package in three simple steps.</p>

          <div class="builder-steps">
            <!-- Step 1: Select Gift Plant -->
            <div class="builder-step">
              <label class="form-label">Step 1: Choose a plant</label>
              <div class="plant-gift-selector">
                <div *ngFor="let p of giftableProducts()" 
                     class="gift-plant-card"
                     [class.selected]="selectedPlant()?.id === p.id"
                     (click)="selectedPlant.set(p)">
                  <img [src]="p.imageUrl || 'assets/images/placeholder.jpg'" [alt]="p.name" class="p-img">
                  <div class="p-name">{{ p.name }}</div>
                  <div class="p-price">₹{{ p.price }}</div>
                </div>
              </div>
            </div>

            <!-- Step 2: Custom Pot Color -->
            <div class="builder-step" *ngIf="selectedPlant()">
              <label class="form-label">Step 2: Select designer pot color</label>
              <div class="pot-colors-grid">
                <button *ngFor="let pColor of potColors" 
                        class="pot-option"
                        [class.selected]="selectedColor() === pColor.name"
                        (click)="selectedColor.set(pColor.name)"
                        [style.background-color]="pColor.hex"
                        [title]="pColor.name">
                </button>
              </div>
              <div class="selected-color-label">Chosen Pot: <strong>{{ selectedColor() }}</strong></div>
            </div>

            <!-- Step 3: Select Message Card -->
            <div class="builder-step" *ngIf="selectedPlant()">
              <label class="form-label">Step 3: Pick a greeting card theme & write message</label>
              <div class="card-themes-grid">
                <button *ngFor="let theme of cardThemes" 
                        class="theme-btn"
                        [class.selected]="selectedTheme() === theme"
                        (click)="selectedTheme.set(theme)">
                  {{ theme }}
                </button>
              </div>

              <div class="message-input-area form-group">
                <textarea [(ngModel)]="customMessage" 
                          placeholder="Type your greeting message here... (e.g., 'Dear Mom, wishing you a green and peaceful year ahead!')" 
                          class="form-input" 
                          rows="3">
                </textarea>
              </div>
            </div>
          </div>

          <!-- Builder Summary & Add to Cart -->
          <div class="builder-footer" *ngIf="selectedPlant()">
            <div class="summary-details">
              <h3>Gift Combo Summary:</h3>
              <p>🌱 Plant: <strong>{{ selectedPlant()?.name }}</strong></p>
              <p>🏺 Planter: <strong>{{ selectedColor() }} Ceramic Pot</strong></p>
              <p>💌 Greeting: <strong>{{ selectedTheme() }} Card</strong></p>
            </div>
            
            <div class="price-action-row">
              <div class="total-gift-price">
                <span class="label">Combo Price:</span>
                <span class="price">₹{{ comboPrice() }}</span>
                <span class="extra-notice">(Includes wrap & card)</span>
              </div>
              <button (click)="addGiftComboToCart()" class="btn btn-primary">
                Add Gift Combo to Cart
              </button>
            </div>
          </div>
        </section>

        <!-- Sidebar showcase of popular pre-packaged combos -->
        <aside class="popular-gifts-aside">
          <h2>Ready Combos</h2>
          <div class="combos-list">
            <div class="combo-card card" *ngFor="let combo of prepackagedCombos">
              <div class="combo-title">✨ {{ combo.name }}</div>
              <p class="combo-desc">{{ combo.desc }}</p>
              <div class="combo-footer">
                <span class="price">₹{{ combo.price }}</span>
                <button (click)="buyPrepackagedCombo(combo)" class="btn btn-secondary btn-sm">Add Combo</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .gifts-header {
      margin-bottom: 3rem;
      margin-top: 2rem;
    }
    .gifts-header h1 {
      font-size: 2.5rem;
      color: var(--primary-color);
      margin-top: 0.5rem;
    }
    
    .gifts-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 2rem;
      padding-bottom: 5rem;
    }
    
    .builder-section {
      padding: 2.5rem;
      background: white;
    }
    .builder-section h2 {
      color: var(--primary-color);
      font-size: 1.6rem;
    }
    .section-desc {
      color: #64748b;
      margin-bottom: 2rem;
    }
    
    .builder-steps {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }
    .builder-step {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 2rem;
    }
    .builder-step:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    .plant-gift-selector {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
      margin-top: 0.75rem;
    }
    .gift-plant-card {
      border: 1.5px solid var(--border-color);
      border-radius: 8px;
      padding: 0.75rem;
      text-align: center;
      cursor: pointer;
      transition: var(--transition-smooth);
      background: var(--light-bg);
    }
    .gift-plant-card:hover {
      border-color: var(--accent-color);
    }
    .gift-plant-card.selected {
      border-color: var(--primary-color);
      background-color: var(--soft-green);
    }
    .gift-plant-card .p-img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }
    .gift-plant-card .p-name {
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gift-plant-card .p-price {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary-color);
    }
    
    .pot-colors-grid {
      display: flex;
      gap: 1rem;
      margin-top: 0.75rem;
    }
    .pot-option {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      transition: var(--transition-smooth);
    }
    .pot-option.selected {
      border-color: var(--primary-color);
      transform: scale(1.15);
    }
    .selected-color-label {
      font-size: 0.85rem;
      margin-top: 0.5rem;
      color: #64748b;
    }
    
    .card-themes-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin: 0.75rem 0 1rem 0;
    }
    .theme-btn {
      padding: 0.5rem 1rem;
      background: white;
      border: 1.5px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .theme-btn.selected {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
    .message-input-area {
      margin-top: 1rem;
    }
    
    .builder-footer {
      background-color: var(--light-bg);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-top: 2.5rem;
      border: 1px solid var(--border-color);
    }
    .summary-details h3 {
      font-size: 1.05rem;
      margin-bottom: 0.5rem;
      color: var(--primary-color);
    }
    .summary-details p {
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }
    .price-action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
    }
    .total-gift-price {
      display: flex;
      flex-direction: column;
    }
    .total-gift-price .label {
      font-size: 0.8rem;
      color: #64748b;
    }
    .total-gift-price .price {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--primary-color);
      line-height: 1;
    }
    .total-gift-price .extra-notice {
      font-size: 0.7rem;
      color: #94a3b8;
    }
    
    .popular-gifts-aside h2 {
      font-size: 1.3rem;
      color: var(--primary-color);
      margin-bottom: 1.5rem;
    }
    .combos-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .combo-card {
      background: white;
      padding: 1.25rem;
    }
    .combo-title {
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
      color: var(--primary-color);
    }
    .combo-desc {
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 1rem;
    }
    .combo-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    @media (max-width: 991px) {
      .gifts-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class GiftsComponent implements OnInit {
  public giftableProducts = signal<Product[]>([]);

  // Selection configurations
  public selectedPlant = signal<Product | null>(null);
  public selectedColor = signal<string>('Ivory White');
  public selectedTheme = signal<string>('Congratulations');
  public customMessage = '';

  public potColors = [
    { name: 'Ivory White', hex: '#ffffff' },
    { name: 'Slate Gray', hex: '#94a3b8' },
    { name: 'Rose Quartz', hex: '#fbcfe8' },
    { name: 'Peach Blush', hex: '#fed7aa' },
    { name: 'Lemon Grass', hex: '#fef08a' }
  ];

  public cardThemes = ['Birthday Special', 'Anniversary', 'Thank You', 'Congratulations', 'Get Well Soon', 'Welcome Home'];

  public prepackagedCombos = [
    { name: 'Double Prosperity Pack', desc: 'Mini Jade succulent paired with a dwarf Sansevieria snake plant. Housed in premium ceramic matching pots.', price: 699, plantIds: [1, 3] },
    { name: 'Bedroom Air Purifier Kit', desc: 'Peace Lily and ZZ Plant combo. Guaranteed clean air, slow-release watering system.', price: 849, plantIds: [2, 6] },
    { name: 'Beginner Greenery Hamper', desc: 'Resilient Snake Plant and Aloe Vera. Includes custom brass watering bottle.', price: 1799, plantIds: [1, 7, 10] }
  ];

  public comboPrice = computed(() => {
    const plantPrice = this.selectedPlant()?.price || 0;
    // Rs 50 for wrapping + Rs 30 for greeting card/pot personalization
    return plantPrice + 80;
  });

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getProducts().subscribe(prods => {
      this.giftableProducts.set(prods.filter(p => p.isGiftable));
    });
  }

  addGiftComboToCart() {
    const plant = this.selectedPlant();
    if (plant) {
      // Add custom wrapper and greeting options locally.
      // We pass the customized pot selection inside the cartItem parameters.
      this.dataService.addToCart(plant, 1, this.selectedColor());
      
      // Inject gift messages globally or trigger checkout view.
      alert(`Custom Gift Combo added to Cart!\nWe've set the pot color to "${this.selectedColor()}" and queued your greeting note.`);
      
      // Reset builder
      this.selectedPlant.set(null);
      this.customMessage = '';
    }
  }

  buyPrepackagedCombo(combo: any) {
    this.dataService.getProducts().subscribe(prods => {
      const items = prods.filter(p => combo.plantIds.includes(p.id));
      if (items.length > 0) {
        items.forEach(p => this.dataService.addToCart(p, 1));
        alert(`Added "${combo.name}" combo items to your shopping bag.`);
      } else {
        // Fallback mock bundle item
        const mockBundle = {
          id: 8880 + combo.price,
          name: combo.name,
          sku: 'BD-GIFT-COMBO',
          shortDescription: combo.desc,
          detailedDescription: combo.desc,
          price: combo.price,
          categoryId: 4,
          isGiftable: true,
          weight: 2.5
        };
        this.dataService.addToCart(mockBundle, 1);
        alert(`Added "${combo.name}" combo bundle to bag.`);
      }
    });
  }
}
