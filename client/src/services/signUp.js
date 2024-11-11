import { formatChainError } from "../utils/formatting.js";
import { presignAndSendTx } from "../utils/HDKoinos.js";

export async function signUp(vue) {
  try {
    const { operation } =
      await vue.$store.state.klashContract.functions.sign_up(
        {
          from: vue.activeAccountAddress,
        },
        {
          onlyOperation: true,
        }
      );
    const { transaction } = await presignAndSendTx(
      operation,
      {
        payer: window.Client.klashContractAddress,
        payee: vue.activeAccountAddress,
        rcLimit: 100000000,
      },
      vue.$store.state.klashContract
    );

    vue.$info("Sign up has been sent to the blockchain!");

    await transaction.wait("byBlock", 30000);
    vue.$transactionInfo("Sign up successful !", transaction);
  } catch (err) {
    vue.$error(formatChainError(err), "Sign up failed !");
  }
}
