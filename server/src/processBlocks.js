module.exports = async function (Server) {
  const BLOCKS_PROCESSING_INTERVAL = 1000;

  let processKlashEvents = async function (decodedEvent, txId) {
    // TODO
    /**
     * Example of use to process events
     * if (decodedEvent.name == "klashcontract.transfer_event") {
     * let eventArgs = decodedEvent.args;
     */
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
        Server.infoLogging("Processed event", txId, eventDecoded.name);
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
  setInterval(async () => {
    if (Server.TEST_ENV) return true;
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
