import {computed, Injectable, signal} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {
    MARK_ALL_NOTIFICATIONS_READ_MUTATION,
    MARK_NOTIFICATION_READ_MUTATION,
    NOTIFICATIONS_BY_OWNER_QUERY,
    NOTIFICATIONS_QUERY
} from '../graphql/notifications.graphql';
import {Notification} from '../graphql/types';

@Injectable({providedIn: 'root'})
export class NotificationsService {
    notifications = signal<Notification[]>([]);
    loading = signal(false);
    error = signal<any>(null);

    unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

    constructor(private apollo: Apollo) {}

    loadNotifications(ownerId?: string) {
        this.loading.set(true);
        if (ownerId) {
            this.apollo.query<{ notificationsByOwnerId: Notification[] }>({
                query: NOTIFICATIONS_BY_OWNER_QUERY,
                variables: {ownerId},
                fetchPolicy: 'network-only'
            }).subscribe({
                next: res => {
                    const raw = res.data?.notificationsByOwnerId ?? [];
                    const sorted = [...raw].sort((a, b) => Number(b.id) - Number(a.id));
                    this.notifications.set(sorted);
                    this.loading.set(false);
                },
                error: err => {
                    this.error.set(err);
                    this.loading.set(false);
                }
            });
            return;
        }

        this.apollo.query<{ notifications: Notification[] }>({
            query: NOTIFICATIONS_QUERY,
            fetchPolicy: 'network-only'
        }).subscribe({
            next: res => {
                const raw = res.data?.notifications ?? [];
                const sorted = [...raw].sort((a, b) => Number(b.id) - Number(a.id));
                this.notifications.set(sorted);
                this.loading.set(false);
            },
            error: err => {
                this.error.set(err);
                this.loading.set(false);
            }
        });
    }

    markAsRead(id: string) {
        return this.apollo.mutate({
            mutation: MARK_NOTIFICATION_READ_MUTATION,
            variables: {id},
            refetchQueries: [NOTIFICATIONS_QUERY]
        });
    }

    markAllAsRead(ownerId: string) {
        return this.apollo.mutate({
            mutation: MARK_ALL_NOTIFICATIONS_READ_MUTATION,
            variables: {ownerId},
            refetchQueries: [NOTIFICATIONS_QUERY]
        });
    }
}
