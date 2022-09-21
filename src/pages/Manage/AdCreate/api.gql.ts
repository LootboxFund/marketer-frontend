import { gql } from '@apollo/client';

export const CREATE_AD = gql`
  mutation CreateAd($payload: CreateAdPayload!) {
    createAd(payload: $payload) {
      ... on CreateAdResponseSuccess {
        ad {
          id
          advertiserID
          status
          name
          placement
          publicInfo
          timestamps {
            createdAt
            updatedAt
            deletedAt
          }
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
