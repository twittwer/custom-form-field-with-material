import { Component, ElementRef, OnDestroy, OnInit, Optional, Self, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher, MatFormFieldControl } from '@angular/material';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Subscription } from 'rxjs';
import { MatInput } from '@angular/material/input';
import { AbstractMatFormField } from './abstract-mat-form-field';

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
export class CustomInputComponent extends AbstractMatFormField<string> implements OnInit, OnDestroy {
  private control = new FormControl();

  @ViewChild(MatInput, { static: false })
  private input: MatInput;

  private subscription: Subscription;

  constructor(
    @Optional() @Self() ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    _focusMonitor: FocusMonitor,
    _elementRef: ElementRef,
  ) {
    super(
      'app-custom-input',
      ngControl,
      _parentForm,
      _parentFormGroup,
      _defaultErrorStateMatcher,
      _focusMonitor,
      _elementRef,
    );
  }

  public ngOnInit(): void {
    this.subscription = this.control.valueChanges.subscribe(value => {
      super.value = value;
    });
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  public set value(value: string) {
    this.control.setValue(value);
    super.value = value;
  }

  public focus(): void {
    this.input.focus();
  }
}
