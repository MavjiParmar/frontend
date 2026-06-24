import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, MenuItem, WarehouseStock, InventoryTransaction } from './data.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container container animate-fade-in">
      <header class="admin-header">
        <h1>Enterprise Dashboard</h1>
        <div class="tab-selectors">
          <button (click)="activeTab.set('analytics')" [class.active]="activeTab() === 'analytics'" class="tab-btn">📈 Sales Analytics</button>
          <button (click)="activeTab.set('navigation')" [class.active]="activeTab() === 'navigation'" class="tab-btn">🔗 Menu Configurator</button>
          <button (click)="activeTab.set('warehouse')" [class.active]="activeTab() === 'warehouse'" class="tab-btn">📦 Warehouse Hub</button>
        </div>
      </header>

      <!-- TAB 1: SALES ANALYTICS -->
      <section *ngIf="activeTab() === 'analytics'" class="admin-section animate-fade-in">
        <!-- Dashboard Scorecards -->
        <div class="grid-3 summary-cards">
          <div class="card scorecard">
            <span class="card-icon">💰</span>
            <div class="card-val">₹{{ dashboardData()?.totalRevenue || 0 | number:'1.2-2' }}</div>
            <div class="card-label">Total Revenue</div>
          </div>
          <div class="card scorecard">
            <span class="card-icon">📥</span>
            <div class="card-val">{{ dashboardData()?.totalOrders || 0 }}</div>
            <div class="card-label">Total Orders</div>
          </div>
          <div class="card scorecard" [class.alert]="dashboardData()?.lowStockAlerts > 0">
            <span class="card-icon">🚨</span>
            <div class="card-val">{{ dashboardData()?.lowStockAlerts || 0 }}</div>
            <div class="card-label">Low Stock Alerts</div>
          </div>
        </div>

        <div class="grid-2 dashboard-details">
          <!-- Sales Trend Chart (Pure CSS Custom Columns) -->
          <div class="card chart-card">
            <h3>Daily Revenue Trend (Last 7 Days)</h3>
            <div class="bar-chart-container" *ngIf="dashboardData()?.salesTrend?.length > 0">
              <div class="chart-bars">
                <div *ngFor="let day of dashboardData().salesTrend" class="chart-bar-col">
                  <div class="bar-fill" [style.height.%]="getBarHeightPercentage(day.revenue)" [title]="'₹' + day.revenue">
                    <span class="bar-val">₹{{ day.revenue }}</span>
                  </div>
                  <div class="bar-label">{{ day.date | date:'EEE' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top-Selling Plants -->
          <div class="card table-card">
            <h3>Top Performing Plants</h3>
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of dashboardData()?.topProducts">
                  <td>🌳 {{ item.productName }}</td>
                  <td><strong>{{ item.unitsSold }}</strong> sold</td>
                  <td class="price">₹{{ item.revenue }}</td>
                </tr>
                <tr *ngIf="!dashboardData()?.topProducts?.length">
                  <td colspan="3" class="text-center text-muted">No sales logged yet. Seed catalog and place orders.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Sales by Category Grid -->
        <div class="card full-width-card category-breakdown-card">
          <h3>Category Sales Share</h3>
          <div class="category-bars-grid" *ngIf="dashboardData()?.categoryBreakdown?.length > 0">
            <div *ngFor="let cat of dashboardData().categoryBreakdown" class="category-progress-item">
              <div class="cat-label">
                <span>{{ cat.categoryName }}</span>
                <strong>₹{{ cat.revenue }} ({{ cat.unitsSold }} units)</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill" [style.width.%]="getCategoryWidthPercentage(cat.revenue)"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 2: MENU CONFIGURATOR -->
      <section *ngIf="activeTab() === 'navigation'" class="admin-section animate-fade-in">
        <div class="menu-config-grid">
          <!-- Editor Form -->
          <div class="card menu-editor-card">
            <h3>{{ editingItem().id === 0 ? 'Create New Link' : 'Modify Link' }}</h3>
            <form (submit)="saveMenuLink()" class="menu-form">
              <div class="form-group">
                <label class="form-label">Link Label</label>
                <input type="text" [(ngModel)]="editingItem().title" name="title" required placeholder="e.g. Bonsai Pots" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Target Route / URL</label>
                <input type="text" [(ngModel)]="editingItem().targetUrl" name="url" required placeholder="e.g. /shop/pots" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Action Type</label>
                <select [(ngModel)]="editingItem().actionType" name="actionType" class="form-input">
                  <option value="Link">Internal Route Link</option>
                  <option value="CategoryFilter">Catalog Filter Route</option>
                  <option value="External">External Target Link</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Parent Menu (Optional - for Sub-Menus)</label>
                <select [(ngModel)]="editingItem().parentId" name="parentId" class="form-input">
                  <option [value]="null">-- None (Root Menu) --</option>
                  <option *ngFor="let root of rootMenus" [value]="root.id">{{ root.title }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Sort Order</label>
                <input type="number" [(ngModel)]="editingItem().sortOrder" name="sort" class="form-input">
              </div>
              <div class="form-group inline-checkbox">
                <label>
                  <input type="checkbox" [(ngModel)]="editingItem().isActive" name="active">
                  Visible in Navigation Bar
                </label>
              </div>

              <div class="form-actions">
                <button type="button" (click)="resetMenuForm()" class="btn btn-secondary">Clear</button>
                <button type="submit" class="btn btn-primary">Save Config</button>
              </div>
            </form>
          </div>

          <!-- Existing Navigation Tree Layout -->
          <div class="card menu-tree-card">
            <h3>Dynamic Navigation Tree</h3>
            <p class="section-desc">Changes here immediately reflect on the navbar without any application redeployment.</p>

            <div class="tree-list">
              <div *ngFor="let menu of allMenus" class="tree-node root-node">
                <div class="node-content">
                  <span class="node-title">🔗 {{ menu.title }} <small class="text-muted">({{ menu.targetUrl }})</small></span>
                  <span *ngIf="!menu.isActive" class="badge badge-red font-xs">Hidden</span>
                  <div class="node-actions">
                    <button (click)="editMenuItem(menu)" class="edit-btn">✏️</button>
                    <button (click)="deleteMenuItem(menu.id)" class="delete-btn">✕</button>
                  </div>
                </div>

                <!-- Submenus rendering -->
                <div class="sub-tree-list" *ngIf="menu.subMenus && menu.subMenus.length > 0">
                  <div *ngFor="let sub of menu.subMenus" class="tree-node sub-node">
                    <div class="node-content">
                      <span class="node-title">└─ 🔹 {{ sub.title }} <small class="text-muted">({{ sub.targetUrl }})</small></span>
                      <div class="node-actions">
                        <button (click)="editMenuItem(sub)" class="edit-btn">✏️</button>
                        <button (click)="deleteMenuItem(sub.id)" class="delete-btn">✕</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 3: WAREHOUSE & INVENTORY HUB -->
      <section *ngIf="activeTab() === 'warehouse'" class="admin-section animate-fade-in">
        <div class="grid-2 warehouse-grid">
          <!-- Inventory Table -->
          <div class="card table-card full-width-col">
            <h3>Warehouse Stocks Ledger</h3>
            <table class="dashboard-table font-sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Shelf Location</th>
                  <th>On Hand</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Adjust Stock</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of inventory()" [class.low-stock-tr]="item.quantityOnHand <= item.lowStockThreshold">
                  <td>
                    <strong>{{ item.product?.name }}</strong>
                    <span *ngIf="item.quantityOnHand <= item.lowStockThreshold" class="badge badge-red stock-badge">Low Stock</span>
                  </td>
                  <td><code>{{ item.product?.sku }}</code></td>
                  <td>
                    <input type="text" 
                           [ngModel]="item.storageLocation" 
                           (blur)="updateStockLocation(item.productId, $event)" 
                           class="inline-loc-input" 
                           title="Press tab or click away to save location">
                  </td>
                  <td><strong>{{ item.quantityOnHand }}</strong> units</td>
                  <td>{{ item.quantityReserved }}</td>
                  <td><strong>{{ item.quantityOnHand - item.quantityReserved }}</strong></td>
                  <td>
                    <div class="qty-adjuster">
                      <button (click)="adjustStockQuantity(item.productId, -10)" class="adj-btn dec">-10</button>
                      <button (click)="adjustStockQuantity(item.productId, 10)" class="adj-btn inc">+10</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Transaction Audit Logs -->
          <div class="card table-card">
            <h3>Recent Warehouse Transaction Audit</h3>
            <div class="log-list">
              <div *ngFor="let trans of transactions()" class="log-row">
                <span class="log-time">{{ trans.timestamp | date:'shortTime' }}</span>
                <span class="log-desc">
                  <strong>{{ trans.product?.name }}</strong>: 
                  <span [class.text-green]="trans.quantity > 0" [class.text-red]="trans.quantity < 0">
                    {{ trans.quantity > 0 ? '+' : '' }}{{ trans.quantity }} units
                  </span> 
                  ({{ trans.type }})
                </span>
                <span class="log-by">by {{ trans.changedBy }}</span>
              </div>
              <div *ngIf="!transactions().length" class="text-center text-muted">No transactions audited yet.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .admin-container {
      padding-top: 2rem;
      padding-bottom: 5rem;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid var(--border-color);
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .admin-header h1 {
      font-size: 1.8rem;
      color: var(--primary-color);
    }
    .tab-selectors {
      display: flex;
      gap: 0.5rem;
    }
    .tab-btn {
      background: white;
      border: 1px solid var(--border-color);
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .tab-btn:hover {
      background-color: var(--soft-green);
    }
    .tab-btn.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
    
    .summary-cards {
      margin-bottom: 2rem;
    }
    .scorecard {
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .scorecard.alert {
      border-left: 5px solid var(--danger-color);
      background-color: #fff8f8;
    }
    .card-icon {
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
    }
    .card-val {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color);
    }
    .card-label {
      font-size: 0.85rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    .full-width-col {
      grid-column: 1 / -1;
    }
    
    .dashboard-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    .dashboard-table th, .dashboard-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    .dashboard-table th {
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      background-color: var(--light-bg);
    }
    .dashboard-table td {
      font-size: 0.9rem;
    }
    .low-stock-tr {
      background-color: #fff8f8;
    }
    .stock-badge {
      font-size: 0.65rem;
      margin-left: 0.5rem;
    }
    
    /* CSS Columns Bar Chart */
    .chart-card {
      padding: 1.5rem;
    }
    .bar-chart-container {
      height: 250px;
      margin-top: 2rem;
      position: relative;
    }
    .chart-bars {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 80%;
      border-bottom: 2px solid var(--border-color);
    }
    .chart-bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      max-width: 60px;
    }
    .bar-fill {
      width: 32px;
      background: linear-gradient(to top, var(--primary-color) 0%, var(--accent-color) 100%);
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      position: relative;
      transition: all 0.5s ease-out;
      cursor: pointer;
    }
    .bar-fill:hover {
      filter: brightness(1.1);
    }
    .bar-val {
      position: absolute;
      top: -24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary-color);
      white-space: nowrap;
    }
    .bar-label {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.5rem;
    }
    
    /* Category Progress Bars */
    .category-breakdown-card {
      margin-top: 2rem;
    }
    .category-bars-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    .category-progress-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .cat-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .progress-track {
      height: 10px;
      background-color: var(--border-color);
      border-radius: 10px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background-color: var(--primary-light);
      border-radius: 10px;
    }
    
    /* Menu Tree Editor layout */
    .menu-config-grid {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 2rem;
    }
    .menu-form {
      margin-top: 1.5rem;
    }
    .inline-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .inline-checkbox label {
      cursor: pointer;
      font-size: 0.9rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    
    .tree-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .tree-node {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      background-color: var(--light-bg);
    }
    .root-node {
      border-left: 4px solid var(--primary-color);
    }
    .sub-tree-list {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-left: 1.5rem;
    }
    .sub-node {
      background-color: white;
      border-left: 4px solid var(--accent-color);
    }
    .node-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .node-title {
      font-size: 0.9rem;
      font-weight: 500;
    }
    .node-actions {
      display: flex;
      gap: 0.4rem;
    }
    .node-actions button {
      background: none; border: none; cursor: pointer; padding: 0.2rem; font-size: 0.9rem;
    }
    
    /* Warehouse Stocks */
    .warehouse-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    .qty-adjuster {
      display: flex; gap: 0.25rem;
    }
    .adj-btn {
      padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 4px; border: 1px solid var(--border-color); background: white; cursor: pointer;
    }
    .adj-btn.dec:hover { background-color: #fee2e2; color: var(--danger-color); }
    .adj-btn.inc:hover { background-color: #dcfce7; color: var(--success-color); }
    
    .inline-loc-input {
      width: 100px;
      border: 1px solid transparent;
      background: transparent;
      padding: 0.25rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-family: inherit;
    }
    .inline-loc-input:focus {
      border-color: var(--primary-color);
      background: white;
      outline: none;
    }
    
    /* Logs list */
    .log-list {
      max-height: 400px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .log-row {
      padding: 0.5rem;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.8rem;
      display: flex;
      justify-content: space-between;
    }
    .log-time { color: #94a3b8; }
    .log-desc { flex: 1; margin: 0 1rem; }
    .text-green { color: var(--success-color); }
    .text-red { color: var(--danger-color); }
    .log-by { color: #64748b; font-style: italic; }
    
    @media (max-width: 991px) {
      .menu-config-grid { grid-template-columns: 1fr; }
    }
  `]
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

    // Convert parentId to numeric/null
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
