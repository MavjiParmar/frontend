import { TestBed } from '@angular/core/testing';
import { ShopComponent } from './shop';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('ShopComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ShopComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
