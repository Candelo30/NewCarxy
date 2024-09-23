import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCarsComponent } from './view-cars.component';

describe('ViewCarsComponent', () => {
  let component: ViewCarsComponent;
  let fixture: ComponentFixture<ViewCarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
