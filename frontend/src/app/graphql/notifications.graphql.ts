import {gql, TypedDocumentNode} from 'apollo-angular';
import {Notification} from './types';

export const NOTIFICATIONS_QUERY: TypedDocumentNode<GetNotificationsResult, Record<string, never>> = gql`
  query Notifications {
    notifications {
      id
      eventType
      message
      read
      createdAt
      owner {
        id
        name
        money
      }
    }
  }
`;

export const NOTIFICATIONS_BY_OWNER_QUERY: TypedDocumentNode<GetNotificationsByOwnerResult, NotificationsByOwnerVariables> = gql`
  query NotificationsByOwnerId($ownerId: ID!) {
    notificationsByOwnerId(ownerId: $ownerId) {
      id
      eventType
      message
      read
      createdAt
      owner {
        id
        name
        money
      }
    }
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION: TypedDocumentNode<MarkNotificationReadResult, MarkNotificationReadVariables> = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION: TypedDocumentNode<MarkAllNotificationsReadResult, NotificationsByOwnerVariables> = gql`
  mutation MarkAllNotificationsAsRead($ownerId: ID!) {
    markAllNotificationsAsRead(ownerId: $ownerId) {
      id
      read
    }
  }
`;

interface GetNotificationsResult {
  notifications: Notification[];
}

interface GetNotificationsByOwnerResult {
  notificationsByOwnerId: Notification[];
}

interface NotificationsByOwnerVariables {
  ownerId: string;
}

interface MarkNotificationReadResult {
  markNotificationAsRead: Notification;
}

interface MarkNotificationReadVariables {
  id: string;
}

interface MarkAllNotificationsReadResult {
  markAllNotificationsAsRead: Notification[];
}
