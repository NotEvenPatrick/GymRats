import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionForm } from './session-form';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

describe('SessionForm', () => {
  let component: SessionForm;
  let fixture: ComponentFixture<SessionForm>;

  const activatedRouteMock = {
    snapshot: {
      paramMap: convertToParamMap({})
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionForm],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
