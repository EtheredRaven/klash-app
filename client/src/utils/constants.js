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

export const SIGN_INTEGER_TO_STRING = function (sign) {
  if (sign.toString() == ROCK_SIGN.toString()) return "rock";
  else if (sign.toString() == PAPER_SIGN.toString()) return "paper";
  else if (sign.toString() == SCISSORS_SIGN.toString()) return "scissors";
  else return "Unknown";
};

export const COMPUTE_WINNER = function (sign1, sign2) {
  if (sign1 == sign2) return 0;
  if (sign1 == ROCK_SIGN && sign2 == SCISSORS_SIGN) return 1;
  if (sign1 == SCISSORS_SIGN && sign2 == PAPER_SIGN) return 1;
  if (sign1 == PAPER_SIGN && sign2 == ROCK_SIGN) return 1;
  return 2;
};
