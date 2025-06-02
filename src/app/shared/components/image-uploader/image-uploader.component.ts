import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'bacs-image-uploader',
  standalone: true,
  templateUrl: './image-uploader.component.html',
  imports: [MatFabButton, MatTooltip, MatIcon, NgOptimizedImage],
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent {
  @Input() src!: string;
  @Output() fileSelected = new EventEmitter<File>();

  onChangeFile(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      this.fileSelected.emit(file);
      this.src = URL.createObjectURL(file);
    }
  }
}
