import { Component, input, output } from '@angular/core';
import type { Exercise } from '../../../../core/models/exercise.model';
import { ExerciseCardComponent } from '../../molecules/exercise-card/exercise-card.component';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [ExerciseCardComponent],
  templateUrl: './exercise-list.component.html',
  styleUrl: './exercise-list.component.scss',
})
export class ExerciseListComponent {
  readonly exercises = input<Exercise[]>([]);
  readonly exerciseSelected = output<Exercise>();
}
