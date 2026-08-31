import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { flash } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth/auth.service';
import {
  RegisterFormComponent,
  type RegisterFormValue,
} from '../../../shared/components/organisms/register-form/register-form.component';

addIcons({ flash });

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [IonContent, IonIcon, RegisterFormComponent, RouterLink],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async onSubmit(value: RegisterFormValue): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.register(value.email, value.password, value.name || undefined);
      await this.router.navigateByUrl('/exercises', { replaceUrl: true });
    } catch {
      this.errorMessage.set('No se pudo crear la cuenta. ¿Ya existe ese email?');
    } finally {
      this.loading.set(false);
    }
  }
}
