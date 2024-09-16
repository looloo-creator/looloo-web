import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  get(endPoint: string) {
    return this.http.get(endPoint);
  }
  post(endPoint: string, data: Object): Observable<Object> {
    return this.http.post(endPoint, data);
  }
}
