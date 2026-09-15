import {Injectable, signal} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {
    CREATE_OWNER_MUTATION,
    DELETE_OWNER_MUTATION,
    OWNERS_QUERY,
    UPDATE_OWNER_MONEY_MUTATION
} from '../graphql/owner.graphql';
import {Owner} from '../graphql/types';

@Injectable({ providedIn: 'root' })
export class OwnersService {
    owners = signal<Owner[]>([]);
    loading = signal(true);
    error = signal<any>(null);

    constructor(private apollo: Apollo) {}

    loadOwners() {
        this.apollo.query<{ owners: Owner[] }>({
            query: OWNERS_QUERY,
            fetchPolicy: 'network-only'
        }).subscribe({
            next: res => {
                const rawOwners = res.data?.owners ?? [];
                const sorted = [...rawOwners].sort((a, b) => Number(a.id) - Number(b.id));
                this.owners.set(sorted);
                this.loading.set(false);
            },
            error: err => this.error.set(err)
        });
    }

    createOwner(name: string, money: number) {
        return this.apollo.mutate({
            mutation: CREATE_OWNER_MUTATION,
            variables: { name, money }
        });
    }

    deleteOwner(id: number | string) {
        return this.apollo.mutate({
            mutation: DELETE_OWNER_MUTATION,
            variables: { id: String(id) }
        });
    }

    updateOwnerMoney(id: number | string, money: number) {
        return this.apollo.mutate({
            mutation: UPDATE_OWNER_MONEY_MUTATION,
            variables: { id: String(id), money }
        });
    }
}
