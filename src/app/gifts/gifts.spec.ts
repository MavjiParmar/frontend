import { TestBed } from '@angular/core/testing';
import { GiftsComponent } from './gifts';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('GiftsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(GiftsComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
