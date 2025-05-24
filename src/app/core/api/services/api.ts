export * from './locations.service';
import { LocationsService } from './locations.service';
export * from './reservations.service';
import { ReservationsService } from './reservations.service';
export * from './resources.service';
import { ResourcesService } from './resources.service';
export * from './users.service';
import { UsersService } from './users.service';
export const APIS = [LocationsService, ReservationsService, ResourcesService, UsersService];
