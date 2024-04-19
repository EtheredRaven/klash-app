import { formatChainError } from "../utils/formatting.js";

export async function verifySign(vue, sign, seed1, seed2) {
  try {
    const { transaction } = await vue.$store.state.klashContract.verify_sign(
      {
        from: vue.$store.state.activeAccount?.address,
        sign,
        randomSeed_1: seed1,
        randomSeed_2: seed2,
      },
      {
        rcLimit: 100000000,
        payer: window.Client.klashContractAddress,
        payee: vue.$store.state.activeAccount?.address,
      }
    );

    vue.$info("Your sign unveiling has been sent to the blockchain");

    await transaction.wait("byBlock", 30000);
    vue.$transactionInfo("Sign successfully unveiled!", transaction);
  } catch (err) {
    vue.$error(formatChainError(err), "Play sign failed !");
  }
}
