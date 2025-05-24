import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reservationSlot',
  standalone: true
})
export class ReservationSlotPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '-';

    return value.substring(11, 16); // HH:mm
  }
}
