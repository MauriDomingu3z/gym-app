import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonIcon, IonInput, IonItem, IonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForward, lockClosedOutline, mailOutline, personOutline } from 'ionicons/icons';

export interface RegisterFormValue {
  email: string;
  password: string;
  name: string;
}

addIcons({
  'person-outline': personOutline,
  'mail-outline': mailOutline,
  'lock-closed-outline': lockClosedOutline,
  'arrow-forward': arrowForward,
});

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, IonButton, IonIcon, IonInput, IonItem, IonText],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
})
export class RegisterFormComponent {
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly submitted = output<RegisterFormValue>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}
