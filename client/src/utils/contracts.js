import { Contract, Provider } from "koilib";
import { klashAbi } from "./abi";

export const provider = new Provider(
  import.meta.env.MODE == "development"
    ? ["https://harbinger-api.koinos.io"]
    : ["https://api.koinos.io", "https://api.koinosblocks.com"]
);

window.Client.klashContractAddress = "1KLASH1i4nXLHWh19obwtotNGx2GufiMbG";
export function getKlashContract(signer) {
  signer && (signer.provider = provider);
  return new Contract({
    id: window.Client.klashContractAddress,
    abi: klashAbi,
    provider,
    signer,
  }).functions;
}
