import {
  Component,
  ElementRef,
  AfterContentInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'material-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterContentInit {
  state = new BehaviorSubject({});

  form = this.fb.group({
    standard: [''],
    custom: [''],
    requiredStandard: ['', Validators.required],
    requiredCustom: ['', Validators.required],
  });

  @ViewChild('submitButton', { static: false, read: ElementRef })
  submitButton: ElementRef;

  constructor(private fb: FormBuilder) {}

  ngAfterContentInit() {
    setTimeout(() => {
      (this.submitButton.nativeElement as HTMLButtonElement).click();
    }, 500);
  }

  onSubmit() {
    console.log('onSubmit');

    const form = {
      name: 'form',
      valid: this.form.valid,
      value: this.form.value,
    };
    const fields = [
      'standard',
      'custom',
      'requiredStandard',
      'requiredCustom',
    ].map(field => ({
      name: field,
      valid: this.form.get(field).valid,
      value: this.form.get(field).value,
    }));

    console.table([form, ...fields]);
    this.state.next(
      [form, ...fields].reduce(
        (acc, { name, ...meta }) => ({
          ...acc,
          [name]: meta,
        }),
        {},
      ),
    );
  }
}
