export const MATCH_NOT_CREATED = 0;
export const MATCH_NOT_FINISHED = 1;
export const MATCH_PLAYER_1_WON = 2;
export const MATCH_PLAYER_2_WON = 3;
export const MATCH_DRAW = 4;
export const WAITING_FOR_MATCH = 5;
export const UNKNOWN_SIGN = 0;
export const ROCK_SIGN = "1";
export const PAPER_SIGN = "2";
export const SCISSORS_SIGN = "3";
export const TIMEOUT_DURATION = 3 * 60 * 1000; // 3 minutes

export const SIGN_INTEGER_TO_STRING = function (sign, includeEmoji = false) {
  if (sign.toString() == ROCK_SIGN.toString())
    return (includeEmoji ? "✊ " : "") + "rock";
  else if (sign.toString() == PAPER_SIGN.toString())
    return (includeEmoji ? "🖐️ " : "") + "paper";
  else if (sign.toString() == SCISSORS_SIGN.toString())
    return (includeEmoji ? "✌️ " : "") + "scissors";
  else return "Unknown";
};

export const COMPUTE_WINNER = function (sign1, sign2) {
  if (sign1 == sign2) return 0;
  if (sign1 == ROCK_SIGN && sign2 == SCISSORS_SIGN) return 1;
  if (sign1 == SCISSORS_SIGN && sign2 == PAPER_SIGN) return 1;
  if (sign1 == PAPER_SIGN && sign2 == ROCK_SIGN) return 1;
  return 2;
};

export const MATCH_STATUS_TO_STRING = function (status) {
  if (status == MATCH_NOT_CREATED) return "Match not created";
  if (status == MATCH_NOT_FINISHED) return "Match not finished";
  if (status == MATCH_PLAYER_1_WON) return "Player 1 won";
  if (status == MATCH_PLAYER_2_WON) return "Player 2 won";
  if (status == MATCH_DRAW) return "Draw";
  if (status == WAITING_FOR_MATCH) return "Waiting for match";
  return "Unknown";
};

export const IS_WAITING_FOR_OPPONENT = function (match, playerNumber) {
  if (match.winner != MATCH_NOT_FINISHED) return true;
  let otherPlayerNumber = playerNumber == 1 ? 2 : 1;

  let playerSign = match["sign_" + playerNumber];
  let opponentSign = match["sign_" + otherPlayerNumber];
  let playerHash = match["sign_hash_" + playerNumber];
  let opponentHash = match["sign_hash_" + otherPlayerNumber];

  let isPlayerWaitingForOpponent =
    (playerSign && !opponentSign) ||
    (!playerSign && playerHash && !opponentSign && !opponentHash);
  if (isPlayerWaitingForOpponent) return true;
  return false;
};
