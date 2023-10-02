import { Deployments, waitTxConfirmed } from "@alephium/cli";
import {
  DUST_AMOUNT,
  web3,
  Project,
  NodeProvider,
  SignerProvider,
  Contract,
  ONE_ALPH,
  sleep,
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
  retryDelay: 10 * 1000,
});

const token = process.env.TG_TOKEN ?? "";
const chatId = "@walphLottery";
const bot = new TelegramBot(token, { polling: false });

const rtf1 = new Intl.RelativeTimeFormat("en", { style: "short" });
const tenMinutes = 10 * 60 * 1000;
const threeHours = 3 * 3600 * 1000;

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

  const walpheContractAddress = deployed.contractInstance.address;
  const WalphState = WalphTimed.at(walpheContractAddress);

  const initialState = await WalphState.fetchState();

  async function messageFomo(timeMinutes: number) {
    const initialState = await WalphState.fetchState();
    let drawTimestamp = Number(initialState.fields.drawTimestamp);
    const prizePot = Number(initialState.fields.balance / ONE_ALPH);
    const numAttendees = Number(initialState.fields.numAttendees);

    let timeLeft = drawTimestamp - Date.now();

    if (numAttendees > 0 && timeLeft <= tenMinutes) {
      //ten minutes
      const message =
        "🚨 Blitz Walph on group " +
        group +
        "\n\n😱 <b>" +
        timeMinutes +
        "minutes left till next draw</b>\n\n" +
        "🏆 Prize pot: " +
        prizePot +
        " ℵ\n\n<a href='https://walph.io/blitz'>🧇 Play here</a>";
      sendMessage(message);

    }
    
    if(timeLeft <= tenMinutes){
      drawTimestamp = await waitForNewTimestamp(1400) // waiting for new timestamp
        timeLeft = drawTimestamp - Date.now();
  }

    console.log(
      group+" - 10 minutes - Notification at " +
        new Date(timeLeft - tenMinutes + Date.now())
    );
    setTimeout(messageTimeLeft, timeLeft - tenMinutes, 10);
  }


  async function waitForNewTimestamp(sleepSec){
    let newState = await WalphState.fetchState();
    const actualDrawTimestamp = initialState.fields.drawTimestamp;


      let state = newState.fields.drawTimestamp;
      while (actualDrawTimestamp === state) {
        newState = await WalphState.fetchState();
        state = newState.fields.drawTimestamp;
        console.log("sleep")
        await sleep(sleepSec * 1000);
      }

      return Number(state)
  }

  async function messageTimeLeft() {
    const initialState = await WalphState.fetchState();
    let drawTimestamp = Number(initialState.fields.drawTimestamp);
    const prizePot = Number(initialState.fields.balance / ONE_ALPH);
    const numAttendees = Number(initialState.fields.numAttendees);

    let timeLeft = drawTimestamp - Date.now();
    const timeLeftFormat = rtf1.format(
      Math.round(timeLeft / 3600000), // format to hour
      "hours"
    );

    if (numAttendees > 0 && timeLeft <= threeHours) {
      let message =
        "Blitz Walph on group " +
        group +
        "\n\n⏳<b>" +
        timeLeftFormat +
        "</b>\n\n🏆 Prize pot: " +
        prizePot +
        " ℵ\n\n<a href='https://walph.io/blitz'>🧇 Play here</a>";
      sendMessage(message);
      //console.log("send message")
    }


    if(timeLeft <= threeHours){
        drawTimestamp = await waitForNewTimestamp(1200) // waiting for new timestamp
          timeLeft = drawTimestamp - Date.now();
    }

    console.log(
      group+" - 3 hours - Notification at " +
        new Date(timeLeft - threeHours + Date.now())
    );
    setTimeout(messageTimeLeft, timeLeft - threeHours);
  }

  async function getWinner() {
    let initialState = await WalphState.fetchState();
    let drawTimestamp = Number(initialState.fields.drawTimestamp);
    const actualNumAttendees = initialState.fields.numAttendees;
    let timeLeft = drawTimestamp - Date.now();

    if (actualNumAttendees > 0 && timeLeft <= tenMinutes) {
      drawTimestamp = await waitForNewTimestamp(30)

      initialState = await WalphState.fetchState();
      const winner =
        initialState.fields.lastWinner.toString().slice(0, 6) +
        "..." +
        initialState.fields.lastWinner.toString().slice(-6);

      const message =
        "🎲 Blitz Walph on group " +
        group +
        " drawn" +
        "\n\n🎉 Winner: " +
        winner +
        "\n\n🍀 Try your chance <a href='https://walph.io/blitz'>here</a>";
      sendMessage(message);
    }
    
    timeLeft = drawTimestamp - Date.now();

    console.log(
      group+" - winner - Notification at " +
        new Date(timeLeft - tenMinutes + Date.now())
    );
    setTimeout(getWinner, timeLeft - tenMinutes );
  }

  const drawTimestamp = Number(initialState.fields.drawTimestamp);
  const timeLeft = drawTimestamp - Date.now();

  console.log(group+" - Draw is at "+ new Date(drawTimestamp))
  if (timeLeft > 0) {
    //3 hours
   messageTimeLeft()
    

    // ten minutes
    messageFomo(10)
    getWinner()
    
  }
}

const networkToUse = "mainnet";
//Select our network defined in alephium.config.ts
const network = configuration.networks[networkToUse];

//NodeProvider is an abstraction of a connection to the Alephium network
const nodeProvider = new NodeProvider(network.nodeUrl, undefined, retryFetch);
//Sometimes, it's convenient to setup a global NodeProvider for your project:
web3.setCurrentNodeProvider(nodeProvider);

const groupArg = parseInt(process.argv.slice(2)[0])

  //distribute(configuration.networks[networkToUse].privateKeys[group], group, "Walph");
  //distribute(configuration.networks[networkToUse].privateKeys[group], group, "Walph50HodlAlf");

blitz(groupArg, "WalphTimed");


