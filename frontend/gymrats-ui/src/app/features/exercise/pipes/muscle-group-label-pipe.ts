import { Pipe, PipeTransform } from '@angular/core';
import { MUSCLE_GROUPS } from '../models/muscle-group';

@Pipe({ name: 'muscleGroupLabel' })
export class MuscleGroupLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return MUSCLE_GROUPS.find((group) => group.value === value)?.label ?? value ?? '';
  }
}
