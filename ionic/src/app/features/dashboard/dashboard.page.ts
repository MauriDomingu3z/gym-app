import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AlertController,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import type { DashboardSummary } from '../../core/models/workout.model';
import { AuthService } from '../../core/services/auth/auth.service';
import { WorkoutsApiService } from '../../core/services/workouts/workouts-api.service';
import { BottomNavComponent } from '../../shared/components/organisms/bottom-nav/bottom-nav.component';

addIcons({ 'log-out-outline': logOutOutline });

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonContent,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    BottomNavComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  private readonly workoutsApi = inject(WorkoutsApiService);
  private readonly authService = inject(AuthService);
  private readonly alertController = inject(AlertController);
  private readonly router = inject(Router);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);

  readonly greetingName = computed(() => this.authService.currentUser()?.name?.split(' ')[0] ?? 'Atleta');
  readonly initials = computed(() => {
    const user = this.authService.currentUser();
    const source = user?.name?.trim() || user?.email || '?';
    return source.charAt(0).toUpperCase();
  });

  constructor() {
    void this.load();
  }

  formatSessionDate(iso: string): string {
    return new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric', month: 'short' }).format(
      new Date(iso),
    );
  }

  async confirmLogout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Seguro que querés salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cerrar sesión', role: 'destructive', handler: () => void this.logout() },
      ],
    });
    await alert.present();
  }

  private async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const summary = await firstValueFrom(this.workoutsApi.getDashboard());
      this.summary.set(summary);
    } finally {
      this.loading.set(false);
    }
  }
}
