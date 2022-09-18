import { gql } from '@apollo/client';

export const GET_OFFER = gql`
  query ViewCreatedOffer($offerID: ID!) {
    viewCreatedOffer(offerID: $offerID) {
      ... on ViewCreatedOfferResponseSuccess {
        offer {
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
          affiliateBaseLink
          mmp
          adSets
          activations {
            id
            name
            description
            pricing
            status
            mmpAlias
            offerID
            order
          }
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

export const EDIT_OFFER = gql`
  mutation EditOffer($payload: EditOfferPayload!) {
    editOffer(payload: $payload) {
      ... on EditOfferResponseSuccess {
        offer {
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
          affiliateBaseLink
          mmp
          adSets
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

export const CREATE_ACTIVATION = gql`
  mutation CreateActivation($payload: CreateActivationPayload!) {
    createActivation(payload: $payload) {
      ... on CreateActivationResponseSuccess {
        activation {
          id
          name
          description
          pricing
          status
          mmpAlias
          offerID
          order
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

export const EDIT_ACTIVATION = gql`
  mutation EditActivation($payload: EditActivationPayload!) {
    editActivation(payload: $payload) {
      ... on EditActivationResponseSuccess {
        activation {
          id
          name
          description
          pricing
          status
          mmpAlias
          offerID
          order
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
