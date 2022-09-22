import { gql } from '@apollo/client';

export const LIST_ADSETS_PREVIEWS = gql`
  query ListAdSetsOfAdvertiser($advertiserID: ID!) {
    listAdSetsOfAdvertiser(advertiserID: $advertiserID) {
      ... on ListAdSetsOfAdvertiserResponseSuccess {
        adSets {
          id
          name
          description
          status
          advertiserID
          placement
          offerIDs
          adIDs
          thumbnail
          ads {
            id
            advertiserID
            status
            name
            publicInfo
            placement
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
