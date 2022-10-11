import { gql } from '@apollo/client';

export const QUERY_BATTLE_FEED = gql`
  query BattleFeed($first: Int!, $after: ID) {
    battleFeed(first: $first, after: $after) {
      ... on BattleFeedResponseSuccess {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            id
            title
            coverPhoto
            description
            lootboxSnapshots {
              stampImage
            }
            tournamentDate
            prize
          }
          cursor
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
