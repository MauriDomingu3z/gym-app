import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonIcon, IonInput, IonItem, IonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForward, lockClosedOutline, mailOutline } from 'ionicons/icons';

export interface LoginFormValue {
  email: string;
  password: string;
}

addIcons({ 'mail-outline': mailOutline, 'lock-closed-outline': lockClosedOutline, 'arrow-forward': arrowForward });

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, IonButton, IonIcon, IonInput, IonItem, IonText],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly submitted = output<LoginFormValue>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}
