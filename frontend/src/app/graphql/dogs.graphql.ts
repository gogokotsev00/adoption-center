import { gql } from 'apollo-angular';

export const CREATE_DOG_MUTATION = gql`
  mutation CreateDog($name: String!, $age: Int!, $ownerId: ID!) {
    createDog(name: $name, age: $age, ownerId: $ownerId) {
      id
      name
      age
    }
  }
`;
