import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Product } from '../data.service';

@Component({
  selector: 'app-gifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gifts.html',
  styleUrl: './gifts.css'
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
    { name: 'Beginner Greenery Hamper', desc: 'Resilient Snake Plant and Aloe Vera. Includes custom brass watering can.', price: 1799, plantIds: [1, 7, 10] }
  ];

  public comboPrice = computed(() => {
    const plantPrice = this.selectedPlant()?.price || 0;
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
      this.dataService.addToCart(plant, 1, this.selectedColor());
      
      alert(`Custom Gift Combo added to Cart!\nWe've set the pot color to "${this.selectedColor()}" and queued your greeting note.`);
      
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
