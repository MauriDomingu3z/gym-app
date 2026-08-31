import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { flash } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth/auth.service';
import {
  LoginFormComponent,
  type LoginFormValue,
} from '../../../shared/components/organisms/login-form/login-form.component';

addIcons({ flash });

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [IonContent, IonIcon, LoginFormComponent, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async onSubmit(value: LoginFormValue): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.login(value.email, value.password);
      await this.router.navigateByUrl('/exercises', { replaceUrl: true });
    } catch {
      this.errorMessage.set('Email o contraseña inválidos');
    } finally {
      this.loading.set(false);
    }
  }
}
