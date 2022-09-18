import { gql } from '@apollo/client';

export const CREATE_OFFER = gql`
  mutation CreateOffer($advertiserID: ID!, $payload: CreateOfferPayload!) {
    createOffer(advertiserID: $advertiserID, payload: $payload) {
      ... on CreateOfferResponseSuccess {
        offer {
          id
          title
          description
          image
          advertiserID
          spentBudget
          maxBudget
          startDate
          endDate
          status
          affiliateBaseLink
          mmp
          adSets
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
