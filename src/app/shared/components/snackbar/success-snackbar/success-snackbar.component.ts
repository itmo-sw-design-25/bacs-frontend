import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'bacs-success-snackbar',
  templateUrl: './success-snackbar.component.html',
  styleUrls: ['./success-snackbar.component.scss'],
  imports: [MatIcon],
  standalone: true
})
export class SuccessSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string }) {}
}
