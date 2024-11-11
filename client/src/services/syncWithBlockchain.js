import { formatChainError } from "../utils/formatting.js";
import { presignAndSendTx } from "../utils/HDKoinos.js";

export async function syncWithBlockchain(vue) {
  let tx;
  try {
    tx = (
      await vue.$store.state.klashContract.functions.get_current_match({
        from: vue.$store.state.activeAccount?.address,
      })
    ).result;
    vue.$store.dispatch("setCurrentMatch", {
      draws_count: vue.$store.state.currentMatch.draws_count,
      last_action_timestamp_1: parseInt(tx.player1.lastActionTimestamp) || 0,
      last_action_timestamp_2: parseInt(tx.player2.lastActionTimestamp) || 0,
      player_1: tx.player1.address,
      player_2: tx.player2.address,
      round_number: parseInt(tx.round),
      score_1: parseInt(tx.score1) || 0,
      score_2: parseInt(tx.score2) || 0,
      sign_1: parseInt(tx.sign1?.sign) || null,
      sign_2: parseInt(tx.sign2?.sign) || null,
      sign_hash_1: tx.sign1?.signHash || null,
      sign_hash_2: tx.sign2?.signHash || null,
      start_timestamp: vue.$store.state.currentMatch.start_timestamp,
      tournament_id: parseInt(tx.tournamentId),
      winner: parseInt(tx.winner),
    });

    vue.$info(
      "Local match state has been synced with blockchain!",
      "Success !"
    );
  } catch (err) {
    vue.$error(formatChainError(err), "Call failed !");
  }
}
