import { gql } from '@apollo/client';

export const VIEW_AD = gql`
  query ViewAd($adID: ID!) {
    viewAd(adID: $adID) {
      ... on ViewAdResponseSuccess {
        ad {
          id
          advertiserID
          status
          name
          placement
          publicInfo
          impressions
          clicks
          uniqueClicks
          creative {
            adID
            advertiserID
            creativeType
            creativeLinks
            callToAction
            thumbnail
            infographicLink
            aspectRatio
            themeColor
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

export const EDIT_AD = gql`
  mutation EditAd($payload: EditAdPayload!) {
    editAd(payload: $payload) {
      ... on EditAdResponseSuccess {
        ad {
          id
          advertiserID
          status
          name
          placement
          publicInfo
          description
          impressions
          clicks
          uniqueClicks
          creative {
            adID
            advertiserID
            creativeType
            creativeLinks
            callToAction
            thumbnail
            infographicLink
            aspectRatio
            themeColor
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
