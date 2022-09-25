import { gql } from '@apollo/client';

export const LIST_PARTNERS = gql`
  query ListPartnersOfAdvertiser($advertiserID: ID!) {
    listPartnersOfAdvertiser(advertiserID: $advertiserID) {
      ... on ListPartnersOfAdvertiserResponseSuccess {
        partners {
          id
          userID
          name
          avatar
          website
          audienceSize
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
