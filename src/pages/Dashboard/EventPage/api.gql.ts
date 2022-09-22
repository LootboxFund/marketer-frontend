import { gql } from '@apollo/client';

export const VIEW_TOURNAMENT = gql`
  query Tournament($id: ID!) {
    tournament(id: $id) {
      ... on TournamentResponseSuccess {
        tournament {
          id
          title
          description
          tournamentLink
          creatorId
          magicLink
          tournamentDate
          prize
          coverPhoto
          communityURL
          organizer
          promoters
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
