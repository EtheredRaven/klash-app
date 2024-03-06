const { Contract, Signer, Provider, utils } = require("koilib");
const klashAbi = require("../../client/src/utils/abi/klash-abi.json");
const { Client } = require("koinos-rpc");

module.exports = function (Server) {
  Server.PROVIDERS_URL = process.env.TEST
    ? ["https://harbinger-api.koinos.io"]
    : ["https://api.koinos.io", "https://api.koinosblocks.com"];
  Server.infoLogging("Intialied providers", Server.PROVIDERS_URL);
  Server.provider = new Provider(Server.PROVIDERS_URL); // koilib
  Server.client = new Client(Server.PROVIDERS_URL); // koinos-rpc

  let signer;
  if (!process.env.PREDEFINED_BLOCKS_TESTING) {
    signer = Signer.fromWif(process.env.KLASH_PRIVATE_KEY);
    signer.provider = Server.provider;
  }

  Server.klashContractAddress = "1KLASH1i4nXLHWh19obwtotNGx2GufiMbG";
  Server.klashContract = new Contract({
    id: Server.klashContractAddress,
    abi: klashAbi,
    provider: Server.provider,
    signer: signer,
    options: {
      rcLimit: 100000000,
    },
  });

  Server.koinContract = new Contract({
    id: process.env.TEST
      ? "1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju"
      : "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
    abi: utils.tokenAbi,
    provider: Server.provider,
    signer: signer,
    options: {
      rcLimit: 100000000,
    },
  });
};
