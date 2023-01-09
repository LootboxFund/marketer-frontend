import { gql } from '@apollo/client';

export const GET_ADVERTISER = gql`
  query AdvertiserAdminView {
    advertiserAdminView {
      ... on AdvertiserAdminViewResponseSuccess {
        id
        userID
        name
        description
        avatar
        publicContactEmail
        website
        visibility
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
