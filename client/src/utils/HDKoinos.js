/**
 * Hierarchical Deterministic Wallet for Koinos
 *
 * The HDKoinos follows the BIP44 standard as follows
 * (see https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki):
 *
 * path levels
 * m / purpose' / coin_type' / account' / change / address_index
 *
 * purpose: 44
 *
 * coin_type: 659
 * This value was selected by taking the word "koinos", converting it
 * to ascii [107 111 105 110 111 115], and adding their values.
 *
 * account:
 * index of the account
 *
 * change:
 * Koinos doesn't use an UTXO model as bitcoin does, so there is no
 * change. However, we take the philosophy around change: internal and
 * external use.
 * - 0 for external use: Accounts. Addresses to receive payments and store
 *   assets.
 * - 1 for internal use: Signers. In Koinos these addresses are not
 *   meant to be used to store assets (like tokens or NTFs) but to
 *   define signers for multisig wallets.
 *
 * address_index:
 * - 0 for accounts, or
 * - index for signers (when change = 1)
 */

import { Signer, Transaction } from "koilib";
import { ethers } from "ethers";

const KOINOS_PATH = "m/44'/659'/";

export class HDKoinos {
  constructor(mnemonic) {
    this.hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
  }

  static randomMnemonic() {
    return ethers.utils.entropyToMnemonic(
      window.crypto.getRandomValues(new Uint8Array(16))
    );
  }

  static parsePath(keyPath) {
    if (!keyPath) throw new Error("Account not derived from a seed");

    const matchs = keyPath.match(
      /^m\/44'\/659'\/([0-9]*)'\/([0-9]*)\/([0-9]*)/
    );
    if (!matchs) throw new Error(`Invalid keyPath ${keyPath}`);
    const [, accountIndex, change, signerIndex] = matchs;
    if (change !== "0" && change !== "1")
      throw new Error(`Invalid 'change' in keyPath ${keyPath}`);
    return {
      accountIndex,
      ...(change === "1" && { signerIndex }),
    };
  }

  deriveKey(account) {
    const { name, keyPath, address } = account;
    const key = this.hdNode.derivePath(keyPath);
    const signer = new Signer({
      privateKey: key.privateKey.slice(2),
    });

    if (address && address !== signer.getAddress()) {
      throw new Error(
        `Error ". Expected address: ${address}. Derived: ${signer.getAddress()}`
      );
    }

    return {
      keyPath,
      address: signer.getAddress(),
      name: name,
      privateKey: signer.getPrivateKey("wif", false),
    };
  }

  deriveKeyAccount(accIndex) {
    return this.deriveKey({
      name: "Account " + accIndex,
      keyPath: `${KOINOS_PATH}${accIndex}'/0/0`,
    });
  }

  deriveKeySigner(accIndex, signerIndex) {
    return this.deriveKey({
      name: accIndex + "/" + signerIndex,
      keyPath: `${KOINOS_PATH}${accIndex}'/1/${signerIndex}`,
    });
  }
}

export async function presignAndSendTx(operation, options, klashContract) {
  const tx = new Transaction({
    signer: klashContract.signer, // signer from kondor
    provider: klashContract.provider,
    options,
  });
  let randomSigner = Signer.fromWif(
    new HDKoinos(HDKoinos.randomMnemonic()).deriveKeyAccount(0).privateKey,
    true
  );
  await tx.pushOperation(operation);
  await tx.prepare();
  await randomSigner.signTransaction(tx.transaction);
  await tx.sign(); // With Kondor
  await tx.send();
  return tx;
}

export default HDKoinos;
