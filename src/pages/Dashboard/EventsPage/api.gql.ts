import { gql } from '@apollo/client';

export const LIST_HISTORICAL_EVENTS = gql`
  query ListEventsOfAdvertiser($advertiserID: ID!) {
    listEventsOfAdvertiser(advertiserID: $advertiserID) {
      ... on ListEventsOfAdvertiserResponseSuccess {
        tournaments {
          id
          title
          coverPhoto
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
