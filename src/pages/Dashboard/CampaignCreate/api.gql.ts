import { gql } from '@apollo/client';

export const CREATE_CONQUEST = gql`
  mutation CreateConquest($advertiserID: ID!, $payload: CreateConquestPayload!) {
    createConquest(advertiserID: $advertiserID, payload: $payload) {
      ... on ResponseError {
        error {
          code
          message
        }
      }
      ... on CreateConquestResponseSuccess {
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
    }
  }
`;
