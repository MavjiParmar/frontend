import { TestBed } from '@angular/core/testing';
import { DecorComponent } from './decor';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('DecorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecorComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(DecorComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
