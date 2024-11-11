import { formatChainError } from "../utils/formatting.js";
import { presignAndSendTx } from "../utils/HDKoinos.js";

export async function verifySign(vue, sign, seed1, seed2) {
  let activeAccountAddress = vue.$store.state.activeAccount?.address;

  try {
    const { operation } =
      await vue.$store.state.klashContract.functions.verify_sign(
        {
          from: activeAccountAddress,
          sign,
          randomSeed_1: seed1,
          randomSeed_2: seed2,
        },
        {
          onlyOperation: true,
        }
      );
    const { transaction } = await presignAndSendTx(
      operation,
      {
        payer: window.Client.klashContractAddress,
        payee: activeAccountAddress,
        rcLimit: 100000000,
      },
      vue.$store.state.klashContract
    );

    vue.$info("Your sign unveiling has been sent to the blockchain");

    await transaction.wait("byBlock", 30000);
    vue.$transactionInfo("Sign successfully unveiled!", transaction);
  } catch (err) {
    vue.$error(formatChainError(err), "Play sign failed !");
  }
}
