import { gql } from '@apollo/client';

export const GET_PARTNER = gql`
  query AffiliatePublicView($affiliateID: ID!) {
    affiliatePublicView(affiliateID: $affiliateID) {
      ... on AffiliatePublicViewResponseSuccess {
        affiliate {
          id
          userID
          name
          avatar
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
