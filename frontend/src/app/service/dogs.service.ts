import { Injectable, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CREATE_DOG_MUTATION, DOGS_QUERY } from '../graphql/dogs.graphql';
import { OWNERS_QUERY } from "../graphql/owner.graphql";
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

    addDog(name: string, age: number, ownerId: string) {
        return this.apollo.mutate({
            mutation: CREATE_DOG_MUTATION,
            variables: { name, age, ownerId },
            refetchQueries: [OWNERS_QUERY, DOGS_QUERY],
        });
    }
}
