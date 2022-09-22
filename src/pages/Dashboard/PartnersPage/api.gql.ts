import { gql } from '@apollo/client';

export const LIST_PARTNERS = gql`
  query ListPartnersOfAdvertiser($advertiserId: ID!) {
    listPartnersOfAdvertiser(advertiserID: $advertiserId) {
      ... on ListPartnersOfAdvertiserResponseSuccess {
        partners {
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
