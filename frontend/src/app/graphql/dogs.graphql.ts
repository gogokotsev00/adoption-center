import {gql, TypedDocumentNode} from 'apollo-angular';
import {Dog} from "./types";

export const DOGS_QUERY: TypedDocumentNode<GetDogsResult, GetDogsVariables> = gql`
  query Dogs {
    dogs {
      id
      name
      age
      owner {
        name
      }
    }
  }
`;

export const CREATE_DOG_MUTATION: TypedDocumentNode<CreateDogResult, CreateDogVariables> = gql`
  mutation CreateDog($name: String!, $age: Int!, $ownerId: ID!) {
    createDog(name: $name, age: $age, ownerId: $ownerId) {
      id
      name
      age
      owner {
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
    ownerId: string;
}
