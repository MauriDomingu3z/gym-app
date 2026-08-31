import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { barbellOutline, closeCircle, closeOutline, logOutOutline, optionsOutline } from 'ionicons/icons';
import {
  AlertController,
  IonBadge,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import type { Attribution } from '../../../core/models/attribution.model';
import type { Exercise, ExerciseFilterOptions } from '../../../core/models/exercise.model';
import { AttributionApiService } from '../../../core/services/attribution/attribution-api.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ExercisesApiService } from '../../../core/services/exercises/exercises-api.service';
import { AttributionFooterComponent } from '../../../shared/components/organisms/attribution-footer/attribution-footer.component';
import { BottomNavComponent } from '../../../shared/components/organisms/bottom-nav/bottom-nav.component';
import { ExerciseListComponent } from '../../../shared/components/organisms/exercise-list/exercise-list.component';
import { EQUIPMENT_LABELS, MUSCLE_LABELS, TYPE_LABELS, translateLabel } from '../../../shared/i18n/exercise-labels';

addIcons({
  'options-outline': optionsOutline,
  'close-circle': closeCircle,
  'close-outline': closeOutline,
  'log-out-outline': logOutOutline,
  'barbell-outline': barbellOutline,
});

const PAGE_SIZE = 20;

type FilterKey = 'muscle' | 'equipment' | 'type';

@Component({
  selector: 'app-exercise-catalog-page',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonBadge,
    IonIcon,
    IonChip,
    IonLabel,
    IonContent,
    IonSearchbar,
    IonSpinner,
    IonModal,
    IonSelect,
    IonSelectOption,
    ExerciseListComponent,
    AttributionFooterComponent,
    BottomNavComponent,
  ],
  templateUrl: './exercise-catalog.page.html',
  styleUrl: './exercise-catalog.page.scss',
})
export class ExerciseCatalogPage {
  private readonly exercisesApi = inject(ExercisesApiService);
  private readonly attributionApi = inject(AttributionApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);

  readonly exercises = signal<Exercise[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loading = signal(false);
  readonly filterOptions = signal<ExerciseFilterOptions>({ equipment: [], muscles: [], types: [] });
  readonly attribution = signal<Attribution | null>(null);
  readonly isFilterModalOpen = signal(false);

  readonly selectedMuscle = signal<string | null>(null);
  readonly selectedEquipment = signal<string | null>(null);
  readonly selectedType = signal<string | null>(null);
  readonly search = signal('');

  readonly hasMore = computed(() => this.exercises().length < this.total());

  readonly sortedMuscleOptions = computed(() => this.sortByLabel(this.filterOptions().muscles, MUSCLE_LABELS));
  readonly sortedEquipmentOptions = computed(() => this.sortByLabel(this.filterOptions().equipment, EQUIPMENT_LABELS));
  readonly sortedTypeOptions = computed(() => this.sortByLabel(this.filterOptions().types, TYPE_LABELS));

  readonly activeFilters = computed(() => {
    const filters: { key: FilterKey; label: string }[] = [];
    const muscle = this.selectedMuscle();
    const equipment = this.selectedEquipment();
    const type = this.selectedType();
    if (muscle) filters.push({ key: 'muscle', label: translateLabel(MUSCLE_LABELS, muscle) });
    if (equipment) filters.push({ key: 'equipment', label: translateLabel(EQUIPMENT_LABELS, equipment) });
    if (type) filters.push({ key: 'type', label: translateLabel(TYPE_LABELS, type) });
    return filters;
  });

  constructor() {
    void this.loadFilters();
    void this.loadAttribution();
    void this.loadExercises(1, false);
  }

  onMuscleChanged(muscle: string | null): void {
    this.selectedMuscle.set(muscle);
    void this.loadExercises(1, false);
  }

  onEquipmentChanged(equipment: string | null): void {
    this.selectedEquipment.set(equipment);
    void this.loadExercises(1, false);
  }

  onTypeChanged(type: string | null): void {
    this.selectedType.set(type);
    void this.loadExercises(1, false);
  }

  onSearchChanged(value: string): void {
    this.search.set(value);
    void this.loadExercises(1, false);
  }

  onLoadMore(): void {
    void this.loadExercises(this.page() + 1, true);
  }

  onExerciseSelected(exercise: Exercise): void {
    void this.router.navigate(['/exercises', exercise.slug]);
  }

  openFilters(): void {
    this.isFilterModalOpen.set(true);
  }

  closeFilters(): void {
    this.isFilterModalOpen.set(false);
  }

  clearFilter(key: FilterKey): void {
    if (key === 'muscle') this.onMuscleChanged(null);
    if (key === 'equipment') this.onEquipmentChanged(null);
    if (key === 'type') this.onTypeChanged(null);
  }

  muscleLabel(value: string): string {
    return translateLabel(MUSCLE_LABELS, value);
  }

  equipmentLabel(value: string): string {
    return translateLabel(EQUIPMENT_LABELS, value);
  }

  typeLabel(value: string): string {
    return translateLabel(TYPE_LABELS, value);
  }

  clearAllFilters(): void {
    this.selectedMuscle.set(null);
    this.selectedEquipment.set(null);
    this.selectedType.set(null);
    void this.loadExercises(1, false);
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

  private sortByLabel(values: string[], labels: Record<string, string>): string[] {
    return [...values].sort((a, b) =>
      translateLabel(labels, a).localeCompare(translateLabel(labels, b), 'es'),
    );
  }

  private async loadFilters(): Promise<void> {
    const options = await firstValueFrom(this.exercisesApi.filters());
    this.filterOptions.set(options);
  }

  private async loadAttribution(): Promise<void> {
    const attribution = await firstValueFrom(this.attributionApi.get());
    this.attribution.set(attribution);
  }

  private async loadExercises(page: number, append: boolean): Promise<void> {
    this.loading.set(true);
    try {
      const result = await firstValueFrom(
        this.exercisesApi.list({
          muscle: this.selectedMuscle() ?? undefined,
          equipment: this.selectedEquipment() ?? undefined,
          type: this.selectedType() ?? undefined,
          search: this.search() || undefined,
          page,
          limit: PAGE_SIZE,
        }),
      );
      this.exercises.set(append ? [...this.exercises(), ...result.items] : result.items);
      this.total.set(result.total);
      this.page.set(result.page);
    } finally {
      this.loading.set(false);
    }
  }
}
