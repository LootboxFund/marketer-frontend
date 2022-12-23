import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';

export interface OfferActivationsFE {
  offerActivations:
    | {
        __typename: 'OfferActivationsResponseSuccess';
        data: {
          activationName: string;
          adEventCount: number;
          activationDescription: string;
          activationID: string;
        }[];
      }
    | ResponseError;
}

export const OFFER_ACTIVATIONS = gql`
  query Data($payload: OfferActivationsPayload!) {
    offerActivations(payload: $payload) {
      ... on OfferActivationsResponseSuccess {
        data {
          activationName
          adEventCount
          activationDescription
          activationID
        }
      }
      ... on ResponseError {
        error {
          code
          message
        }
      }
    }
  }
`;
