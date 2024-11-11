const {
  tournamentCreated,
  playerSignedUp,
  tournamentStarted,
  signPlayed,
  signVerified,
  matchRoundFinished,
  matchFinished,
  newMatchCreated,
  tournamentRoundStarted,
  tournamentFinished,
  newPlayerWaiting,
  playerSkippedRound,
} = require("./events");

module.exports = async function (Server) {
  const BLOCKS_PROCESSING_INTERVAL =
    process.env.BLOCKS_PROCESSING_INTERVAL || 1000;
  let lastProcessedBlockId = null;
  let lastKlashEventTimeout = null;
  let LAST_KLASH_EVENT_TIMEOUT_DURATION = 4 * 60000; // 4 minutes
  let CURRENT_TEST_BLOCK_HEIGHT = 0;

  let processKlashEvents = async function (decodedEvent) {
    switch (decodedEvent.name) {
      case "klash.tournament_created_event":
        await tournamentCreated(Server, decodedEvent.args);
        break;
      case "klash.player_signed_up_event":
        await playerSignedUp(Server, decodedEvent.args);
        break;
      case "klash.tournament_started_event":
        await tournamentStarted(Server, decodedEvent.args);
        break;
      case "klash.sign_played_event":
        await signPlayed(Server, decodedEvent.args);
        break;
      case "klash.sign_verified_event":
        await signVerified(Server, decodedEvent.args);
        break;
      case "klash.match_round_finished_event":
        await matchRoundFinished(Server, decodedEvent.args);
        break;
      case "klash.match_finished_event":
        await matchFinished(Server, decodedEvent.args);
        break;
      case "klash.new_match_created_event":
        await newMatchCreated(Server, decodedEvent.args);
        break;
      case "klash.tournament_round_started_event":
        await tournamentRoundStarted(Server, decodedEvent.args);
        break;
      case "klash.tournament_finished_event":
        await tournamentFinished(Server, decodedEvent.args);
        break;
      case "klash.new_player_waiting_event":
        await newPlayerWaiting(Server, decodedEvent.args);
        break;
      case "klash.player_skipped_round_event":
        await playerSkippedRound(Server, decodedEvent.args);
        break;
      default:
        break;
    }
  };

  const PROCESSING_EVENTS_ROUTER = [
    {
      contract: Server.klashContract,
      contractAddress: Server.klashContractAddress,
      processingFunction: processKlashEvents,
    },
  ];
  let processEvent = async function (event) {
    for (let i = 0; i < PROCESSING_EVENTS_ROUTER.length; i++) {
      let processingEventRouter = PROCESSING_EVENTS_ROUTER[i];
      if (event.source == processingEventRouter.contractAddress) {
        let decodedEvent = await processingEventRouter.contract.decodeEvent(
          event
        );
        let isKlashEvent = event.source == Server.klashContractAddress;
        if (isKlashEvent) {
          lastKlashEventTimeout && clearTimeout(lastKlashEventTimeout);
          Server.infoLogging("Clearing sync timeout");

          if (
            Server.currentTournament &&
            Server.currentTournament.start_timestamp &&
            !Server.currentTournament.end_timestamp
          ) {
            // If there is a tournament running, set a timeout to sync the db with the blockchain. Used when there is a blockchain rollback and the server is desynced so the game is blocked
            lastKlashEventTimeout = setTimeout(
              Server.syncDbWithBlockchain,
              LAST_KLASH_EVENT_TIMEOUT_DURATION
            );
            Server.infoLogging(
              "Sync timeout set",
              Date.now(),
              Date.now() + LAST_KLASH_EVENT_TIMEOUT_DURATION
            );
          }
        }

        Server.infoLogging("Processing event", decodedEvent.name);
        await processingEventRouter.processingFunction(decodedEvent);
        Server.infoLogging("Processed event", decodedEvent.name);
        return isKlashEvent;
      }
    }
    return false;
  };

  let processBlocks = async function (blocksToProcess) {
    // Process the block in the right order
    let updateTournament = false;
    for (let i = blocksToProcess.length - 1; i >= 0; i--) {
      let block = blocksToProcess[i];

      // Process the events
      let transactionReceipts = block.receipt.transaction_receipts;
      if (transactionReceipts) {
        for (let j = 0; j < transactionReceipts.length; j++) {
          let txReceipt = transactionReceipts[j];
          let events = txReceipt.events;
          if (events) {
            for (let k = 0; k < events.length; k++) {
              // Process each event
              let event = events[k];
              let shouldUpdateTournament = await processEvent(event);
              if (!updateTournament && shouldUpdateTournament) {
                updateTournament = true;
              }
            }
          }
        }
      }
      Server.infoLogging("Processed block", block.block_height, block.block_id);
      if (
        lastProcessedBlockId &&
        block.block.header.previous != lastProcessedBlockId
      ) {
        Server.infoLogging(
          "Block not in order",
          block.block_height,
          block.block_id,
          block.block.header.previous,
          lastProcessedBlockId
        );
      }
      lastProcessedBlockId = block.block_id;
    }

    // Send the tournament to the admin if it was updated
    if (updateTournament) {
      Server.emitTournamentUpdated(Server.currentTournament);
    }
  };

  // Check for events in the new blocks and process them
  let lastBlockHeight = Number(
    (await Server.client.blockStore.getHighestBlock()).topology.height
  );

  if (process.env.PREDEFINED_BLOCKS_TESTING) {
    await require("./test")(Server);
  }
  setInterval(async () => {
    // Testing if there are predefined blocks to process
    if (process.env.PREDEFINED_BLOCKS_TESTING) {
      if (CURRENT_TEST_BLOCK_HEIGHT >= Server.BLOCKS_TO_PROCESS_IDS.length)
        return;
      await processBlocks([
        require("../logs/test_blocks/" +
          Server.BLOCKS_TO_PROCESS_IDS[CURRENT_TEST_BLOCK_HEIGHT] +
          ".json"),
      ]);
      CURRENT_TEST_BLOCK_HEIGHT++;
      return;
    }

    try {
      let newBlock = (await Server.client.blockStore.getHighestBlock())
        .topology;
      let newBlockHeight = Number(newBlock.height);
      let blocksToProcess = [];

      // Construct all the missed blocks in this interval to process
      if (newBlockHeight >= lastBlockHeight) {
        let currentBlockHeight = newBlockHeight;
        let currentBlockId = newBlock.id;

        while (currentBlockHeight >= lastBlockHeight) {
          const { block_items } =
            await Server.client.blockStore.getBlocksByHeight(
              currentBlockId,
              currentBlockHeight,
              1
            );

          blocksToProcess.push(block_items[0]);
          currentBlockId = block_items[0].block.header.previous;
          currentBlockHeight--;
        }

        lastBlockHeight = newBlockHeight + 1;
      }

      // Process the blocks
      await processBlocks(blocksToProcess);
    } catch (err) {
      Server.errorLogging("Error while retrieving last block", err);
    }
  }, BLOCKS_PROCESSING_INTERVAL);
};
