import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutList } from './workout-list';

describe('WorkoutList', () => {
  let component: WorkoutList;
  let fixture: ComponentFixture<WorkoutList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutList],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
