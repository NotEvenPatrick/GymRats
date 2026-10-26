import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';
import { confirmDelete } from './confirm-delete';

describe('ConfirmDialog', () => {
  const dialogRef = { close: vi.fn() };
  const data: ConfirmDialogData = {
    title: 'Titel',
    message: 'Wirklich?',
    confirmButtonText: 'Ja',
    cancelButtonText: 'Nein',
  };

  beforeEach(async () => {
    dialogRef.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();
  });

  it('schließt mit true bei Bestätigung', () => {
    TestBed.createComponent(ConfirmDialog).componentInstance.confirm();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('schließt mit false bei Abbruch', () => {
    TestBed.createComponent(ConfirmDialog).componentInstance.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});

describe('confirmDelete', () => {
  function dialogReturning(result: boolean | undefined) {
    return { open: vi.fn().mockReturnValue({ afterClosed: () => of(result) }) } as unknown as MatDialog;
  }

  it('öffnet den Dialog mit Lösch-Texten und emittiert bei Bestätigung', () => {
    const dialog = dialogReturning(true);
    const emitted: boolean[] = [];

    confirmDelete(dialog, 'T', 'M').subscribe((r) => emitted.push(r));

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialog, {
      data: { title: 'T', message: 'M', confirmButtonText: 'Löschen', cancelButtonText: 'Abbrechen' },
    });
    expect(emitted).toEqual([true]);
  });

  it.each([false, undefined])('emittiert nichts bei %s', (result) => {
    const emitted: boolean[] = [];

    confirmDelete(dialogReturning(result), 'T', 'M').subscribe((r) => emitted.push(r));

    expect(emitted).toEqual([]);
  });
});
