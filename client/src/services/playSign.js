import { formatChainError } from "../utils/formatting.js";
import { presignAndSendTx } from "../utils/HDKoinos.js";

export async function playSign(vue, sign, seed) {
  let activeAccountAddress = vue.$store.state.activeAccount?.address;

  try {
    const { operation } =
      await vue.$store.state.klashContract.functions.play_sign(
        {
          from: activeAccountAddress,
          signHash: vue.$store.getters.hashedSign(sign, seed),
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

    vue.$info("Your sign play intention has been sent to the blockchain!");

    await transaction.wait("byBlock", 30000);
    vue.$transactionInfo("Sign intention successfully played!", transaction);
  } catch (err) {
    vue.$error(formatChainError(err), "Play sign failed !");
  }
}
