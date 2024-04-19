<template>
  <dialog id="connectModal" class="modal text-left">
    <div class="modal-box">
      <h3 class="font-bold text-lg text-primary">Signing-in</h3>
      <p class="py-4 tex-secondary">
        <span class="text-sm mb-2 inline-block"
          >Paste your account passphrase or generate a new one to sign-in</span
        >
        <label class="input input-bordered flex items-center gap-2">
          <input
            type="text"
            v-model="privateKey"
            class="grow"
            placeholder="Account passphrase"
          />
          <span class="cursor-pointer" @click="copyPrivateKey">
            <svg
              width="24px"
              height="24px"
              viewBox="0 -0.5 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.94605 4.99995L13.2541 4.99995C14.173 5.00498 15.0524 5.37487 15.6986 6.02825C16.3449 6.68163 16.7051 7.56497 16.7001 8.48395V12.716C16.7051 13.6349 16.3449 14.5183 15.6986 15.1717C15.0524 15.825 14.173 16.1949 13.2541 16.2H8.94605C8.02707 16.1949 7.14773 15.825 6.50148 15.1717C5.85522 14.5183 5.495 13.6349 5.50005 12.716L5.50005 8.48495C5.49473 7.5658 5.85484 6.6822 6.50112 6.0286C7.1474 5.375 8.0269 5.00498 8.94605 4.99995Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M10.1671 19H14.9371C17.4857 18.9709 19.5284 16.8816 19.5001 14.333V9.666"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </label>

        <div v-if="newAccountGenerated">
          <span class="text-sm mb-2 mt-4 inline-block">Make sure to save your passphrase somewhere safe!</span>
          <input type="text" v-model="pastedPrivateKey" placeholder="Paste your passphrase to verify!" class="input input-bordered w-full" />
        </div>

        <button @click="signIn" class="btn btn-primary mt-6">
          <svg viewBox="5 0 19 24" class="h-6 w-6" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_105_1855)"> <path d="M9 4.00024H19V18.0002C19 19.1048 18.1046 20.0002 17 20.0002H9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path> <path d="M12 15.0002L15 12.0002M15 12.0002L12 9.00024M15 12.0002H5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path> </g> <defs> <clipPath id="clip0_105_1855"> <rect fill="white" height="24" transform="translate(0 0.000244141)" width="24"></rect> </clipPath> </defs> </g></svg>
          Sign-in
        </button>

        <div v-if="!privateKey" class="mt-8">
        <div class="divider mb-8">OR</div>
          <span class="text-sm mb-2 inline-block">If you don't have an account, generate a new one!</span>
        <button @click="generatePrivateKey" class="btn btn-accent" >
          <svg
        fill="currentColor"
        viewBox="0 0 24 24"
        class="h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path
            id="primary"
            d="M4,12A8,8,0,0,1,18.93,8"
            style="
              fill: none;
              stroke: #000000;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-width: 2;
            "
          ></path>
          <path
            id="primary-2"
            data-name="primary"
            d="M20,12A8,8,0,0,1,5.07,16"
            style="
              fill: none;
              stroke: #000000;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-width: 2;
            "
          ></path>
          <polyline
            id="primary-3"
            data-name="primary"
            points="14 8 19 8 19 3"
            style="
              fill: none;
              stroke: #000000;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-width: 2;
            "
          ></polyline>
          <polyline
            id="primary-4"
            data-name="primary"
            points="10 16 5 16 5 21"
            style="
              fill: none;
              stroke: #000000;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-width: 2;
            "
          ></polyline>
        </g>
      </svg>
          Generate a new account
        </button>
        </div>
      </p>
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script>
  import HDKoinos from "../utils/HDKoinos";
  import { Signer } from "koilib";
  export default {
    name: "ConnectModal",
    data() {
      return {
        privateKey: "",
        publicAddress: "",
        pastedPrivateKey: "",
        newAccountGenerated: false,
      };
    },
    methods: {
      generatePrivateKey() {
        let account = new HDKoinos(
          HDKoinos.randomMnemonic()
        ).deriveKeyAccount(0)
        this.privateKey = account.privateKey;
        this.newAccountGenerated = true;
      },
      copyPrivateKey() {
        navigator.clipboard.writeText(this.privateKey);
        this.$info("Account passphrase copied to clipboard");
      },
      async signIn() {
        if(!this.privateKey || this.privateKey == "") {
          this.$error("Please enter your account passphrase!");
          return;
        }
        else if(this.newAccountGenerated && this.pastedPrivateKey != this.privateKey) {
          this.$error("Passphrase does not match!");
        } else {
          await this.$store.dispatch("signInWithPrivateKey", { privateKey: this.privateKey, address: Signer.fromWif(this.privateKey).getAddress() });
          document.getElementById("connectModal").close();
          this.$info("You are now signed-in!");
        }
      }
    },
  };
</script>

<style>
  input {
    background-color: transparent;
  }
</style>
