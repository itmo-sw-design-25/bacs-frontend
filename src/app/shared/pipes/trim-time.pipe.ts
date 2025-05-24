import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeTrim',
  standalone: true
})
export class TimeTrimPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value.split(':').slice(0, 2).join(':');
  }
}
