import { gql } from '@apollo/client';

export const LIST_CREATED_OFFERS = gql`
  query ListCreatedOffers($advertiserID: ID!) {
    listCreatedOffers(advertiserID: $advertiserID) {
      ... on ListCreatedOffersResponseSuccess {
        offers {
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
