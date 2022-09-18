import { gql } from '@apollo/client';

export const LIST_ADS_PREVIEWS = gql`
  query ListAdsOfAdvertiser($advertiserID: ID!) {
    listAdsOfAdvertiser(advertiserID: $advertiserID) {
      ... on ListAdsOfAdvertiserResponseSuccess {
        ads {
          id
          advertiserID
          status
          name
          placement
          impressions
          publicInfo
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
