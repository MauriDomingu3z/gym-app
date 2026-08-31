import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AlertController, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import type { Exercise } from '../../core/models/exercise.model';
import { AuthService } from '../../core/services/auth/auth.service';
import { FavoritesApiService } from '../../core/services/favorites/favorites-api.service';
import { ExerciseListComponent } from '../../shared/components/organisms/exercise-list/exercise-list.component';
import { BottomNavComponent } from '../../shared/components/organisms/bottom-nav/bottom-nav.component';

addIcons({ 'log-out-outline': logOutOutline });

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSpinner,
    ExerciseListComponent,
    BottomNavComponent,
  ],
  templateUrl: './favorites.page.html',
  styleUrl: './favorites.page.scss',
})
export class FavoritesPage {
  private readonly favoritesApi = inject(FavoritesApiService);
  private readonly authService = inject(AuthService);
  private readonly alertController = inject(AlertController);
  private readonly router = inject(Router);

  readonly favorites = signal<Exercise[]>([]);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  onExerciseSelected(exercise: Exercise): void {
    void this.router.navigate(['/exercises', exercise.slug]);
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
      const favorites = await firstValueFrom(this.favoritesApi.list());
      this.favorites.set(favorites);
    } finally {
      this.loading.set(false);
    }
  }
}
