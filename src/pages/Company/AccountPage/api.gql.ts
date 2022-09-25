import { gql } from '@apollo/client';

export const UPDATE_ADVERTISER = gql`
  mutation UpdateAdvertiserDetails($advertiserID: ID!, $payload: UpdateAdvertiserDetailsPayload!) {
    updateAdvertiserDetails(advertiserID: $advertiserID, payload: $payload) {
      ... on UpdateAdvertiserDetailsResponseSuccess {
        advertiser {
          id
          userID
          name
          description
          avatar
          publicContactEmail
          website
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
