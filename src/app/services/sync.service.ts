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
   */
  private initializeChannel(): void {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel(this.CHANNEL_NAME);

        // Listen for messages
        fromEvent<MessageEvent>(this.channel, 'message')
          .pipe(
            map(event => event.data),
            filter(data => isSyncEvent(data))
          )
          .subscribe(event => {
            this.messageSubject.next(event);
          });

        console.log('[SyncService] BroadcastChannel initialized');
      } else {
        console.error('[SyncService] BroadcastChannel API not supported');
      }
    } catch (error) {
      console.error('[SyncService] Failed to initialize BroadcastChannel:', error);
    }
  }

  /**
   * Send a sync event to all listening windows
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
      console.error('[SyncService] Failed to send event:', error);
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
