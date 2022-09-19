import { gql } from '@apollo/client';

export const VIEW_AD_SET = gql`
  query ViewAdSet($adSetID: ID!) {
    viewAdSet(adSetID: $adSetID) {
      ... on ViewAdSetResponseSuccess {
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
