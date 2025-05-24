import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'address',
  standalone: true
})
export class AddressPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'Адрес отсутствует';
    return `https://2gis.ru/search/${value}`;
  }
}
