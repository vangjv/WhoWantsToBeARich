import { Injectable } from '@angular/core';
import { Observable, Subject, fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SyncEvent, isSyncEvent } from '../models/sync-event.model';

/**
 * Service for cross-window synchronization using BroadcastChannel API
 * Handles all message passing between host and seat displays
 */
@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private readonly CHANNEL_NAME = 'millionaire-game';
  private channel: BroadcastChannel | null = null;
  private messageSubject = new Subject<SyncEvent>();

  /**
   * Observable stream of all incoming sync events
   */
  public readonly messages$: Observable<SyncEvent> = this.messageSubject.asObservable();

  constructor() {
    this.initializeChannel();
  }

  /**
   * Initialize BroadcastChannel with error handling
   * T125: Global error handler for BroadcastChannel failures
   */
  private initializeChannel(): void {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel(this.CHANNEL_NAME);

        // Listen for messages with error handling
        fromEvent<MessageEvent>(this.channel, 'message')
          .pipe(
            map(event => event.data),
            filter(data => isSyncEvent(data))
          )
          .subscribe({
            next: event => {
              this.messageSubject.next(event);
            },
            error: error => {
              // T125: Handle message processing errors
              console.error('[SyncService] Error processing message:', error);
              // Don't rethrow - keep the stream alive
            }
          });

        // T125: Listen for channel errors
        this.channel.addEventListener('messageerror', (event) => {
          console.error('[SyncService] Message deserialization error:', event);
        });

        console.log('[SyncService] BroadcastChannel initialized');
      } else {
        console.error('[SyncService] BroadcastChannel API not supported in this browser');
        // Could implement postMessage fallback here if needed
      }
    } catch (error) {
      console.error('[SyncService] Failed to initialize BroadcastChannel:', error);
      // T125: Application can still function with degraded sync capabilities
    }
  }

  /**
   * Send a sync event to all listening windows
   * T125: Enhanced error handling for send failures
   */
  public sendEvent(type: string, payload: any): void {
    if (!this.channel) {
      console.warn('[SyncService] Cannot send event - channel not initialized');
      return;
    }

    const event: SyncEvent = {
      type,
      payload,
      timestamp: Date.now()
    } as SyncEvent;

    try {
      this.channel.postMessage(event);
      console.log(`[SyncService] Sent event: ${type}`, payload);
    } catch (error) {
      // T125: Handle send errors gracefully
      console.error(`[SyncService] Failed to send event ${type}:`, error);
      if (error instanceof DOMException && error.name === 'DataCloneError') {
        console.error('[SyncService] Payload cannot be cloned. Ensure all data is serializable.');
      }
      // Don't rethrow - allow application to continue
    }
  }

  /**
   * Get observable stream filtered by event type
   */
  public onEvent<T extends SyncEvent>(eventType: T['type']): Observable<T> {
    return this.messages$.pipe(
      filter(event => event.type === eventType)
    ) as Observable<T>;
  }

  /**
   * Check if BroadcastChannel is supported and initialized
   */
  public isChannelAvailable(): boolean {
    return this.channel !== null;
  }

  /**
   * Cleanup on service destruction
   */
  public ngOnDestroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
      console.log('[SyncService] BroadcastChannel closed');
    }
  }
}
