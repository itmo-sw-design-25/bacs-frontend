import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'bacs-error-snackbar',
  templateUrl: './error-snackbar.component.html',
  styleUrls: ['./error-snackbar.component.scss'],
  imports: [MatIcon, NgForOf, NgIf],
  standalone: true
})
export class ErrorSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: { title: string; message: string; errors: object }
  ) {}

  get validationErrors() {
    return Object.entries(this.data.errors).map(([field, messages]) => ({ field, messages }));
  }
}
