import {Component, computed, OnInit, signal} from '@angular/core';
import {NotificationsService} from '../service/notifications.service';
import {OwnersService} from '../service/owners.service';

@Component({
    selector: 'app-notifications',
    imports: [],
    template: `
        <div class="notifications-container">
            <div class="header-section">
                <h2>Owner Notifications</h2>
                <p>Real-time in-app notifications delivered via Apache Kafka events.</p>
            </div>

            <div class="controls-bar">
                <div class="owner-filter">
                    <label for="ownerFilterSelect">Owner:</label>
                    <select id="ownerFilterSelect" [value]="selectedOwnerId()" (change)="onOwnerChange($any($event.target).value)">
                        <option value="">All Owners</option>
                        @for (owner of owners(); track owner.id) {
                            <option [value]="owner.id">{{ owner.name }} (#{{ owner.id }})</option>
                        }
                    </select>
                </div>

                <div class="filters-bar">
                    <button class="filter-btn" [class.active]="readFilter() === 'ALL'" (click)="setReadFilter('ALL')">All</button>
                    <button class="filter-btn" [class.active]="readFilter() === 'UNREAD'" (click)="setReadFilter('UNREAD')">Unread</button>
                    <button class="refresh-btn" (click)="refresh()">Refresh</button>
                    @if (selectedOwnerId() && hasUnread()) {
                        <button class="mark-all-btn" (click)="markAllRead()">Mark Owner's All as Read</button>
                    }
                </div>
            </div>

            <div class="result-message-container">
                @if (errorMessage()) {
                    <span class="result-message error">{{ errorMessage() }}</span>
                } @else if (successMessage()) {
                    <span class="result-message">{{ successMessage() }}</span>
                }
            </div>

            @if (loading()) {
                <div class="status-message">Loading notifications...</div>
            }

            @if (filteredNotifications().length === 0 && !loading()) {
                <div class="empty-state">No notifications found.</div>
            } @else if (!loading()) {
                <div class="notifications-list">
                    @for (notification of filteredNotifications(); track notification.id) {
                        <div class="notification-card" [class.unread]="!notification.read">
                            <div class="notification-main">
                                <div class="notification-meta">
                                    <span class="event-badge">{{ formatEventType(notification.eventType) }}</span>
                                    <span class="owner-tag">Owner: <strong>{{ notification.owner.name }}</strong></span>
                                    <span class="timestamp">{{ formatTimestamp(notification.createdAt) }}</span>
                                </div>
                                <p class="notification-message">{{ notification.message }}</p>
                            </div>
                            <div class="notification-actions">
                                @if (!notification.read) {
                                    <button class="mark-read-btn" (click)="markRead(notification.id)">Mark as Read</button>
                                } @else {
                                    <span class="read-status">Read</span>
                                }
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    `,
    styleUrl: './notifications.css'
})
export class Notifications implements OnInit {
    selectedOwnerId = signal<string>('');
    readFilter = signal<'ALL' | 'UNREAD'>('ALL');
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    loading = this.notificationsService.loading;
    notifications = this.notificationsService.notifications;
    owners = this.ownersService.owners;

    filteredNotifications = computed(() => {
        const list = this.notifications();
        if (this.readFilter() === 'UNREAD') {
            return list.filter(n => !n.read);
        }
        return list;
    });

    hasUnread = computed(() => this.filteredNotifications().some(n => !n.read));

    constructor(
        private notificationsService: NotificationsService,
        private ownersService: OwnersService
    ) {}

    ngOnInit() {
        this.ownersService.loadOwners();
        this.notificationsService.loadNotifications();
    }

    onOwnerChange(ownerId: string) {
        this.clearMessages();
        this.selectedOwnerId.set(ownerId);
        this.notificationsService.loadNotifications(ownerId || undefined);
    }

    setReadFilter(filter: 'ALL' | 'UNREAD') {
        this.clearMessages();
        this.readFilter.set(filter);
    }

    refresh() {
        this.clearMessages();
        this.notificationsService.loadNotifications(this.selectedOwnerId() || undefined);
    }

    markRead(id: number) {
        this.clearMessages();
        this.notificationsService.markAsRead(String(id)).subscribe({
            next: () => {
                this.notificationsService.loadNotifications(this.selectedOwnerId() || undefined);
            },
            error: (err: any) => {
                this.errorMessage.set(err.message || 'Failed to mark notification as read.');
            }
        });
    }

    markAllRead() {
        const ownerId = this.selectedOwnerId();
        if (!ownerId) return;
        this.clearMessages();
        this.notificationsService.markAllAsRead(ownerId).subscribe({
            next: () => {
                this.successMessage.set('All notifications for this owner marked as read.');
                this.notificationsService.loadNotifications(ownerId);
            },
            error: (err: any) => {
                this.errorMessage.set(err.message || 'Failed to mark notifications as read.');
            }
        });
    }

    clearMessages() {
        this.successMessage.set(null);
        this.errorMessage.set(null);
    }

    formatEventType(eventType: string): string {
        return eventType.replace(/_/g, ' ');
    }

    formatTimestamp(timestamp?: string): string {
        if (!timestamp) return '—';
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timestamp;
        }
    }
}
