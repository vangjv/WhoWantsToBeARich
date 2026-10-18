import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-walk-away-confirmation-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Walk Away?</h2>
    <mat-dialog-content>
      <p>
        Are you sure you want to walk away? The game will end and lock in the winnings from the
        last cleared level.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-raised-button color="warn" (click)="dialogRef.close(true)">Walk Away</button>
    </mat-dialog-actions>
  `
})
export class WalkAwayConfirmationDialogComponent {
  constructor(public dialogRef: MatDialogRef<WalkAwayConfirmationDialogComponent>) {}
}
