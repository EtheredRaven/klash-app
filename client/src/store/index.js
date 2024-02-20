import { createStore as createVuexStore } from "vuex";
import { getKlashContract } from "../utils/contracts";
import CryptoJS from "crypto-js";
import { sha256 } from "js-sha256";
import * as kondor from "kondor-js";

export const createStore = (app) => {
  return createVuexStore({
    state: {
      activeWallet: null,
      activeAccount: null,
      klashContract: getKlashContract(),
      walletsList: JSON.parse(
        window.localStorage.getItem("klash-wallets") || "[]"
      ),
      addressesData: {},
      currentTournament: null,
      currentMatch: null,
      signPlayed: null,
      hashingSeed: null,
      tempHashingSeed: null,
      tempSignPlayed: null,
    },
    getters: {
      localStorageKey: (state) => {
        return (
          state.currentMatch.tournament_id +
          "-" +
          state.currentMatch.round_number +
          "-" +
          state.currentMatch.score_1 +
          "-" +
          state.currentMatch.score_2 +
          "-" +
          state.activeAccount.address
        );
      },
      getWalletAsStoredFormat: () => {
        return function (wallet) {
          let storedWallet;
          if (wallet.name && wallet.password) {
            storedWallet = {
              name: wallet.name,
              wallet: CryptoJS.AES.encrypt(
                JSON.stringify(wallet),
                wallet.password
              ).toString(),
            };
          } else if (
            wallet.name == "Kondor" ||
            wallet.name == "WalletConnect"
          ) {
            storedWallet = {
              name: wallet.name,
              wallet: JSON.stringify(wallet),
            };
          }

          return storedWallet;
        };
      },
      hashedSign: () => {
        return function (sign, seed) {
          let strToHash = sign.toString() + seed.toString();
          let hashedBytes = sha256.digest(strToHash);
          hashedBytes = [18, 32, ...hashedBytes];

          // Convert the bytes to a hex string
          let hex = "";
          for (let i = 0; i < hashedBytes.length; i++) {
            hex += hashedBytes[i].toString(16);
          }

          return hex;
        };
      },
    },
    mutations: {
      setCurrentTournament(state, tournament) {
        state.currentTournament = tournament;
      },
      addPlayerToCurrentTournament(state, player) {
        state.currentTournament.players = [
          ...state.currentTournament.players,
          player,
        ];
      },
    },
    actions: {
      setCurrentMatch({ state, getters }, match) {
        state.currentMatch = match;
        state.hashingSeed = window.localStorage.getItem(
          "klash-hashingSeed-" + getters.localStorageKey
        );
        state.signPlayed = window.localStorage.getItem(
          "klash-signPlayed-" + getters.localStorageKey
        );
        state.tempHashingSeed = window.localStorage.getItem(
          "klash-tempHashingSeed-" + getters.localStorageKey
        );
        state.tempSignPlayed = window.localStorage.getItem(
          "klash-tempSignPlayed-" + getters.localStorageKey
        );
      },
      setHashingSeed({ state, getters }, seed) {
        state.hashingSeed = seed;
        window.localStorage.setItem(
          "klash-hashingSeed-" + getters.localStorageKey,
          seed
        );
      },
      setTempHashingSeed({ state, getters }, seed) {
        state.tempHashingSeed = seed;
        window.localStorage.setItem(
          "klash-tempHashingSeed-" + getters.localStorageKey,
          seed
        );
      },
      setSignPlayed({ state, getters }, signPlayed) {
        state.signPlayed = signPlayed;
        window.localStorage.setItem(
          "klash-signPlayed-" + getters.localStorageKey,
          signPlayed
        );
      },
      setTempSignPlayed({ state, getters }, signPlayed) {
        state.tempSignPlayed = signPlayed;
        window.localStorage.setItem(
          "klash-tempSignPlayed-" + getters.localStorageKey,
          signPlayed
        );
      },
      async unlockWallet({ state, dispatch }, { name, password }) {
        let encryptedWallet =
          state.walletsList[
            state.walletsList.findIndex(function (x) {
              return x.name === name;
            })
          ].wallet;

        let wallet;
        if (name == "Kondor" || name == "WalletConnect") {
          wallet = JSON.parse(encryptedWallet);
          if (name == "WalletConnect") {
            // If one already exists, pair it
            await dispatch("pairWalletConnectAccounts", false);
          }
        } else if (name == "Demo") {
          wallet = encryptedWallet;
        } else {
          wallet = JSON.parse(
            CryptoJS.AES.decrypt(encryptedWallet, password).toString(
              CryptoJS.enc.Utf8
            )
          );
        }

        dispatch("setActiveWallet", wallet);
        await dispatch("setActiveAccount", wallet.accounts[0]);
      },
      async linkKondor({ state, dispatch }) {
        let accounts;
        try {
          accounts = await kondor.getAccounts();
        } catch (error) {
          app.config.globalProperties.$error(error);
          return false;
        }
        if (accounts.length) {
          setTimeout(async () => {
            dispatch("deleteWallet", "Kondor");
            dispatch("addWallet", {
              name: "Kondor",
              accounts: accounts,
            });
            await dispatch("setActiveAccount", state.activeWallet.accounts[0]);
          }, 300);
          return true;
        } else {
          app.config.globalProperties.$error(
            "No Kondor account was selected !"
          );
          return false;
        }
      },
      async switchAccount({ state, dispatch }, address) {
        let accountIndex = state.activeWallet.accounts.findIndex(function (
          acc
        ) {
          return acc.address == address;
        });
        await dispatch(
          "setActiveAccount",
          state.activeWallet.accounts[accountIndex]
        );
      },
      setActiveWallet({ state }, newActiveWallet) {
        state.activeWallet = newActiveWallet;
        window.localStorage.setItem("klash-lastWallet", newActiveWallet.name);
      },
      async setActiveAccount({ state }, newActiveAccount) {
        // Unlink the previous account if there is one
        if (
          state.activeAccount &&
          state.activeAccount.address != newActiveAccount.address
        ) {
          app.config.globalProperties.$socket.emit("unlink_socket_to_address");
        }

        state.activeAccount = newActiveAccount;

        if (!state.addressesData[newActiveAccount.address])
          state.addressesData[newActiveAccount.address] = {};

        let newSigner;

        if (state.activeWallet.name == "Kondor") {
          newSigner = kondor.getSigner(newActiveAccount.address);
        } else if (state.activeWallet.name == "WalletConnect") {
          newSigner = window.walletConnectKoinos.getSigner(
            newActiveAccount.address
          );
        } else {
          newSigner = Signer.fromWif(newActiveAccount.privateKey, true);
        }
        state.klashContract = getKlashContract(newSigner);

        app.config.globalProperties.$socket.emit(
          "link_socket_to_address",
          newActiveAccount.address
        );
      },
      deleteWallet({ state }, walletName) {
        state.walletsList = state.walletsList.filter(
          (w) => w.name != walletName
        );
      },
      addWallet({ state, getters, dispatch }, wallet) {
        dispatch("setActiveWallet", wallet);

        let newStoredWallet = getters.getWalletAsStoredFormat(
          state.activeWallet
        );
        state.walletsList.push(newStoredWallet);

        dispatch("storeWallets");
      },
      storeWallets({ state, getters }, walletToUpdate) {
        if (walletToUpdate) {
          let newStoredWallet = getters.getWalletAsStoredFormat(walletToUpdate);
          if (newStoredWallet) {
            let walletIndex = state.walletsList.findIndex(
              (w) => w.name == walletToUpdate.name
            );
            state.walletsList[walletIndex] = newStoredWallet;
          }
        }

        window.localStorage.setItem(
          "klash-wallets",
          JSON.stringify(state.walletsList)
        );
      },
      signOut({ state, commit }) {
        // Unlink the previous account if there is one
        if (state.activeAccount) {
          app.config.globalProperties.$socket.emit("unlink_socket_to_address");
        }
        commit("setCurrentMatch", null);
        state.activeWallet = null;
        state.activeAccount = null;
      },
      unlinkKondor({ state, dispatch }) {
        dispatch("deleteWallet", "Kondor");
        dispatch("signOut");
        dispatch("storeWallets");
      },
    },
    modules: {},
  });
};
