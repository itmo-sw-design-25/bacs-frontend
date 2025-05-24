import { ResourceDto } from '@api/models/resourceDto';

export interface Slot {
  from: string; // ISO-строка, например "2025-05-24T09:00:00Z"
  to: string;   // ISO-строка
}

export interface ResourceSlots {
  resource: ResourceDto;
  slots: Slot[];
}
