import { Pipe, PipeTransform } from '@angular/core';
import { ReservationStatus } from '@api/models/reservationStatus';

@Pipe({
  name: 'reservationStatus',
  standalone: true
})
export class ReservationStatusPipe implements PipeTransform {
  transform(value: ReservationStatus): string {
    switch (value) {
      case 'Created':
        return 'Активна';
      case 'Cancelled':
        return 'Отменена';
    }
  }
}
