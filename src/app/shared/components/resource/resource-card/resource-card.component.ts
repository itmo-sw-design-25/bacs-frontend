import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResourceDto } from '@api/models/resourceDto';
import { AsyncPipe, NgIf, NgOptimizedImage } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ResourceTypePipe } from '@shared/pipes/resource-type.pipe';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { CurrentUserService } from '@shared/services/current-user.service';
import { NoImage } from '@shared/utils/image.utils';

@Component({
  selector: 'bacs-resource-card',
  standalone: true,
  imports: [
    NgOptimizedImage,
    MatIcon,
    NgIf,
    ResourceTypePipe,
    MatIconButton,
    MatTooltip,
    AsyncPipe
  ],
  templateUrl: './resource-card.component.html',
  styleUrls: ['./resource-card.component.scss']
})
export class ResourceCardComponent {
  @Input() resource!: ResourceDto;
  @Input() editEnabled: boolean = false;
  @Output() editClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>();
  protected readonly NoImage = NoImage;

  constructor(private currentUser: CurrentUserService) {}

  isAdmin(locationId?: string) {
    return this.currentUser.isAdmin(locationId);
  }

  editIconClick(event: any): void {
    event.stopPropagation();
    this.editClick.emit();
  }

  deleteIconClick(event: any): void {
    event.stopPropagation();
    this.deleteClick.emit();
  }
}
