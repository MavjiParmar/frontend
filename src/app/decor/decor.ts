import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, DecorPackage, ConsultationBooking } from '../data.service';

@Component({
  selector: 'app-decor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './decor.html',
  styleUrl: './decor.css'
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
    alert(`Added "${pack.packageName}" layout bundle containing standard plants to your active basket.\nRedirecting to checkout...`);
    
    let productIds: number[] = JSON.parse(pack.includedProductIdsJson);
    
    this.dataService.getProducts().subscribe(prods => {
      let filtered = prods.filter(p => productIds.includes(p.id));
      if (filtered.length > 0) {
        filtered.forEach(p => this.dataService.addToCart(p, 1));
      } else {
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
