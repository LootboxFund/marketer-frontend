import { gql } from '@apollo/client';

export const VIEW_TOURNAMENT = gql`
  query Tournament($tournamentID: ID!) {
    tournament(id: $tournamentID) {
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
