import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedWithMe } from './shared-with-me';

describe('SharedWithMe', () => {
  let component: SharedWithMe;
  let fixture: ComponentFixture<SharedWithMe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SharedWithMe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedWithMe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
