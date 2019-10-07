import {
  Component,
  DoCheck,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher, MatFormFieldControl } from '@angular/material';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-input',
  template: `
      <input matInput type="text" [formControl]="control" [placeholder]="_placeholder"/>
  `,
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: CustomInputComponent,
    },
  ],
})
export class CustomInputComponent
  implements OnInit,
    OnChanges,
    DoCheck,
    OnDestroy,
    ControlValueAccessor,
    MatFormFieldControl<string> {
  control = new FormControl('');
  _value = '';
  _valueSubscription: Subscription;

  readonly stateChanges = new Subject<void>();

  controlType = 'app-custom-input';
  static nextId = 0;
  @HostBinding()
  id = `${this.controlType}-${CustomInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedBy')
  describedBy = '';

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }

  get placeholder() {
    return this._placeholder;
  }

  _placeholder = '';


  @Input()
  set required(required: any) {
    this._required = coerceBooleanProperty(required);
    this.stateChanges.next();
  }

  get required() {
    return this._required;
  }

  _required = false;

  @Input()
  set disabled(disabled: any) {
    this._disabled = coerceBooleanProperty(disabled);

    if (this.focused) {
      this.focused = false;
      this.stateChanges.next();
    }
  }

  get disabled() {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }

  _disabled = false;

  focused = false;

  focus() {
    this._elementRef.nativeElement.focus();
  }

  @HostListener('focusout')
  onBlur() {
    this.focused = false;
    this.onTouched();
    this.stateChanges.next();
  }

  @Input()
  get value(): string {
    return this.empty ? null : this.control.value || '';
  }

  set value(value: string) {
    this.writeValue(value);
    this.stateChanges.next();
    this.onChange(value);
  }

  get empty(): boolean {
    return !this.control.value;
  }

  @Input()
  errorStateMatcher: ErrorStateMatcher;
  errorState = false;

  updateErrorState() {
    const oldState = this.errorState;
    const parent = this._parentFormGroup || this._parentForm;
    const matcher = this.errorStateMatcher || this._defaultErrorStateMatcher;
    const control = this.ngControl ? this.ngControl.control as FormControl : null;
    const newState = matcher.isErrorState(control, parent);

    if (newState !== oldState) {
      this.errorState = newState;
      this.stateChanges.next();
    }
  }


  constructor(
    // HasErrorState
    @Optional() private readonly _parentFormGroup: FormGroupDirective,
    @Optional() private readonly _parentForm: NgForm,
    private readonly _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() @Self() public readonly ngControl: NgControl,
    // ---
    private readonly fm: FocusMonitor,
    private readonly _elementRef: ElementRef,
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    fm.monitor(this._elementRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });

    this._value = this.control.value;
  }

  ngOnInit() {
    this._valueSubscription = this.control.valueChanges.subscribe(val => {
      this.onChange(val);
    });
  }

  ngOnChanges() {
    this.stateChanges.next();
  }

  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
    if (this._value !== this.control.value) {
      this._value = this.control.value;
      this.stateChanges.next();
    }
  }

  ngOnDestroy() {
    if (this._valueSubscription) {
      this._valueSubscription.unsubscribe();
    }
    this.stateChanges.complete();
    this.fm.stopMonitoring(this._elementRef.nativeElement);
  }

  private onChange = (value: string) => {
  };
  private onTouched = () => {
  };

  registerOnChange(fn: (value: string) => {}) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}) {
    this.onTouched = fn;
  }

  writeValue(value: string) {
    this.control.setValue(value);
  }

  onContainerClick() {
    if (!this.focused) {
      this.focus();
    }
  }
}
