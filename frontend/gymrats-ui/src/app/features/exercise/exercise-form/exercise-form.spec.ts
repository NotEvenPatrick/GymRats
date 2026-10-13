import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExerciseForm } from './exercise-form';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('ExerciseForm', () => {
  let component: ExerciseForm;
  let fixture: ComponentFixture<ExerciseForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseForm],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } }, 
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
