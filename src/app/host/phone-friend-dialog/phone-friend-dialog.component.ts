import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

/**
 * Dialog for Phone a Friend lifeline
 * T084: Create PhoneFriendDialogComponent
 * Phase 8: Phone a Friend Lifeline
 */
@Component({
  selector: 'app-phone-friend-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './phone-friend-dialog.component.html',
  styleUrls: ['./phone-friend-dialog.component.scss']
})
export class PhoneFriendDialogComponent {
  /**
   * Friend's suggestion text
   */
  public suggestion = '';

  /**
   * Whether to start timer
   */
  public startTimer = false;

  constructor(
    public dialogRef: MatDialogRef<PhoneFriendDialogComponent>
  ) {}

  /**
   * Submit phone a friend data
   */
  public onSubmit(): void {
    this.dialogRef.close({
      suggestion: this.suggestion || null,
      startTimer: this.startTimer
    });
  }

  /**
   * Cancel dialog
   */
  public onCancel(): void {
    this.dialogRef.close();
  }
}
