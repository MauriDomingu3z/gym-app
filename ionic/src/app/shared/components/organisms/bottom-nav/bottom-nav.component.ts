import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { barbellOutline, heartOutline, statsChartOutline } from 'ionicons/icons';

addIcons({ 'stats-chart-outline': statsChartOutline, 'heart-outline': heartOutline, 'barbell-outline': barbellOutline });

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonIcon],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {}
