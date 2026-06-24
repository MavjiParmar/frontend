import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, MenuItem, WarehouseStock, InventoryTransaction } from '../data.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  public activeTab = signal<string>('analytics');
  
  // Dashboard models
  public dashboardData = signal<any>(null);
  
  // Menu configuration models
  public allMenus: MenuItem[] = [];
  public rootMenus: MenuItem[] = [];
  public editingItem = signal<any>({
    id: 0,
    title: '',
    targetUrl: '',
    parentId: null,
    sortOrder: 0,
    isActive: true,
    actionType: 'Link'
  });

  // Warehouse stock models
  public inventory = signal<WarehouseStock[]>([]);
  public transactions = signal<InventoryTransaction[]>([]);

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadAnalytics();
    this.loadNavigationData();
    this.loadWarehouseData();
  }

  // --- TAB 1: ANALYTICS ---
  loadAnalytics() {
    this.dataService.getDashboardAnalytics().subscribe({
      next: (data) => this.dashboardData.set(data),
      error: (err) => console.error('Failed to load dashboard analytics', err)
    });
  }

  getBarHeightPercentage(revenue: number): number {
    if (!this.dashboardData() || !this.dashboardData().salesTrend) return 0;
    const maxVal = Math.max(...this.dashboardData().salesTrend.map((d: any) => d.revenue), 100);
    return Math.round((revenue / maxVal) * 100);
  }

  getCategoryWidthPercentage(revenue: number): number {
    if (!this.dashboardData() || !this.dashboardData().totalRevenue) return 0;
    return Math.round((revenue / this.dashboardData().totalRevenue) * 100);
  }

  // --- TAB 2: MENU CONFIGURATOR ---
  loadNavigationData() {
    this.dataService.getAdminNavigation().subscribe(menus => {
      this.allMenus = menus;
      this.rootMenus = menus.filter(m => m.parentId === null);
    });
  }

  editMenuItem(item: MenuItem) {
    this.editingItem.set({
      id: item.id,
      title: item.title,
      targetUrl: item.targetUrl,
      parentId: item.parentId,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      actionType: item.actionType
    });
  }

  saveMenuLink() {
    const item = this.editingItem();
    if (!item.title || !item.targetUrl) {
      alert('Label and URL routes are required.');
      return;
    }

    const payload = {
      ...item,
      parentId: item.parentId ? Number(item.parentId) : null
    };

    this.dataService.saveMenuItem(payload).subscribe({
      next: () => {
        alert('Menu navigation configuration saved successfully!');
        this.resetMenuForm();
        this.loadNavigationData();
        this.dataService.loadNavigation(); // Update frontend main navbar instantly!
      },
      error: (err) => alert('Failed to save menu configuration.')
    });
  }

  deleteMenuItem(id: number) {
    if (confirm('Are you sure you want to delete this menu link? It will delete any nested submenus.')) {
      this.dataService.deleteMenuItem(id).subscribe({
        next: () => {
          this.loadNavigationData();
          this.dataService.loadNavigation(); // Refresh main navbar
        },
        error: (err) => alert('Failed to delete menu link.')
      });
    }
  }

  resetMenuForm() {
    this.editingItem.set({
      id: 0,
      title: '',
      targetUrl: '',
      parentId: null,
      sortOrder: 0,
      isActive: true,
      actionType: 'Link'
    });
  }

  // --- TAB 3: WAREHOUSE HUB ---
  loadWarehouseData() {
    this.dataService.getWarehouseInventory().subscribe(inv => this.inventory.set(inv));
    this.dataService.getInventoryTransactions().subscribe(logs => this.transactions.set(logs));
  }

  adjustStockQuantity(productId: number, qtyChange: number) {
    this.dataService.adjustStock(productId, qtyChange, 'Admin Warehouse Controller').subscribe({
      next: () => {
        this.loadWarehouseData();
        this.loadAnalytics(); // Refresh low-stock warning card
      },
      error: (err) => alert('Failed to adjust stock level.')
    });
  }

  updateStockLocation(productId: number, event: any) {
    const location = event.target.value;
    this.dataService.updateStockLocation(productId, location).subscribe({
      next: () => {
        this.loadWarehouseData();
      },
      error: (err) => alert('Failed to update shelf location.')
    });
  }
}
