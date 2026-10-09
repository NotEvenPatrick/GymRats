import { Service, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Service()
export class NotificationService {
    private snackBar = inject(MatSnackBar);

    success(message: string):void {
        this.snackBar.open(message, undefined, { duration: 3000 });
    }

    error(message: string):void {
        this.snackBar.open(message, undefined, { duration: 5000 });
    }

    info(message: string):void {
        this.snackBar.open(message, undefined, { duration: 3000 });
    }
}
