import { Pipe, PipeTransform } from '@angular/core';
import { ResourceType } from '@api/models/resourceType';

@Pipe({
  name: 'resourceType',
  standalone: true
})
export class ResourceTypePipe implements PipeTransform {
  transform(value: ResourceType | undefined): string {
    switch (value) {
      case 'MeetingRoom':
        return 'Переговорная комната';
      case 'Workplace':
        return 'Рабочее место';
      default:
        return 'Не указан';
    }
  }
}
