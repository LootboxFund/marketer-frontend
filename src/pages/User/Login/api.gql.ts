import { gql } from '@apollo/client';

export const GET_ADVERTISER = gql`
  query AdvertiserAdminView($advertiserId: ID!) {
    advertiserAdminView(advertiserId: $advertiserId) {
      ... on AdvertiserAdminViewResponseSuccess {
        id
        userID
        name
        description
        userIdpID
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
