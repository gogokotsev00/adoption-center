import { Injectable, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CREATE_DOG_MUTATION, DOGS_QUERY } from '../graphql/dogs.graphql';
import { Dog } from '../graphql/types';

@Injectable({ providedIn: 'root' })
export class DogsService {
    dogs = signal<Dog[]>([]);
    loading = signal(true);
    error = signal<any>(null);

    constructor(private apollo: Apollo) {}

    loadDogs() {
        this.apollo.query<{ dogs: Dog[] }>({
            query: DOGS_QUERY,
            fetchPolicy: 'network-only'
        }).subscribe({
            next: res => {
                const rawDogs = res.data?.dogs ?? [];
                const sorted = [...rawDogs].sort((a, b) => Number(a.id) - Number(b.id));
                this.dogs.set(sorted);
                this.loading.set(false);
            },
            error: err => this.error.set(err)
        });
    }

    addDog(name: string, age: number, fee?: number | null) {
        return this.apollo.mutate({
            mutation: CREATE_DOG_MUTATION,
            variables: {
                name,
                age,
                fee: fee != null ? fee : 0,
                status: 'AVAILABLE'
            },
            refetchQueries: [DOGS_QUERY],
        });
    }
}
