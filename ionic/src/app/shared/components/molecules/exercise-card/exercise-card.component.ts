import { Component, computed, input, output } from '@angular/core';
import { IonImg } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import type { Exercise } from '../../../../core/models/exercise.model';
import { MUSCLE_LABELS, translateLabel } from '../../../i18n/exercise-labels';

@Component({
  selector: 'app-exercise-card',
  standalone: true,
  imports: [IonImg],
  templateUrl: './exercise-card.component.html',
  styleUrl: './exercise-card.component.scss',
})
export class ExerciseCardComponent {
  readonly exercise = input.required<Exercise>();
  readonly selected = output<Exercise>();

  readonly thumbnailUrl = computed(() => {
    const frame = this.exercise().frames[0];
    return frame ? `${environment.assetsOrigin}${frame}` : '';
  });

  readonly muscleLabel = computed(() => translateLabel(MUSCLE_LABELS, this.exercise().primaryMuscle));

  /** Alterna el tono del badge según el músculo, para que la grilla no sea monocorde. */
  readonly badgeTone = computed<'primary' | 'secondary'>(() =>
    this.exercise().primaryMuscle.length % 2 === 0 ? 'secondary' : 'primary',
  );

  onSelect(): void {
    this.selected.emit(this.exercise());
  }
}
