import { MatDialog } from '@angular/material/dialog';
import { filter, Observable } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData, ConfirmDialogResult } from './confirm-dialog';

export function confirmDelete(dialog: MatDialog, title: string, message: string): Observable<ConfirmDialogResult> {
  return dialog
    .open<ConfirmDialog, ConfirmDialogData, ConfirmDialogResult>(ConfirmDialog, {
      data: {
        title,
        message,
        confirmButtonText: 'Löschen',
        cancelButtonText: 'Abbrechen',
      },
    })
    .afterClosed()
    .pipe(filter((result): result is true => result === true));
}
