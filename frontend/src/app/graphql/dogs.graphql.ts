import {gql, TypedDocumentNode} from 'apollo-angular';
import {Dog, DogStatus} from "./types";

export const DOGS_QUERY: TypedDocumentNode<GetDogsResult, GetDogsVariables> = gql`
  query Dogs {
    dogs {
      id
      name
      age
      fee
      status
      owner {
        id
        name
        money
      }
    }
  }
`;

export const CREATE_DOG_MUTATION: TypedDocumentNode<CreateDogResult, CreateDogVariables> = gql`
  mutation CreateDog($name: String!, $age: Int!, $ownerId: ID, $fee: Float, $status: DogStatus) {
    createDog(name: $name, age: $age, ownerId: $ownerId, fee: $fee, status: $status) {
      id
      name
      age
      fee
      status
      owner {
        id
        name
      }
    }
  }
`;

interface GetDogsResult {
    dogs: Dog[];
}

type GetDogsVariables = Record<string, never>;

interface CreateDogResult {
    createDog: Dog;
}

interface CreateDogVariables {
    name: string;
    age: number;
    ownerId?: string | null;
    fee?: number | null;
    status?: DogStatus | null;
}
