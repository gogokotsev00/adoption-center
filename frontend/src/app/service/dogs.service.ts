import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CREATE_DOG_MUTATION } from '../graphql/dogs.graphql';
import { OWNERS_QUERY } from "../graphql/owner.graphql";

@Injectable({ providedIn: 'root' })
export class DogsService {

    constructor(private apollo: Apollo) {}

    addDog(name: string, age: number, ownerId: string) {
        return this.apollo.mutate({
            mutation: CREATE_DOG_MUTATION,
            variables: { name, age, ownerId },
            refetchQueries: [OWNERS_QUERY],
        });
    }
}

