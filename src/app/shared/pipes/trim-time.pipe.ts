import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeTrim',
  standalone: true
})
export class TimeTrimPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    format: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false }
  ): string {
    if (!value) return '';

    const [hStr, mStr, sStr = '0'] = value.split(':');
    const h = Number(hStr);
    const m = Number(mStr);
    const s = Number(sStr);

    const utcDate = new Date(Date.UTC(1970, 0, 1, h, m, s));

    return utcDate.toLocaleTimeString(undefined, format);
  }
}
