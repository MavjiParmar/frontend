import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService, Product, Category } from '../data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
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
