const { Contract, Provider, utils } = require("koilib");
const klashAbi = require("../../client/src/utils/abi/klash-abi.json");
const { Client } = require("koinos-rpc");

module.exports = async function (Server) {
  Server.PROVIDERS_URL = [
    "https://api.koinos.io",
    "https://api.koinosblocks.com",
  ];
  Server.provider = new Provider(Server.PROVIDERS_URL); // koilib
  Server.client = new Client(Server.PROVIDERS_URL); // koinos-rpc

  Server.klashContractAddress = "1KLASH1i4nXLHWh19obwtotNGx2GufiMbG";
  Server.klashContract = new Contract({
    id: Server.klashContractAddress,
    abi: klashAbi,
    provider: Server.provider,
  }).functions;

  Server.initKoinContractWithSigner = (signer) => {
    signer.provider = Server.provider;
    return new Contract({
      id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
      abi: utils.tokenAbi,
      provider: Server.provider,
      signer: signer,
    }).functions;
  };
};
