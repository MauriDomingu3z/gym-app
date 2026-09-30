import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-register-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonInput,
    IonButton,
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    name: [''],
  });

  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.errorMessage.set(null);

    const { email, password, name } = this.form.getRawValue();

    // TODO: acá va la llamada a la API para registrar al usuario.
    // 1. Crear AuthService en core/services/auth.service.ts (inyecta HttpClient,
    //    un método register() que haga POST a `${environment.apiUrl}/auth/register`).
    // 2. Inyectarlo acá arriba: private readonly authService = inject(AuthService);
    // 3. Llamar a authService.register({ email, password, name }).subscribe({
    //      next: (authResult) => { ... si sale bien entra acá, por ejemplo navegar a otra pantalla ... },
    //      error: (err) => { ... si sale mal se queda acá, sin redireccionar ... },
    //    });
  }
}
