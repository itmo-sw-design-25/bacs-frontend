import { ResourceDto } from '@api/models/resourceDto';
import { LocationDto } from '@api/models/locationDto';

export interface Slot {
  from: Date;
  to: Date;
}

export interface ResourceSlots {
  resource: ResourceDto;
  location: LocationDto;
  slots: Slot[];
}
