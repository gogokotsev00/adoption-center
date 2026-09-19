import {Injectable, signal} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {
    APPLICATIONS_QUERY,
    APPROVE_APPLICATION_MUTATION,
    CREATE_APPLICATION_MUTATION,
    REJECT_APPLICATION_MUTATION
} from '../graphql/applications.graphql';
import {DOGS_QUERY} from '../graphql/dogs.graphql';
import {OWNERS_QUERY} from '../graphql/owner.graphql';
import {AdoptionApplication} from '../graphql/types';

@Injectable({providedIn: 'root'})
export class ApplicationsService {
    applications = signal<AdoptionApplication[]>([]);
    loading = signal(false);
    error = signal<any>(null);

    constructor(private apollo: Apollo) {}

    loadApplications() {
        this.loading.set(true);
        this.apollo.query<{ applications: AdoptionApplication[] }>({
            query: APPLICATIONS_QUERY,
            fetchPolicy: 'network-only'
        }).subscribe({
            next: res => {
                const raw = res.data?.applications ?? [];
                const sorted = [...raw].sort((a, b) => Number(b.id) - Number(a.id));
                this.applications.set(sorted);
                this.loading.set(false);
            },
            error: err => {
                this.error.set(err);
                this.loading.set(false);
            }
        });
    }

    createApplication(ownerId: string, dogId: string) {
        return this.apollo.mutate({
            mutation: CREATE_APPLICATION_MUTATION,
            variables: {ownerId, dogId},
            refetchQueries: [APPLICATIONS_QUERY, DOGS_QUERY]
        });
    }

    approveApplication(id: string) {
        return this.apollo.mutate({
            mutation: APPROVE_APPLICATION_MUTATION,
            variables: {id},
            refetchQueries: [APPLICATIONS_QUERY, DOGS_QUERY, OWNERS_QUERY]
        });
    }

    rejectApplication(id: string) {
        return this.apollo.mutate({
            mutation: REJECT_APPLICATION_MUTATION,
            variables: {id},
            refetchQueries: [APPLICATIONS_QUERY, DOGS_QUERY]
        });
    }
}
