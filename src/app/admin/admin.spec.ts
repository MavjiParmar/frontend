import { TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('AdminComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
