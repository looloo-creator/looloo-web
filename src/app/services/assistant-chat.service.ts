import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth/auth.service';

export interface AssistantChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export interface AssistantHistoryResponse {
  conversationId: string;
  history: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }>;
}

@Injectable({ providedIn: 'root' })
export class AssistantChatService {
  private readonly baseUrl = environment.chatbotApiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient, private authService: AuthService) {}

  sendMessage(conversationId: string, message: string): Observable<AssistantChatResponse> {
    return this.http.post<AssistantChatResponse>(
      `${this.baseUrl}/chat/message`,
      { conversationId, message },
      { headers: this.authHeaders() },
    );
  }

  getHistory(conversationId: string): Observable<AssistantHistoryResponse> {
    const params = new HttpParams().set('conversationId', conversationId);
    return this.http.get<AssistantHistoryResponse>(`${this.baseUrl}/chat/history`, {
      headers: this.authHeaders(),
      params,
    });
  }

  clearHistory(conversationId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/chat/clear`,
      { conversationId },
      { headers: this.authHeaders() },
    );
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
