import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Attribution } from '../../models/attribution.model';

@Injectable({ providedIn: 'root' })
export class AttributionApiService {
  private readonly http = inject(HttpClient);

  get(): Observable<Attribution> {
    return this.http.get<Attribution>(`${environment.apiBaseUrl}/attribution`);
  }
}
