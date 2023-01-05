import { ResponseError } from '@/api/graphql/generated/types';
import { gql } from '@apollo/client';

export interface OfferClaimsCSVResponseFE {
  offerClaimsCSV:
    | {
        __typename: 'OfferClaimsCSVResponseSuccess';
        csvDownloadURL: string;
      }
    | ResponseError;
}

export const OFFER_CLAIMS = gql`
  mutation OfferClaimsCSV($payload: OfferClaimsCSVPayload!) {
    offerClaimsCSV(payload: $payload) {
      ... on OfferClaimsCSVResponseSuccess {
        csvDownloadURL
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
