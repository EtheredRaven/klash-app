import { formatChainError } from "../utils/formatting.js";

export async function signUp(vue) {
  const klash = vue.$store.state.klashContract;

  try {
    const { transaction } = await klash.sign_up(
      {
        from: vue.activeAccountAddress,
      },
      {
        rcLimit: 100000000,
        payer: window.Client.klashContractAddress,
        payee: vue.activeAccountAddress,
      }
    );

    vue.$info("Sign up has been sent to the blockchain!");

    await transaction.wait("byBlock", 30000);
    vue.$transactionInfo("Sign up successful !", transaction);
  } catch (err) {
    vue.$error(formatChainError(err), "Sign up failed !");
  }
}
