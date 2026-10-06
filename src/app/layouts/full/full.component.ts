import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { ChatConversation, ChatMessage } from '@looloo/assistant';
import { AuthService } from 'src/app/services/auth/auth.service';
import { AssistantChatService } from 'src/app/services/assistant-chat.service';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';

interface StoredAssistantConversation extends ChatConversation {
  messages: ChatMessage[];
}

@Component({
    selector: 'app-full',
    templateUrl: './full.component.html',
    styleUrls: ['./full.component.scss'],
    standalone: false
})
export class FullComponent implements OnInit {

  assistantOpen = false;
  assistantMessages: ChatMessage[] = [];
  assistantHistory: ChatConversation[] = [];
  activeConversationId: string | null = null;
  assistantLoading = false;
  private storedConversations: StoredAssistantConversation[] = [];
  private storageKey = 'looloo.assistant.conversations';

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav;

  //get options from service
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;
  loader: boolean = false;
  get isOver(): boolean {
    return this.isMobileScreen;
  }

  constructor(
    private breakpointObserver: BreakpointObserver,
    private assistantChatService: AssistantChatService,
    private authService: AuthService,
  ) {
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes

        this.isMobileScreen = state.breakpoints[MOBILE_VIEW];

        this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
      });
  }

  ngOnInit(): void {
    this.storageKey = this.getStorageKey();
    this.restoreConversations();
  }

  toggleAssistant(): void {
    this.assistantOpen = !this.assistantOpen;
  }

  startAssistantConversation(): void {
    this.assistantMessages = [];
    this.activeConversationId = null;
  }

  selectAssistantConversation(conversation: ChatConversation): void {
    const savedConversation = this.storedConversations.find((item) => item.id === conversation.id);
    if (!savedConversation) return;
    this.activeConversationId = savedConversation.id;
    this.assistantMessages = [...savedConversation.messages];
  }

  onAssistantMessage(prompt: string): void {
    if (this.assistantLoading || !prompt.trim()) return;

    let conversation = this.storedConversations.find((item) => item.id === this.activeConversationId);
    if (!conversation) {
      conversation = {
        id: crypto.randomUUID(),
        title: prompt.trim().slice(0, 48),
        updatedAt: this.formatConversationTime(new Date()),
        messages: [],
      };
      this.storedConversations.unshift(conversation);
      this.storedConversations = this.storedConversations.slice(0, 20);
      this.activeConversationId = conversation.id;
    }

    const pendingId = crypto.randomUUID();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt.trim(),
      time: this.formatConversationTime(new Date()),
    };
    const pendingMessage: ChatMessage = {
      id: pendingId,
      role: 'assistant',
      content: 'Thinking…',
      author: 'Looloo Assistant',
    };

    conversation.messages = [...conversation.messages, userMessage, pendingMessage];
    this.assistantMessages = [...conversation.messages];
    this.refreshConversationHistory();
    this.saveConversations();
    this.assistantLoading = true;

    this.assistantChatService.sendMessage(conversation.id, prompt.trim()).subscribe({
      next: (result) => {
        const response = result.success && result.response
          ? result.response
          : result.error || 'The assistant could not generate a response. Please try again.';
        this.finishAssistantResponse(conversation!, pendingId, response);
      },
      error: (error) => {
        const errorMessage = error.status === 401
          ? 'The assistant could not validate your session. Restart chatbot-api with the latest build; if this continues, confirm both services use the same JWT_SECRET_KEY.'
          : error.status === 503
            ? 'Assistant authentication is not configured. Set JWT_SECRET_KEY in chatbot-api to match looloo-api.'
            : 'I could not reach the assistant service. Please check that chatbot-api and Ollama are running.';
        this.finishAssistantResponse(conversation!, pendingId, errorMessage);
      },
    });
  }

  private finishAssistantResponse(
    conversation: StoredAssistantConversation,
    pendingId: string,
    response: string,
  ): void {
    conversation.messages = conversation.messages.map((message) =>
      message.id === pendingId
        ? { ...message, content: response, time: this.formatConversationTime(new Date()) }
        : message,
    );
    conversation.updatedAt = this.formatConversationTime(new Date());
    if (this.activeConversationId === conversation.id) {
      this.assistantMessages = [...conversation.messages];
    }
    this.assistantLoading = false;
    this.refreshConversationHistory();
    this.saveConversations();
  }

  private restoreConversations(): void {
    try {
      this.storedConversations = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      if (!Array.isArray(this.storedConversations)) this.storedConversations = [];
    } catch {
      this.storedConversations = [];
    }
    this.refreshConversationHistory();
    const recentConversation = this.storedConversations[0];
    if (recentConversation) this.selectAssistantConversation(recentConversation);
  }

  private refreshConversationHistory(): void {
    this.assistantHistory = this.storedConversations.map(({ id, title, updatedAt }) => ({
      id,
      title,
      updatedAt,
    }));
  }

  private saveConversations(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.storedConversations));
    } catch {
      // Keep the active chat usable if browser storage is unavailable or full.
    }
  }

  private getStorageKey(): string {
    const token = this.authService.getToken();
    try {
      const encodedPayload = token?.split('.')[1];
      if (encodedPayload) {
        const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
        const userId = payload.user_id ?? payload.id;
        if (userId !== undefined && userId !== null) {
          return `looloo.assistant.conversations.${String(userId)}`;
        }
      }
    } catch {
      // Use the default key if this token does not contain a readable user ID.
    }
    return 'looloo.assistant.conversations';
  }

  private formatConversationTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
  }
  showLoader = () => {
    this.loader = true;
  }
  hideLoader = () => {
    this.loader = false;
  }
}
