import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDesingComponent } from './panel-desing.component';

describe('PanelDesingComponent', () => {
  let component: PanelDesingComponent;
  let fixture: ComponentFixture<PanelDesingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelDesingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelDesingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
