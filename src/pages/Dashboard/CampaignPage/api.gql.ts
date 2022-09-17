import { gql } from '@apollo/client';

export const GET_CONQUEST = gql`
  query GetConquest($advertiserID: ID!, $conquestID: ID!) {
    getConquest(advertiserID: $advertiserID, conquestID: $conquestID) {
      ... on GetConquestResponseSuccess {
        conquest {
          id
          title
          description
          image
          startDate
          endDate
          advertiserID
          status
          spentBudget
          maxBudget
          tournaments
        }
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

export const UPDATE_CONQUEST = gql`
  mutation UpdateConquest($advertiserID: ID!, $payload: UpdateConquestPayload!) {
    updateConquest(advertiserID: $advertiserID, payload: $payload) {
      ... on UpdateConquestResponseSuccess {
        conquest {
          id
          title
          description
          image
          startDate
          endDate
          advertiserID
          status
          spentBudget
          maxBudget
          tournaments
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
