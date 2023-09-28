import { Deployments, waitTxConfirmed } from "@alephium/cli";
import {
  DUST_AMOUNT,
  web3,
  Project,
  NodeProvider,
  SignerProvider,
  Contract,
  ONE_ALPH,
} from "@alephium/web3";
import { PrivateKeyWallet } from "@alephium/web3-wallet";
import configuration from "../alephium.config";
import {
  Destroy,
  Draw,
  Walph,
  WalphTimed,
  WalphTimedTypes,
  WithdrawFees,
} from "../artifacts/ts";
import TelegramBot from "node-telegram-bot-api";
import * as fetchRetry from "fetch-retry";


const retryFetch = fetchRetry.default(fetch, {
  retries: 10,
  retryDelay: 1000,
});

const token = process.env.TG_TOKEN;
const chatId = "@walphLottery";
const bot = new TelegramBot(token, { polling: false });

const rtf1 = new Intl.RelativeTimeFormat("en", { style: "short" });
const tenMinutes = 10 * 60 * 1000;
const threeHours = 3 * 3600 * 1000;
const poolOpenTime = 6 * 3600 * 1000;

let messageCounter = 0 //used to check when a message is sent, when all the message are sent, restart the process

function sendMessage(message: string) {
  bot.sendMessage(chatId, message, { parse_mode: "HTML" });
}

async function blitz(group: number, contractName: string) {
  //.deployments contains the info of our `TokenFaucet` deployement, as we need to now the contractId and address
  //This was auto-generated with the `cli deploy` of our `scripts/0_deploy_faucet.ts`
  const deployments = await Deployments.from(
    "./artifacts/.deployments." + networkToUse + ".json"
  );
  //Make sure it match your address group
  const accountGroup = group;
  const deployed = deployments.getDeployedContractResult(
    accountGroup,
    contractName
  );

  const walpheContractId = deployed.contractInstance.contractId;
  const walpheContractAddress = deployed.contractInstance.address;
  let drawInProgress = false;
  const WalphState = WalphTimed.at(walpheContractAddress);

  const initialState = await WalphState.fetchState();

  const blitzChecker = async function () {
    const balanceContract =
      await nodeProvider.addresses.getAddressesAddressBalance(
        walpheContractAddress
      );
    console.log(
      walpheContractAddress +
        " - Balance contract is " +
        balanceContract.balanceHint
    );

    const WalphState = WalphTimed.at(walpheContractAddress);

    const initialState = await WalphState.fetchState();
    const drawTimestamp = Number(initialState.fields.drawTimestamp);
    const prizePot = Number(initialState.fields.balance / ONE_ALPH);
    const numAttendees = Number(initialState.fields.numAttendees);

    const timeLeft = drawTimestamp - Date.now();
    const timeLeftFormat = rtf1.format(
      Math.round(timeLeft / 3600000), // format to hour
      "hours"
    );

    messageCounter += 1

    if (timeLeft <= threeHours && numAttendees > 0) {
      let message =
        "Blitz Walph on group " +
        group +
        "\n\n⏳<b>" +
        timeLeftFormat +
        "</b>\n\n🏆 Prize pot: " +
        prizePot +
        "ℵ\n\n<a href='https://walph.io/blitz'>🧇 Play here</a>";
      sendMessage(message);
    }

    if (timeLeft <= tenMinutes && numAttendees > 0) {
      //ten minutes
      const message =
        "🚨 Blitz Walph on group " +
        group +
        "\n\n😱 <b>10 minutes left till next draw</b>\n\n" +
        "🏆 Prize pot: " +
        prizePot +
        "ℵ\n\n<a href='https://walph.io/blitz'>🧇 Play here</a>";
      sendMessage(message);
    }

    if (timeLeft >= poolOpenTime - tenMinutes) {
      const message =
        "🎟️ Tickets available for blitz Walph on group " +
        group +
        "\n\n🍀 Try your chance <a href='https://walph.io/blitz'>here</a>";
      sendMessage(message);
    }

    console.log(
      walpheContractAddress +
        " - Next draw: " +
        new Date(Number(initialState.fields.drawTimestamp))
    );
  };

  const drawTimestamp = Number(initialState.fields.drawTimestamp);
  const timeLeft = drawTimestamp - Date.now();

  //3 hours
  if (timeLeft >= threeHours){
    console.log(
      "Notification at " + new Date(timeLeft - threeHours + Date.now())
    );
    setTimeout(blitzChecker, timeLeft - threeHours);
  }



  // ten minutes
  if (timeLeft >= tenMinutes){
    console.log(
      "Notification at " + new Date(timeLeft - tenMinutes + Date.now())
    );
    setTimeout(blitzChecker, timeLeft - tenMinutes);
  }

  if (timeLeft >= poolOpenTime - tenMinutes) blitzChecker();
}

const networkToUse = "mainnet";
//Select our network defined in alephium.config.ts
const network = configuration.networks[networkToUse];

//NodeProvider is an abstraction of a connection to the Alephium network
const nodeProvider = new NodeProvider(network.nodeUrl, undefined, retryFetch);

//Sometimes, it's convenient to setup a global NodeProvider for your project:
web3.setCurrentNodeProvider(nodeProvider);

Array.from(Array(4).keys()).forEach((group) => {
  //distribute(configuration.networks[networkToUse].privateKeys[group], group, "Walph");
  //distribute(configuration.networks[networkToUse].privateKeys[group], group, "Walph50HodlAlf");
  blitz(group, "WalphTimed")
})

