import { ChangeDetectionStrategy, Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption
} from '@angular/material/autocomplete';
import { BehaviorSubject, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatInput } from '@angular/material/input';
import { AddressesService } from '@api/services/addresses.service';
import { MatLabel } from '@angular/material/select';

@Component({
  selector: 'bacs-address-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    MatIcon,
    MatProgressSpinner,
    MatAutocomplete,
    MatOption,
    MatInput,
    MatLabel,
    MatAutocompleteTrigger
  ],
  templateUrl: './address-autocomplete.component.html',
  styleUrls: ['./address-autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressAutocompleteComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressAutocompleteComponent implements OnInit, ControlValueAccessor, OnDestroy {
  readonly ctrl = new FormControl<string>('', { nonNullable: true });
  readonly suggestions$ = new BehaviorSubject<string[]>([]);

  loading = false;

  private destroyed$ = new Subject<void>();

  constructor(private api: AddressesService) {}

  ngOnInit(): void {
    this.ctrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => (this.loading = true)),
        switchMap((query) => {
          const q = (query ?? '').trim();
          if (q.length < 3) {
            this.loading = false;
            this.suggestions$.next([]);
            return of([]);
          }
          return this.api.addressesSuggestPost(q).pipe(
            tap(() => (this.loading = false)),
            catchError(() => {
              this.loading = false;
              this.suggestions$.next([]);
              return of([]);
            })
          );
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe((list) => this.suggestions$.next(list));
  }

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};
  protected isDisabled = false;

  writeValue(value: string | null): void {
    this.ctrl.setValue(value ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    isDisabled ? this.ctrl.disable({ emitEvent: false }) : this.ctrl.enable({ emitEvent: false });
  }

  onOptionSelected(e: MatAutocompleteSelectedEvent): void {
    const value = e.option.value as string;
    this.ctrl.setValue(value, { emitEvent: false });
    this.onChange(value);
    this.onTouched();
  }

  onInputBlur(): void {
    this.onTouched();
    this.onChange(this.ctrl.value);
  }

  trackByValue = (_: number, v: string) => v;

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
