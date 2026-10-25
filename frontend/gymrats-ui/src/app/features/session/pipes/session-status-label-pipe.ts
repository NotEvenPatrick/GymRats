import { Pipe, PipeTransform } from '@angular/core';
import { SessionStatus } from '../models/status';

const LABELS: Record<SessionStatus, string> = {
  [SessionStatus.COMPLETED]: 'Abgeschlossen',
  [SessionStatus.CANCELLED]: 'Abgebrochen',
};

@Pipe({ name: 'sessionStatusLabel' })
export class SessionStatusLabelPipe implements PipeTransform {
  transform(value: SessionStatus | null | undefined): string {
    return value ? LABELS[value] : '';
  }
}
