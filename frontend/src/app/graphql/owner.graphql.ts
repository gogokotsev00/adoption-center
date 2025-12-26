import { gql } from 'apollo-angular';

export const OWNERS_QUERY = gql`
  query Owners {
    owners {
      id
      name
      money
    }
  }
`;

export const CREATE_OWNER_MUTATION = gql`
  mutation CreateOwner($name: String!, $money: Float!) {
    createOwner(name: $name, money: $money) {
      id
      name
      money
    }
  }
`;

export const DELETE_OWNER_MUTATION = gql`
  mutation DeleteOwnerById($id: ID!) {
    deleteOwnerById(id: $id)
  }
`;

export const UPDATE_OWNER_MONEY_MUTATION = gql`
  mutation UpdateOwnerMoney($id: ID!, $money: Float!) {
    updateOwnerMoney(id: $id, money: $money) {
      id
      name
      money
    }
  }
`;
