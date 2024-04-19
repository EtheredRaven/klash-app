import { formatChainError } from "../utils/formatting.js";

export async function playSign(vue, sign, seed) {
  const klash = vue.$store.state.klashContract;
  let activeAccountAddress = vue.$store.state.activeAccount?.address;

  try {
    const { transaction } = await klash.play_sign(
      {
        from: activeAccountAddress,
        signHash: vue.$store.getters.hashedSign(sign, seed),
      },
      {
        rcLimit: 100000000,
        payer: window.Client.klashContractAddress,
        payee: activeAccountAddress,
      }
    );

    vue.$info("Your sign play intention has been sent to the blockchain!");

    await transaction.wait("byBlock", 30000);
    vue.$transactionInfo("Sign intention successfully played!", transaction);
  } catch (err) {
    vue.$error(formatChainError(err), "Play sign failed !");
  }
}
