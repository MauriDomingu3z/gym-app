import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home-page',
  imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButton],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
