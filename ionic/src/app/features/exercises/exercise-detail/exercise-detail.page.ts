import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  accessibilityOutline,
  barbellOutline,
  bodyOutline,
  heart,
  heartOutline,
  playSkipForwardOutline,
  repeatOutline,
  timeOutline,
} from 'ionicons/icons';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { environment } from '../../../../environments/environment';
import type { Exercise } from '../../../core/models/exercise.model';
import type { WeightUnit } from '../../../core/models/user.model';
import type { WorkoutSet } from '../../../core/models/workout.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ExercisesApiService } from '../../../core/services/exercises/exercises-api.service';
import { FavoritesApiService } from '../../../core/services/favorites/favorites-api.service';
import { WorkoutsApiService } from '../../../core/services/workouts/workouts-api.service';
import { EQUIPMENT_LABELS, MUSCLE_LABELS, TYPE_LABELS, translateLabel } from '../../../shared/i18n/exercise-labels';
import { displayValueToKg, formatWeight, kgToDisplayValue } from '../../../shared/units/weight-unit';

addIcons({
  heart,
  'heart-outline': heartOutline,
  'body-outline': bodyOutline,
  'accessibility-outline': accessibilityOutline,
  'barbell-outline': barbellOutline,
  'repeat-outline': repeatOutline,
  'time-outline': timeOutline,
  'play-skip-forward-outline': playSkipForwardOutline,
});

const TIMED_TYPES = new Set(['duration', 'distance_duration']);

type TrackerPhase = 'idle' | 'active' | 'resting';

@Component({
  selector: 'app-exercise-detail-page',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonImg,
    IonSpinner,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
  ],
  templateUrl: './exercise-detail.page.html',
  styleUrl: './exercise-detail.page.scss',
})
export class ExerciseDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly exercisesApi = inject(ExercisesApiService);
  private readonly workoutsApi = inject(WorkoutsApiService);
  private readonly favoritesApi = inject(FavoritesApiService);
  private readonly authService = inject(AuthService);
  private readonly alertController = inject(AlertController);

  readonly exercise = signal<Exercise | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  readonly isFavorite = signal(false);
  readonly togglingFavorite = signal(false);

  readonly sessionId = signal<string | null>(null);
  readonly workoutExerciseId = signal<string | null>(null);
  readonly loggedSets = signal<WorkoutSet[]>([]);
  readonly lastSet = signal<WorkoutSet | null>(null);

  /** Fase del ciclo de UNA serie: nada corriendo / cargando datos / descansando. */
  readonly trackerPhase = signal<TrackerPhase>('idle');
  /** El usuario marcó este ejercicio como terminado (independiente de trackerPhase). */
  readonly exerciseDone = signal(false);

  readonly elapsedSeconds = signal(0);
  readonly restRemainingSeconds = signal(0);
  readonly weightInput = signal<number | null>(null);
  readonly repsInput = signal<number | null>(null);
  readonly saving = signal(false);

  readonly isTimedExercise = computed(() => TIMED_TYPES.has(this.exercise()?.exerciseType ?? ''));
  readonly showsWeightField = computed(() => {
    const type = this.exercise()?.exerciseType;
    return type === 'weight_reps' || type === 'assisted_bodyweight';
  });
  readonly weightFieldLabel = computed(() =>
    this.exercise()?.exerciseType === 'assisted_bodyweight' ? 'Asistencia' : 'Peso',
  );
  readonly preferredUnit = computed<WeightUnit>(() => this.authService.currentUser()?.preferredUnit ?? 'kg');

  private elapsedIntervalId?: ReturnType<typeof setInterval>;
  private restIntervalId?: ReturnType<typeof setInterval>;

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      void this.load(slug);
    } else {
      this.notFound.set(true);
      this.loading.set(false);
    }

    inject(DestroyRef).onDestroy(() => {
      clearInterval(this.elapsedIntervalId);
      clearInterval(this.restIntervalId);
    });
  }

  frameUrl(path: string): string {
    return `${environment.assetsOrigin}${path}`;
  }

  muscleLabel(muscle: string): string {
    return translateLabel(MUSCLE_LABELS, muscle);
  }

  equipmentLabel(equipment: string): string {
    return translateLabel(EQUIPMENT_LABELS, equipment);
  }

  typeLabel(type: string): string {
    return translateLabel(TYPE_LABELS, type);
  }

  secondaryMusclesLabel(muscles: string[]): string {
    return muscles.map((muscle) => this.muscleLabel(muscle)).join(', ');
  }

  async toggleFavorite(): Promise<void> {
    const exercise = this.exercise();
    if (!exercise || this.togglingFavorite()) return;

    this.togglingFavorite.set(true);
    const wasFavorite = this.isFavorite();
    this.isFavorite.set(!wasFavorite);

    try {
      if (wasFavorite) {
        await firstValueFrom(this.favoritesApi.remove(exercise.id));
      } else {
        await firstValueFrom(this.favoritesApi.add(exercise.id));
      }
    } catch {
      this.isFavorite.set(wasFavorite);
    } finally {
      this.togglingFavorite.set(false);
    }
  }

  formatSetSummary(set: WorkoutSet): string {
    if (this.isTimedExercise()) {
      return `${set.durationSeconds ?? 0}s`;
    }
    const parts: string[] = [];
    if (set.weightKg !== null) {
      parts.push(formatWeight(set.weightKg, this.preferredUnit()));
    }
    if (set.reps !== null) {
      parts.push(`${set.reps} reps`);
    }
    return parts.join(' × ') || '—';
  }

  async startTracking(): Promise<void> {
    const exercise = this.exercise();
    if (!exercise) return;

    if (!this.workoutExerciseId()) {
      let currentSessionId = this.sessionId();
      if (!currentSessionId) {
        const session = await firstValueFrom(this.workoutsApi.startSession());
        currentSessionId = session.id;
        this.sessionId.set(session.id);
      }
      const workoutExercise = await firstValueFrom(
        this.workoutsApi.addExerciseToSession(currentSessionId, exercise.id),
      );
      this.workoutExerciseId.set(workoutExercise.id);
    }

    this.weightInput.set(null);
    this.repsInput.set(null);
    this.trackerPhase.set('active');

    if (this.isTimedExercise()) {
      this.elapsedSeconds.set(0);
      clearInterval(this.elapsedIntervalId);
      this.elapsedIntervalId = setInterval(() => this.elapsedSeconds.update((s) => s + 1), 1000);
    }
  }

  async finishSet(): Promise<void> {
    const workoutExerciseId = this.workoutExerciseId();
    if (!workoutExerciseId) return;

    clearInterval(this.elapsedIntervalId);
    this.saving.set(true);

    try {
      const input = this.isTimedExercise()
        ? { durationSeconds: this.elapsedSeconds() }
        : {
            weightKg:
              this.showsWeightField() && this.weightInput() !== null
                ? displayValueToKg(this.weightInput() as number, this.preferredUnit())
                : undefined,
            reps: this.repsInput() ?? undefined,
          };

      const set = await firstValueFrom(this.workoutsApi.logSet(workoutExerciseId, input));
      this.loggedSets.update((sets) => [...sets, set]);
      this.lastSet.set(set);
      this.startRest();
    } finally {
      this.saving.set(false);
    }
  }

  onWeightInput(value: string | number | null | undefined): void {
    const num = Number(value);
    this.weightInput.set(value && !Number.isNaN(num) ? num : null);
  }

  onRepsInput(value: string | number | null | undefined): void {
    const num = Number(value);
    this.repsInput.set(value && !Number.isNaN(num) ? num : null);
  }

  /** Cambia la unidad preferida (persiste en el perfil) y convierte el peso ya cargado para no perderlo. */
  async setPreferredUnit(unit: WeightUnit): Promise<void> {
    const current = this.preferredUnit();
    if (unit === current) return;

    const enteredWeight = this.weightInput();
    if (enteredWeight !== null) {
      const weightKg = displayValueToKg(enteredWeight, current);
      this.weightInput.set(kgToDisplayValue(weightKg, unit));
    }

    await this.authService.updatePreferredUnit(unit);
  }

  skipRest(): void {
    clearInterval(this.restIntervalId);
    this.trackerPhase.set('idle');
  }

  /** Marca el ejercicio como terminado para hoy — no borra el registro, solo cambia la vista a un resumen. */
  finishExercise(): void {
    clearInterval(this.elapsedIntervalId);
    clearInterval(this.restIntervalId);
    this.trackerPhase.set('idle');
    this.exerciseDone.set(true);
  }

  /** Reabre el registro por si el usuario quiere sumar una serie más (reusa el mismo workoutExerciseId, no crea uno nuevo). */
  resumeExercise(): void {
    this.exerciseDone.set(false);
  }

  async confirmFinishWorkout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Finalizar entrenamiento',
      message: 'Esto termina toda la sesión de hoy, no solo este ejercicio. ¿Confirmás?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Finalizar', role: 'confirm', handler: () => void this.finishWorkout() },
      ],
    });
    await alert.present();
  }

  private async finishWorkout(): Promise<void> {
    const sessionId = this.sessionId();
    if (!sessionId) return;
    await firstValueFrom(this.workoutsApi.finishSession(sessionId));
    this.sessionId.set(null);
    this.workoutExerciseId.set(null);
    this.trackerPhase.set('idle');
    this.exerciseDone.set(false);
  }

  private startRest(): void {
    this.trackerPhase.set('resting');
    this.restRemainingSeconds.set(this.exercise()?.defaultRestSeconds ?? 90);
    clearInterval(this.restIntervalId);
    this.restIntervalId = setInterval(() => {
      const remaining = this.restRemainingSeconds() - 1;
      if (remaining <= 0) {
        clearInterval(this.restIntervalId);
        this.trackerPhase.set('idle');
        this.restRemainingSeconds.set(0);
      } else {
        this.restRemainingSeconds.set(remaining);
      }
    }, 1000);
  }

  private async load(slug: string): Promise<void> {
    this.loading.set(true);
    try {
      const exercise = await firstValueFrom(this.exercisesApi.getBySlug(slug));
      this.exercise.set(exercise);

      const [lastSet, activeSession, favoriteStatus] = await Promise.all([
        firstValueFrom(this.workoutsApi.getLastSet(exercise.id)),
        firstValueFrom(this.workoutsApi.getActiveSession()),
        firstValueFrom(this.favoritesApi.checkStatus(exercise.id)),
      ]);
      this.lastSet.set(lastSet);
      this.isFavorite.set(favoriteStatus.isFavorite);

      if (activeSession) {
        this.sessionId.set(activeSession.id);
        const existing = activeSession.exercises.find((we) => we.exerciseId === exercise.id);
        if (existing) {
          this.workoutExerciseId.set(existing.id);
          this.loggedSets.set(existing.sets);
        }
      }
    } catch {
      this.notFound.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
