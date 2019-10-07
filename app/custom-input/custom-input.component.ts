import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  Input,
  HostBinding,
  HostListener,
  Optional,
  Self,
  Inject,
  ElementRef,
  ChangeDetectorRef,
  Renderer2,
} from '@angular/core';
import {
  FormControl,
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm,
} from '@angular/forms';
import {
  ErrorStateMatcher,
  MAT_INPUT_VALUE_ACCESSOR,
  MatFormFieldControl,
} from '@angular/material';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-custom-input',
  template: `
    <input matInput type="text" [formControl]="control" [placeholder]="_placeholder" />
  `,
  styleUrls: ['./custom-input.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: CustomInputComponent,
    },
  ],
})
export class CustomInputComponent
  implements
    OnInit,
    OnChanges,
    OnDestroy,
    ControlValueAccessor,
    MatFormFieldControl<string> {
  control = new FormControl();

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
    // return this.empty ? null : this._elementRef.nativeElement.value || '';
    return this.empty ? null : this.control.value || '';
  }
  set value(value: string) {
    this.writeValue(value);
    this.stateChanges.next();
    this.onChange(value);
  }

  get empty(): boolean {
    // return !this._elementRef.nativeElement.value;
    return !this.control.value;
  }

  get errorState() {
    return this.ngControl.errors !== null && this.ngControl.touched;
  }

  // _inputValueAccessor: { value: any };
  // errorStateMatcher: ErrorStateMatcher;

  constructor(
    // HasErrorState
    @Optional() private readonly _parentFormGroup: FormGroupDirective,
    @Optional() private readonly _parentForm: NgForm,
    private readonly _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() @Self() public readonly ngControl: NgControl,
    //
    private readonly fm: FocusMonitor,
    private readonly _elementRef: ElementRef,
    // private readonly renderer: Renderer2,
    // private readonly cdRef: ChangeDetectorRef,
    // @Optional() @Self() @Inject(MAT_INPUT_VALUE_ACCESSOR) readonly inputValueAccessor: any
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    fm.monitor(this._elementRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  ngOnInit() {}
  ngOnChanges() {
    this.stateChanges.next();
  }
  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this._elementRef.nativeElement);
  }

  private onChange = (value: string) => {};
  private onTouched = () => {};
  registerOnChange(fn: (value: string) => {}) {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => {}) {
    this.onTouched = fn;
  }
  writeValue(value: string) {
    // this.renderer.setProperty(this._elementRef.nativeElement.querySelector('input'), 'value', value);
    // this.renderer.setProperty(this._elementRef.nativeElement, 'value', value);
    this.control.setValue(value);
  }

  onContainerClick() {
    if (!this.focused) {
      this.focus();
    }
  }
}
