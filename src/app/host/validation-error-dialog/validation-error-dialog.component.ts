import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

/**
 * Data structure for validation error dialog
 */
export interface ValidationErrorData {
  fileName: string;
  errors: string[];
}

/**
 * Validation Error Dialog Component
 * T110: Display specific validation issues when importing question packs
 * Phase 10: Custom Question Pack Import
 */
@Component({
  selector: 'app-validation-error-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn" class="error-icon">error</mat-icon>
      Question Pack Validation Failed
    </h2>

    <mat-dialog-content class="validation-content">
      <p class="file-name"><strong>File:</strong> {{ data.fileName }}</p>

      <p class="error-summary">
        {{ data.errors.length }} validation {{ data.errors.length === 1 ? 'error' : 'errors' }} found:
      </p>

      <mat-list class="error-list">
        <mat-list-item *ngFor="let error of data.errors; let i = index">
          <mat-icon matListItemIcon color="warn">warning</mat-icon>
          <div matListItemTitle>{{ i + 1 }}. {{ error }}</div>
        </mat-list-item>
      </mat-list>

      <div class="help-section">
        <h4>Common Issues:</h4>
        <ul>
          <li>Check that all questions have exactly 4 choices (A, B, C, D)</li>
          <li>Ensure correct answer key exists in choices</li>
          <li>Verify question levels are contiguous (1, 2, 3... with no gaps)</li>
          <li>Check that question text is between 10-500 characters</li>
          <li>Validate all required fields are present</li>
        </ul>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()" color="primary">
        Close
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .error-icon {
      vertical-align: middle;
      margin-right: 8px;
    }

    .validation-content {
      max-height: 500px;
      overflow-y: auto;
    }

    .file-name {
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 16px;
      font-family: 'Courier New', monospace;
    }

    .error-summary {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      color: #d32f2f;
    }

    .error-list {
      margin-bottom: 24px;
      border: 1px solid #ffcdd2;
      border-radius: 4px;
      background-color: #ffebee;
    }

    .error-list mat-list-item {
      margin-bottom: 8px;
    }

    .help-section {
      margin-top: 24px;
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 4px;
    }

    .help-section h4 {
      margin-top: 0;
      color: #1976d2;
    }

    .help-section ul {
      margin: 8px 0;
      padding-left: 24px;
    }

    .help-section li {
      margin-bottom: 8px;
    }
  `]
})
export class ValidationErrorDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ValidationErrorData,
    private dialogRef: MatDialogRef<ValidationErrorDialogComponent>
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
