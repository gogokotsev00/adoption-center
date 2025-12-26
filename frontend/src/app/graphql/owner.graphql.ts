import {gql, TypedDocumentNode} from 'apollo-angular';
import {Owner} from "./types";

export const OWNERS_QUERY: TypedDocumentNode<GetOwnersResult, GetOwnersVariables> = gql`
  query Owners {
    owners {
      id
      name
      money
    }
  }
`;

export const CREATE_OWNER_MUTATION: TypedDocumentNode<CreateOwnerResult, CreateOwnerVariables> = gql`
  mutation CreateOwner($name: String!, $money: Float!) {
    createOwner(name: $name, money: $money) {
      id
      name
      money
    }
  }
`;

export const DELETE_OWNER_MUTATION: TypedDocumentNode<DeleteOwnerByIdResult, DeleteOwnerByIdVariables> = gql`
  mutation DeleteOwnerById($id: ID!) {
    deleteOwnerById(id: $id)
  }
`;

export const UPDATE_OWNER_MONEY_MUTATION: TypedDocumentNode<UpdateOwnerMoneyResult, UpdateOwnerMoneyVariables> = gql`
  mutation UpdateOwnerMoney($id: ID!, $money: Float!) {
    updateOwnerMoney(id: $id, money: $money) {
      id
      name
      money
    }
  }
`;

interface GetOwnersResult {
    owners: Owner[];
}

type GetOwnersVariables = Record<string, never>;

interface CreateOwnerResult {
    createOwner: Owner;
}

interface CreateOwnerVariables {
    name: string;
    money: number;
}

interface DeleteOwnerByIdResult {
    deleteOwnerById: number;
}

interface DeleteOwnerByIdVariables {
    id: string;
}

interface UpdateOwnerMoneyResult {
    updateOwnerMoney: Owner;
}

interface UpdateOwnerMoneyVariables {
    id: string;
    money: number;
}
