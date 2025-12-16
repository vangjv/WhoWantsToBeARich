import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AudiencePercentages } from '../../models/lifeline.model';

/**
 * Dialog for entering Ask the Audience percentages
 * T075: Create AudiencePercentagesDialogComponent
 * Phase 7: Ask the Audience Lifeline
 */
@Component({
  selector: 'app-audience-percentages-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './audience-percentages-dialog.component.html',
  styleUrls: ['./audience-percentages-dialog.component.scss']
})
export class AudiencePercentagesDialogComponent {
  /**
   * Percentage values for each choice
   */
  public percentageA = 0;
  public percentageB = 0;
  public percentageC = 0;
  public percentageD = 0;

  /**
   * Validation error message
   */
  public validationError = '';

  constructor(
    public dialogRef: MatDialogRef<AudiencePercentagesDialogComponent>
  ) {}

  /**
   * Get total of all percentages
   */
  public getTotal(): number {
    return this.percentageA + this.percentageB + this.percentageC + this.percentageD;
  }

  /**
   * Check if percentages are valid
   */
  public isValid(): boolean {
    const total = this.getTotal();
    return Math.abs(total - 100) < 0.01;
  }

  /**
   * Update validation error message
   */
  public updateValidation(): void {
    const total = this.getTotal();
    if (Math.abs(total - 100) < 0.01) {
      this.validationError = '';
    } else {
      this.validationError = `Percentages must sum to 100 (current: ${total.toFixed(1)})`;
    }
  }

  /**
   * Submit percentages
   */
  public onSubmit(): void {
    if (!this.isValid()) {
      this.updateValidation();
      return;
    }

    const percentages: AudiencePercentages = {
      A: this.percentageA,
      B: this.percentageB,
      C: this.percentageC,
      D: this.percentageD
    };

    this.dialogRef.close(percentages);
  }

  /**
   * Cancel dialog
   */
  public onCancel(): void {
    this.dialogRef.close();
  }
}
