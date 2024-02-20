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
  let CURRENT_TEST_BLOCK_HEIGHT = 0;

  let processKlashEvents = async function (decodedEvent, txId) {
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
  let processEvent = async function (event, txId) {
    for (let i = 0; i < PROCESSING_EVENTS_ROUTER.length; i++) {
      let processingEventRouter = PROCESSING_EVENTS_ROUTER[i];
      if (event.source == processingEventRouter.contractAddress) {
        let decodedEvent = await processingEventRouter.contract.decodeEvent(
          event
        );
        await processingEventRouter.processingFunction(decodedEvent, txId);
        Server.infoLogging("Processed event", txId, decodedEvent.name);
        return;
      }
    }
  };

  let processBlocks = async function (blocksToProcess) {
    // Process the block in the right order
    for (let i = blocksToProcess.length - 1; i >= 0; i--) {
      let block = blocksToProcess[i];

      // Process the events
      let transactionReceipts = block.receipt.transaction_receipts;
      let receiptId = block.receipt.id;
      if (transactionReceipts) {
        for (let j = 0; j < transactionReceipts.length; j++) {
          let txReceipt = transactionReceipts[j];
          let events = txReceipt.events;
          if (events) {
            for (let k = 0; k < events.length; k++) {
              // Process each event
              let event = events[k];
              await processEvent(event, receiptId);
            }
          }
          Server.infoLogging("Processed transaction", receiptId);
        }
      }

      Server.infoLogging("Processed block", block.block_height, block.block_id);
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
