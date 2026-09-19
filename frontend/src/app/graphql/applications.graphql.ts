import {gql, TypedDocumentNode} from 'apollo-angular';
import {AdoptionApplication} from './types';

export const APPLICATIONS_QUERY: TypedDocumentNode<GetApplicationsResult, Record<string, never>> = gql`
  query Applications {
    applications {
      id
      status
      createdAt
      owner {
        id
        name
        money
      }
      dog {
        id
        name
        age
        fee
        status
      }
    }
  }
`;

export const CREATE_APPLICATION_MUTATION: TypedDocumentNode<CreateApplicationResult, CreateApplicationVariables> = gql`
  mutation CreateAdoptionApplication($ownerId: ID!, $dogId: ID!) {
    createAdoptionApplication(ownerId: $ownerId, dogId: $dogId) {
      id
      status
      createdAt
      owner {
        id
        name
      }
      dog {
        id
        name
        status
      }
    }
  }
`;

export const APPROVE_APPLICATION_MUTATION: TypedDocumentNode<ApproveApplicationResult, ApplicationActionVariables> = gql`
  mutation ApproveAdoptionApplication($id: ID!) {
    approveAdoptionApplication(id: $id) {
      id
      status
      owner {
        id
        name
        money
      }
      dog {
        id
        name
        status
        owner {
          id
          name
        }
      }
    }
  }
`;

export const REJECT_APPLICATION_MUTATION: TypedDocumentNode<RejectApplicationResult, ApplicationActionVariables> = gql`
  mutation RejectAdoptionApplication($id: ID!) {
    rejectAdoptionApplication(id: $id) {
      id
      status
      dog {
        id
        name
        status
      }
    }
  }
`;

interface GetApplicationsResult {
  applications: AdoptionApplication[];
}

interface CreateApplicationResult {
  createAdoptionApplication: AdoptionApplication;
}

interface CreateApplicationVariables {
  ownerId: string;
  dogId: string;
}

interface ApproveApplicationResult {
  approveAdoptionApplication: AdoptionApplication;
}

interface RejectApplicationResult {
  rejectAdoptionApplication: AdoptionApplication;
}

interface ApplicationActionVariables {
  id: string;
}
