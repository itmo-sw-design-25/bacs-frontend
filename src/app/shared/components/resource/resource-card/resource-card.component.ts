import { Component, Input } from '@angular/core';
import { ResourceDto } from '@api/models/resourceDto';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ResourceTypePipe } from '@shared/pipes/resource-type.pipe';

@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [
    NgOptimizedImage,
    MatIcon,
    NgIf,
    ResourceTypePipe
  ],
  templateUrl: './resource-card.component.html',
  styleUrls: ['./resource-card.component.scss']
})
export class ResourceCardComponent {
  readonly noImage = 'https://bacs.space/s3/static/front/no-image-placeholder.svg';

  @Input() resource!: ResourceDto;
}
