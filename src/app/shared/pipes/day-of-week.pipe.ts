import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { RussianDayOfWeek } from '@api/models/russianDayOfWeek';

@Pipe({
  name: 'dayOfWeek',
  standalone: true
})
@Injectable({ providedIn: 'root' })
export class DayOfWeekPipe implements PipeTransform {
  transform(value: RussianDayOfWeek): string {
    switch (value) {
      case 'Monday':
        return 'Понедельник';
      case 'Tuesday':
        return 'Вторник';
      case 'Wednesday':
        return 'Среда';
      case 'Thursday':
        return 'Четверг';
      case 'Friday':
        return 'Пятница';
      case 'Saturday':
        return 'Суббота';
      case 'Sunday':
        return 'Воскресенье';
    }
  }
}
