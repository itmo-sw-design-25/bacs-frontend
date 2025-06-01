import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResourceDto } from '@api/models/resourceDto';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ResourceTypePipe } from '@shared/pipes/resource-type.pipe';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '@core/auth.service';

@Component({
  selector: 'bacs-resource-card',
  standalone: true,
  imports: [
    NgOptimizedImage,
    MatIcon,
    NgIf,
    ResourceTypePipe,
    MatIconButton,
    MatTooltip
  ],
  templateUrl: './resource-card.component.html',
  styleUrls: ['./resource-card.component.scss']
})
export class ResourceCardComponent {
  readonly noImage = 'https://bacs.space/s3/static/front/no-image-placeholder.svg';

  @Input() resource!: ResourceDto;
  @Input() editEnabled: boolean = false;
  @Output() editClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>();

  get isAdmin(): boolean {
    return this.authService.isAdmin || this.authService.isSuperAdmin;
  }

  constructor(private authService: AuthService) {
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
