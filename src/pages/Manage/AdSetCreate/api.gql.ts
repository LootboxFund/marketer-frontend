import { gql } from '@apollo/client';

export const CREATE_AD_SET = gql`
  mutation CreateAdSet($payload: CreateAdSetPayload!) {
    createAdSet(payload: $payload) {
      ... on CreateAdSetResponseSuccess {
        adSet {
          id
          name
          description
          status
          advertiserID
          placement
          offerIDs
          adIDs
          ads {
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
