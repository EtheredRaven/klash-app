const { TIMEOUT_DURATION, MATCH_NOT_FINISHED } = require("./constants");
const { getUTCTimestamp } = require("./utils");

module.exports = function (Server) {
  Server.resetTimeouts = function () {
    for (let player in Server.timeouts || {}) {
      clearTimeout(Server.timeouts[player]);
    }
    Server.timeouts = {};
    Server.timeoutTransactionsList = [];
    Server.infoLogging("Timeouts reset");
  };
  Server.resetTimeouts();

  function timeoutTransactions() {
    setTimeout(async () => {
      let newList = [];
      for (let i = 0; i < Server.timeoutTransactionsList.length; i++) {
        let player = Server.timeoutTransactionsList[i];
        Server.infoLogging("Trying to timeout", player);
        let canBeTimedOut = false;
        try {
          canBeTimedOut = (
            await Server.klashContract.functions.can_timeout_player(
              {
                player: player,
              },
              { gasLimit: 1000000 }
            )
          )?.result?.value;
        } catch (error) {
          Server.errorLogging(
            "Error calling can_timeout_player",
            player,
            error
          );
        }

        if (canBeTimedOut) {
          try {
            let { transaction } =
              await Server.klashContract.functions.timeout_player({
                player: player,
              });
            await transaction.wait("byBlock", 20000);
            Server.infoLogging("Player timed out", player);
          } catch (error) {
            Server.errorLogging("Error calling timeout_player", player, error);
            newList.push(player);
          }
        } else {
          Server.infoLogging("Player can't be timed out", player);
        }
      }
      Server.timeoutTransactionsList = newList;
      timeoutTransactions();
    }, 5000);
  }
  timeoutTransactions();

  Server.setMatchTimeouts = function (match) {
    Server.timeouts[match.player_1] &&
      clearTimeout(Server.timeouts[match.player_1]);
    Server.timeouts[match.player_2] &&
      clearTimeout(Server.timeouts[match.player_2]);
    Server.infoLogging("Timeouts cleared", match.player_1, match.player_2);
    if (match.winner !== MATCH_NOT_FINISHED || match.start_timestamp == 0)
      return;
    if (process.env.PREDEFINED_BLOCKS_TESTING) return;

    function setPlayerTimeout(
      player,
      lastActionTimestamp,
      sign,
      signHash,
      otherSignHash
    ) {
      let UTCTimestamp = getUTCTimestamp();
      Server.infoLogging(
        player,
        Server.timeoutTransactionsList.includes(player),
        signHash,
        otherSignHash,
        sign
      );
      if (!signHash || (signHash && otherSignHash && !sign)) {
        let timeToTimeout = Math.max(
          0,
          TIMEOUT_DURATION - (UTCTimestamp - lastActionTimestamp)
        );
        Server.timeouts[player] = setTimeout(() => {
          Server.timeouts[player] = null;
          !Server.timeoutTransactionsList.includes(player) &&
            Server.timeoutTransactionsList.push(player);
          Server.infoLogging("Timeout reached", player);
        }, timeToTimeout);
        Server.infoLogging(
          "Timeout set",
          player,
          timeToTimeout,
          lastActionTimestamp,
          UTCTimestamp
        );
      }
    }

    setPlayerTimeout(
      match.player_1,
      match.last_action_timestamp_1,
      match.sign_1,
      match.sign_hash_1,
      match.sign_hash_2
    );
    setPlayerTimeout(
      match.player_2,
      match.last_action_timestamp_2,
      match.sign_2,
      match.sign_hash_2,
      match.sign_hash_1
    );
  };
};
