import { AfterContentInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { merge, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'material-app',
  templateUrl: 'app.component.html',
  styleUrls: [ 'app.component.scss' ],
})
export class AppComponent implements OnInit, AfterContentInit, OnDestroy {
  state$: Observable<{}>;
  submit$ = new Subject<void>();

  form = this.fb.group({
    standard: [ '' ],
    custom: [ '' ],
    requiredStandard: [ '', Validators.required ],
    requiredCustom: [ '', Validators.required ],
    emailStandard: [ '', Validators.email ],
    emailCustom: [ '', Validators.email ],
  });

  @ViewChild('submitButton', { static: false, read: ElementRef })
  submitButton: ElementRef;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.state$ = merge(this.form.valueChanges, this.submit$).pipe(map(() => this.buildFormState()));
  }

  ngAfterContentInit() {
    // setTimeout(() => {
    //   (this.submitButton.nativeElement as HTMLButtonElement).click();
    // }, 500);
  }

  ngOnDestroy() {
    this.submit$.complete();
  }

  onSubmit() {
    console.log('onSubmit');
    this.submit$.next();
  }

  private buildFormState() {
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
      'emailStandard',
      'emailCustom',
    ].map(field => ({
      name: field,
      valid: this.form.get(field).valid,
      value: this.form.get(field).value,
    }));

    const formState = [ form, ...fields ].reduce(
      (acc, { name, ...meta }) => ({
        ...acc,
        [name]: meta,
      }),
      {},
    );

    console.table(formState);
    return formState;
  }
}
