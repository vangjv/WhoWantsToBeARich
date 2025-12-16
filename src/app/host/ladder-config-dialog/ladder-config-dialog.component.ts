import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MoneyLadder, LadderLevel } from '../../models/money-ladder.model';

/**
 * Dialog component for configuring money ladder values and safe haven positions
 * Allows host to customize all 15 level values and select which levels are safe havens
 */
@Component({
  selector: 'app-ladder-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './ladder-config-dialog.component.html',
  styleUrls: ['./ladder-config-dialog.component.scss']
})
export class LadderConfigDialogComponent implements OnInit {
  ladderForm!: FormGroup;
  displayedColumns = ['level', 'value', 'safeHaven'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LadderConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ladder: MoneyLadder }
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize form with current ladder configuration
   */
  private initForm(): void {
    this.ladderForm = this.fb.group({
      levels: this.fb.array(
        this.data.ladder.levels.map(level =>
          this.fb.group({
            levelNumber: [level.levelNumber],
            value: [level.value, [Validators.required, Validators.min(1)]],
            isSafeHaven: [this.data.ladder.safeHavens.includes(level.levelNumber)]
          })
        )
      )
    });
  }

  /**
   * Get levels form array
   */
  get levels(): FormArray {
    return this.ladderForm.get('levels') as FormArray;
  }

  /**
   * Check if form has validation warnings (values not monotonically increasing)
   */
  hasWarnings(): boolean {
    const levels = this.levels.value;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i].value <= levels[i - 1].value) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get warning message if values are not monotonically increasing
   */
  getWarningMessage(): string {
    const levels = this.levels.value;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i].value <= levels[i - 1].value) {
        return `Warning: Level ${i + 1} value (${levels[i].value}) should be greater than Level ${i} value (${levels[i - 1].value})`;
      }
    }
    return '';
  }

  /**
   * Format currency value for display
   */
  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value}`;
    }
  }

  /**
   * Save configuration and close dialog
   */
  save(): void {
    if (this.ladderForm.valid) {
      const levels: LadderLevel[] = this.levels.value.map((level: any) => ({
        levelNumber: level.levelNumber,
        value: level.value
      }));

      const safeHavens: number[] = this.levels.value
        .filter((level: any) => level.isSafeHaven)
        .map((level: any) => level.levelNumber);

      const ladder: MoneyLadder = { levels, safeHavens };
      this.dialogRef.close(ladder);
    }
  }

  /**
   * Cancel and close dialog
   */
  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Reset all values to default ladder
   */
  resetToDefault(): void {
    // Default values from createDefaultLadder()
    const defaultValues = [
      100, 200, 300, 500, 1000,
      2000, 4000, 8000, 16000, 32000,
      64000, 125000, 250000, 500000, 1000000
    ];
    const defaultSafeHavens = [5, 10];

    this.levels.controls.forEach((control, index) => {
      control.patchValue({
        value: defaultValues[index],
        isSafeHaven: defaultSafeHavens.includes(index + 1)
      });
    });

    this.ladderForm.markAsDirty();
  }
}
