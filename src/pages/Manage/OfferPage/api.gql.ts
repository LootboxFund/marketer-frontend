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
            mmp
            mmpAlias
            offerID
            order
          }
          adSetPreviews {
            id
            name
            status
            placement
            thumbnail
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

export const GET_AFFILIATE = gql`
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

export const WHITELIST_AFFILIATE = gql`
  mutation WhitelistAffiliateToOffer($payload: WhitelistAffiliateToOfferPayload!) {
    whitelistAffiliateToOffer(payload: $payload) {
      ... on WhitelistAffiliateToOfferResponseSuccess {
        whitelist {
          id
          organizerID
          offerID
          advertiserID
          timestamp
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

export const LIST_WHITELISTED_AFFILIATES = gql`
  query ListWhitelistedAffiliatesToOffer($payload: ListWhitelistedAffiliatesToOfferPayload!) {
    listWhitelistedAffiliatesToOffer(payload: $payload) {
      ... on ListWhitelistedAffiliatesToOfferResponseSuccess {
        whitelists {
          whitelist {
            id
            organizerID
            offerID
            advertiserID
            timestamp
            status
          }
          organizer {
            id
            name
            avatar
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

export const EDIT_WHITELIST_AFFILIATE = gql`
  mutation EditWhitelistAffiliateToOffer($payload: EditWhitelistAffiliateToOfferPayload!) {
    editWhitelistAffiliateToOffer(payload: $payload) {
      ... on EditWhitelistAffiliateToOfferResponseSuccess {
        whitelist {
          id
          organizerID
          offerID
          advertiserID
          timestamp
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
