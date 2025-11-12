import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  OnDestroy,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpResponse } from '@angular/common/http';
import { ReportsService } from '@api/services/reports.service';
import { CommonModule } from '@angular/common';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { SuccessSnackbarComponent } from '@shared/components/snackbar/success-snackbar/success-snackbar.component';
import {
  ReservationsReportComponent,
  ReservationsReportParams
} from './reports/reservations-report/reservations-report.component';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ImportantReportComponent } from '@features/reports/pages/reports-page/reports/important-report/important-report.component';

type ReportId = 'reservations' | 'test';

interface ReportDef {
  id: ReportId;
  title: string;
  description: string;
  component: Type<any>;
  isValid?: () => boolean;
}

@Component({
  selector: 'bacs-reports-page',
  standalone: true,
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButton,
    MatPrefix,
    MatIcon,
    MatLabel,
    MatFormField,
    MatSelect,
    MatOption,
    MatProgressBar
  ]
})
export class ReportsPageComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = false;
  private destroy$ = new Subject<void>();

  reports: ReportDef[] = [
    {
      id: 'reservations',
      title: 'Отчёт по бронированиям',
      description: 'Выгрузка бронирований за выбранный период в формате XLSX.',
      component: ReservationsReportComponent
    },
    {
      id: 'test',
      title: 'Отчёт по очень важным метрикам',
      description: 'Выгрузка очень важных метрик в формате XLSX.',
      component: ImportantReportComponent
    }
  ];

  form = this.fb.group({
    report: this.fb.control<ReportId>('reservations', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  @ViewChild('reportHost', { read: ViewContainerRef }) reportHost!: ViewContainerRef;
  private reportComponentRef?: ComponentRef<any>;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private reportsService: ReportsService
  ) {}

  get selectedReport(): ReportDef | undefined {
    return this.reports.find((r) => r.id === this.form.controls.report.value);
  }

  get isFormValid(): boolean {
    const instance = this.reportComponentRef?.instance;
    const params = instance?.getParams?.();

    return params?.valid;
  }

  ngOnInit(): void {
    this.form.controls.report.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadReportComponent());
  }

  ngAfterViewInit(): void {
    this.loadReportComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.reportComponentRef?.destroy();
    this.reportHost?.clear();
  }

  private loadReportComponent() {
    if (!this.reportHost || !this.selectedReport) return;
    this.reportHost.clear();
    this.reportComponentRef = this.reportHost.createComponent(this.selectedReport.component);
    this.cdr.detectChanges();
  }

  trackByReportId(_: number, r: ReportDef): ReportId {
    return r.id;
  }

  async onGenerate(): Promise<void> {
    if (!this.selectedReport || !this.reportComponentRef) return;

    const instance = this.reportComponentRef.instance;
    const params = instance.getParams?.();
    if (!params?.valid) {
      instance.markAllAsTouched?.();
      return;
    }

    this.loading = true;
    try {
      if (this.selectedReport.id === 'reservations') {
        const { from, to, userId, resourceId, locationId } =
          params.value as ReservationsReportParams;
        const fromStr = this.toDateString(from);
        const toStr = this.toDateString(to);

        const response = (await firstValueFrom(
          this.reportsService.reportsReservationsPost(
            fromStr,
            toStr,
            userId ?? undefined,
            resourceId ?? undefined,
            locationId ?? undefined,
            'response',
            true
          )
        )) as HttpResponse<Blob>;

        const blob = response.body ?? new Blob([]);
        const fileName = 'report_' + this.selectedReport.id + `_${fromStr}_to_${toStr}.xlsx`;

        this.downloadBlob(blob, fileName!);

        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: { message: 'Отчёт сформирован' }
        });
      }

      if (this.selectedReport.id === 'test') {
        this.snackBar.open('Тестовый отчёт сгенерирован', undefined, { duration: 2000 });
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }
}
