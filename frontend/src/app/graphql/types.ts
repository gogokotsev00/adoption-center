export type Owner = {
    readonly id: number;
    name: string;
    money?: number;
};

export type DogStatus = 'AVAILABLE' | 'PENDING' | 'ADOPTED';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type NotificationEventType = 'DOG_PURCHASE_COMPLETED';

export type Dog = {
    readonly id: number;
    name: string;
    age: number;
    fee: number;
    status: DogStatus;
    owner?: Owner | null;
};

export type AdoptionApplication = {
    readonly id: number;
    owner: Owner;
    dog: Dog;
    status: ApplicationStatus;
    createdAt?: string;
};

export type Notification = {
    readonly id: number;
    owner: Owner;
    eventType: NotificationEventType;
    message: string;
    read: boolean;
    createdAt?: string;
};
