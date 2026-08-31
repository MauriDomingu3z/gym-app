import { Component, input } from '@angular/core';
import { IonText } from '@ionic/angular';
import type { Attribution } from '../../../../core/models/attribution.model';

@Component({
  selector: 'app-attribution-footer',
  standalone: true,
  imports: [IonText],
  templateUrl: './attribution-footer.component.html',
})
export class AttributionFooterComponent {
  readonly attribution = input<Attribution | null>(null);
}
