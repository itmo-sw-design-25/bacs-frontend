import { ResourceDto } from '@api/models/resourceDto';
import { LocationDto } from '@api/models/locationDto';
import { ReservationDto } from '@api/models/reservationDto';

export interface ReservationFull {
  resource: ResourceDto;
  location: LocationDto;
  reservation: ReservationDto;
}
