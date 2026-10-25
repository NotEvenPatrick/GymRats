import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionDetails } from './session-details';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

describe('SessionDetails', () => {
  let component: SessionDetails;
  let fixture: ComponentFixture<SessionDetails>;

  const activatedRouteMock = {
    snapshot: {
      paramMap: convertToParamMap({})
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionDetails],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
