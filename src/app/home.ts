import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService, Product, Category } from './data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page animate-fade-in">
      <!-- Hero Banner -->
      <header class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-content container">
          <span class="badge badge-green">Welcome to GreenSpace</span>
          <h1>Bring Nature Indoors</h1>
          <p>Explore our premium range of live house plants, organic seeds, and designer planters. Elevate your living rooms, offices, balconies, and gardens with curated greenery.</p>
          <div class="hero-buttons">
            <a routerLink="/shop" class="btn btn-primary">Shop Live Plants</a>
            <a routerLink="/decor-planner" class="btn btn-secondary">Plan Space Decor</a>
          </div>
        </div>
      </header>

      <!-- Seeding Banner (Temporary for development) -->
      <section class="seed-banner container" *ngIf="products().length === 0">
        <div class="card glass-card seed-card">
          <h3>Catalog is Empty</h3>
          <p>Get started by seeding our botanical database with a curated selection of indoor/outdoor plants, seeds, and designer pots.</p>
          <button (click)="seedCatalog()" class="btn btn-accent" [disabled]="seeding()">
            {{ seeding() ? 'Seeding Catalog...' : 'Seed Initial Catalog' }}
          </button>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-section container">
        <div class="section-header">
          <h2>Shop by Category</h2>
          <p>Find the perfect green addition for your home or workspace.</p>
        </div>
        <div class="grid-4">
          <div *ngFor="let cat of categories()" class="category-card card" [style.background-image]="'url(' + cat.imageUrl + ')'" routerLink="/shop" [queryParams]="{ categoryId: cat.id }">
            <div class="cat-overlay"></div>
            <div class="cat-info">
              <h3>{{ cat.name }}</h3>
              <p>{{ cat.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Custom Services / Features Section -->
      <section class="services-section">
        <div class="container">
          <div class="section-header text-center">
            <h2>Specialized Plantation Services</h2>
            <p>We do more than sell plants. We help you style your spaces and share gifts of life.</p>
          </div>
          <div class="grid-3">
            <div class="service-card card text-center">
              <div class="service-icon">🏢</div>
              <h3>Office & Room Decoration</h3>
              <p>Optimize productivity and air quality. Select custom layouts matching your lighting conditions, dimensions, and maintenance budget.</p>
              <a routerLink="/decor-planner" class="btn btn-secondary btn-sm">Explore Planner</a>
            </div>

            <div class="service-card card text-center">
              <div class="service-icon">🪴</div>
              <h3>Balcony & Garden Design</h3>
              <p>Transform standard outdoor corners or railings into beautiful vertical green escapes with our flowering and hardy plant packages.</p>
              <a routerLink="/decor-planner" class="btn btn-secondary btn-sm">Plan Landscaping</a>
            </div>

            <div class="service-card card text-center">
              <div class="service-icon">🎁</div>
              <h3>Premium Plant Gifting</h3>
              <p>Send a message of health. Custom wrap options, hand-selected matching pots, greeting cards, and scheduled calendar delivery.</p>
              <a routerLink="/gifts" class="btn btn-secondary btn-sm">Gift a Plant</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="featured-section container" *ngIf="products().length > 0">
        <div class="section-header flex-header">
          <div>
            <h2>Best Sellers</h2>
            <p>Our top-rated air purifiers and easy-care foliage.</p>
          </div>
          <a routerLink="/shop" class="view-all">View All →</a>
        </div>
        <div class="grid-4">
          <div *ngFor="let prod of featuredProducts()" class="product-item card">
            <div class="product-img-wrapper">
              <img [src]="prod.imageUrl || 'assets/images/placeholder.jpg'" [alt]="prod.name" class="product-img">
              <span *ngIf="prod.compareAtPrice" class="sale-badge badge badge-red">Sale</span>
            </div>
            <div class="product-info">
              <span class="badge badge-green">{{ prod.category?.name || 'Plant' }}</span>
              <h3>{{ prod.name }}</h3>
              <div class="product-care-badges" *ngIf="prod.plantDetail">
                <span class="care-badge" title="Light Requirements">☀️ {{ prod.plantDetail.lightRequirements }}</span>
                <span class="care-badge" title="Maintenance Difficulty">🛠️ {{ prod.plantDetail.difficultyLevel }}</span>
              </div>
              <p class="product-desc">{{ prod.shortDescription }}</p>
              <div class="product-footer">
                <div class="price-container">
                  <span class="price">₹{{ prod.price }}</span>
                  <span *ngIf="prod.compareAtPrice" class="old-price">₹{{ prod.compareAtPrice }}</span>
                </div>
                <button (click)="addToCart(prod)" class="btn btn-primary btn-icon">
                  🛒 Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero-section {
      position: relative;
      background: linear-gradient(135deg, #1b4332 0%, #081c15 100%);
      color: white;
      padding: 8rem 0;
      overflow: hidden;
      margin-bottom: 3rem;
      border-bottom-left-radius: 40px;
      border-bottom-right-radius: 40px;
    }
    .hero-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(circle at 80% 20%, rgba(82, 183, 136, 0.15) 0%, transparent 50%);
    }
    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 700px;
    }
    .hero-content h1 {
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin: 1rem 0;
    }
    .hero-content p {
      font-size: 1.15rem;
      margin-bottom: 2rem;
      color: #d8f3dc;
    }
    .hero-buttons {
      display: flex;
      gap: 1rem;
    }
    
    .seed-banner {
      margin-bottom: 3rem;
    }
    .seed-card {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      border-left: 5px solid var(--accent-color);
      gap: 1rem;
    }
    
    .section-header {
      margin-bottom: 2rem;
    }
    .section-header h2 {
      font-size: 2rem;
      color: var(--primary-color);
    }
    .flex-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .view-all {
      font-weight: 600;
      color: var(--primary-color);
      padding-bottom: 5px;
    }
    
    .category-card {
      position: relative;
      height: 250px;
      background-size: cover;
      background-position: center;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }
    .cat-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to top, rgba(8, 28, 21, 0.8) 0%, rgba(8, 28, 21, 0.1) 100%);
      transition: var(--transition-smooth);
    }
    .category-card:hover .cat-overlay {
      background: linear-gradient(to top, rgba(8, 28, 21, 0.9) 0%, rgba(8, 28, 21, 0.2) 100%);
    }
    .cat-info {
      position: relative;
      z-index: 1;
      color: white;
    }
    .cat-info h3 {
      font-size: 1.3rem;
      margin-bottom: 0.25rem;
    }
    .cat-info p {
      font-size: 0.85rem;
      color: #cbd5e1;
    }
    
    .services-section {
      background-color: var(--soft-green);
      padding: 4rem 0;
      margin: 4rem 0;
    }
    .text-center {
      text-align: center;
    }
    .service-card {
      background: white;
      padding: 2.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .service-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
    
    .product-img-wrapper {
      position: relative;
      height: 220px;
      overflow: hidden;
      border-radius: 8px;
      margin-bottom: 1rem;
      background-color: var(--light-bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .product-img {
      max-height: 100%;
      object-fit: cover;
      transition: var(--transition-smooth);
    }
    .product-item:hover .product-img {
      transform: scale(1.05);
    }
    .sale-badge {
      position: absolute;
      top: 10px;
      right: 10px;
    }
    .product-care-badges {
      display: flex;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }
    .care-badge {
      font-size: 0.75rem;
      background-color: var(--light-bg);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      color: #64748b;
    }
    .product-desc {
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    .price {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--primary-color);
    }
    .old-price {
      font-size: 0.9rem;
      text-decoration: line-through;
      color: #94a3b8;
      margin-left: 0.5rem;
    }
    .btn-icon {
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
      border-radius: 6px;
    }
  `]
})
export class HomeComponent implements OnInit {
  public products = signal<Product[]>([]);
  public categories = signal<Category[]>([]);
  public featuredProducts = signal<Product[]>([]);
  public seeding = signal<boolean>(false);

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadCatalog();
    this.dataService.getCategories().subscribe(cats => this.categories.set(cats));
  }

  loadCatalog() {
    this.dataService.getProducts().subscribe(prods => {
      this.products.set(prods);
      this.featuredProducts.set(prods.slice(0, 4));
    });
  }

  seedCatalog() {
    this.seeding.set(true);
    this.dataService.seedProducts().subscribe({
      next: () => {
        this.seeding.set(false);
        this.loadCatalog();
        this.dataService.loadNavigation(); // Refresh menus
      },
      error: (err) => {
        console.error('Seeding failed', err);
        this.seeding.set(false);
      }
    });
  }

  addToCart(prod: Product) {
    this.dataService.addToCart(prod, 1);
  }
}
