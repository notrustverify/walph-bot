"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("@alephium/cli");
const web3_1 = require("@alephium/web3");
const alephium_config_1 = __importDefault(require("../alephium.config"));
const ts_1 = require("../artifacts/ts");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const fetchRetry = __importStar(require("fetch-retry"));
const retryFetch = fetchRetry.default(fetch, {
    retries: 10,
    retryDelay: 10 * 1000,
});
const token = process.env.TG_TOKEN ?? "";
const chatId = "@walphLottery";
const bot = new node_telegram_bot_api_1.default(token, { polling: false });
const tenMinutes = 10 * 60 * 1000;
const threeHours = 3 * 3600 * 1000;
function sendMessage(message) {
    bot.sendMessage(chatId, message, { parse_mode: "HTML" });
}
const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
});
const DIVISIONS = [
    { amount: 60, name: "seconds" },
    { amount: 60, name: "minutes" },
    { amount: 24, name: "hours" },
    { amount: 7, name: "days" },
    { amount: 4.34524, name: "weeks" },
    { amount: 12, name: "months" },
    { amount: Number.POSITIVE_INFINITY, name: "years" },
];
function formatTimeAgo(duration) {
    for (let i = 0; i < DIVISIONS.length; i++) {
        const division = DIVISIONS[i];
        if (Math.abs(duration) < division.amount) {
            return formatter.format(Math.round(duration), division.name);
        }
        duration /= division.amount;
    }
}
async function blitz(group, contractName, urlPath) {
    //.deployments contains the info of our `TokenFaucet` deployement, as we need to now the contractId and address
    //This was auto-generated with the `cli deploy` of our `scripts/0_deploy_faucet.ts`
    async function waitForNewTimestamp(sleepSec) {
        let newState = await WalphState.fetchState();
        const actualDrawTimestamp = newState.fields.drawTimestamp;
        let state = actualDrawTimestamp;
        //console.log("before",actualDrawTimestamp,state)
        while (actualDrawTimestamp === state) {
            newState = await WalphState.fetchState();
            state = newState.fields.drawTimestamp;
            //console.log("during",actualDrawTimestamp,state)
            await (0, web3_1.sleep)(sleepSec * 1000);
        }
        //console.log("after",actualDrawTimestamp,state)
        return Number(state);
    }
    async function messageFomo() {
        try {
            const initialState = await WalphState.fetchState();
            let drawTimestamp = Number(initialState.fields.drawTimestamp);
            const prizePot = Number(initialState.fields.balance / web3_1.ONE_ALPH);
            const numAttendees = Number(initialState.fields.numAttendees);
            let timeLeft = drawTimestamp + tenMinutes - Date.now();
            if (numAttendees > 0 && timeLeft <= tenMinutes && timeLeft > 0) {
                //ten minutes
                const message = "🚨 Blitz Walph on group " +
                    group +
                    "\n\n😱 <b>" +
                    formatTimeAgo(timeLeft / 1000).replace("in", "") +
                    " left till next draw</b>\n\n" +
                    "🏆 Prize pot: " +
                    prizePot +
                    " ℵ\n\n<a href='" +
                    url +
                    "'>🧇 Play here</a>";
                sendMessage(message);
                console.log(message);
            }
            // waiting for new timestamp
            drawTimestamp = await waitForNewTimestamp(240);
        }
        catch (err) {
            console.log(err);
            await (0, web3_1.sleep)(60 * 1000);
        }
        console.log(group +
            " - 10 minutes - Notification at " +
            new Date(timeLeft + Date.now()));
        setTimeout(messageFomo, timeLeft);
    }
    async function messageTimeLeft(whenRun) {
        let drawTimestamp = 0;
        let repeatEvery = 0;
        try {
            const initialState = await WalphState.fetchState();
            repeatEvery = Number(initialState.fields.repeatEvery) / whenRun;
            drawTimestamp = Number(initialState.fields.drawTimestamp);
            const prizePot = Number(initialState.fields.balance / web3_1.ONE_ALPH);
            const numAttendees = Number(initialState.fields.numAttendees);
            let timeLeft = drawTimestamp - Date.now();
            if (numAttendees > 0 &&
                timeLeft <= repeatEvery &&
                timeLeft > 120 * 1000) {
                let message = "Blitz Walph on group " +
                    group +
                    "\n\n⏳<b>" +
                    formatTimeAgo(timeLeft / 1000) +
                    "</b>\n\n🏆 Prize pot: " +
                    prizePot +
                    " ℵ\n\n<a href='" +
                    url +
                    "'>🧇 Play here</a>";
                sendMessage(message);
                console.log(message);
            }
            drawTimestamp = await waitForNewTimestamp(whenRun / 3);
            //arbitrary value, could be changed
        }
        catch (err) {
            console.log(err);
            await (0, web3_1.sleep)(60 * 1000);
        }
        console.log(group +
            " - 3 hours - Notification at " +
            new Date(repeatEvery + Date.now()));
        setTimeout(messageTimeLeft, repeatEvery, whenRun);
    }
    async function getWinner() {
        let drawTimestamp = 0;
        try {
            let initialState = await WalphState.fetchState();
            drawTimestamp = Number(initialState.fields.drawTimestamp);
            const numAttendees = initialState.fields.numAttendees;
            let timeLeft = drawTimestamp - Date.now();
            drawTimestamp = await waitForNewTimestamp(60);
            initialState = await WalphState.fetchState();
            let winner = initialState.fields.lastWinner.toString().slice(0, 6) +
                "..." +
                initialState.fields.lastWinner.toString().slice(-6);
            if (winner === web3_1.ZERO_ADDRESS)
                winner = "No winner yet. Might be your chance";
            if (numAttendees > 0) {
                const message = "🎲 Blitz Walph on group " +
                    group +
                    " drawn" +
                    "\n\n🎉 Winner: " +
                    winner +
                    "\n\n🍀 Try your chance <a href='" +
                    url +
                    "'>here</a>";
                sendMessage(message);
                console.log(message);
            }
            timeLeft = drawTimestamp - Date.now();
        }
        catch (err) {
            console.log(err);
            await (0, web3_1.sleep)(30 * 1000);
        }
        console.log(group + " - winner - Notification at " + new Date(timeLeft + Date.now()));
        setTimeout(getWinner, timeLeft + 1000);
    }
    const deployments = await cli_1.Deployments.from("./artifacts/.deployments." + networkToUse + ".json");
    //Make sure it match your address group
    const url = "https://walph.io/" + urlPath;
    const accountGroup = group;
    const deployed = deployments.getDeployedContractResult(accountGroup, contractName);
    const walpheContractAddress = deployed.contractInstance.address;
    const WalphState = ts_1.WalphTimed.at(walpheContractAddress);
    const initialState = await WalphState.fetchState();
    const drawTimestamp = Number(initialState.fields.drawTimestamp);
    const timeLeft = drawTimestamp - Date.now();
    console.log(group + " - Draw is at " + new Date(drawTimestamp));
    messageTimeLeft(2);
    messageTimeLeft(4);
    // ten minutes
    getWinner();
    messageFomo();
}
let networkToUse = process.argv.slice(2)[1];
if (networkToUse === undefined)
    networkToUse = "mainnet";
//Select our network defined in alephium.config.ts
const network = alephium_config_1.default.networks[networkToUse];
//NodeProvider is an abstraction of a connection to the Alephium network
const nodeProvider = new web3_1.NodeProvider(network.nodeUrl, undefined, retryFetch);
//Sometimes, it's convenient to setup a global NodeProvider for your project:
web3_1.web3.setCurrentNodeProvider(nodeProvider);
const groupArg = parseInt(process.argv.slice(2)[0]);
//distribute(configuration.networks[networkToUse].privateKeys[group], group, "Walph");
//distribute(configuration.networks[networkToUse].privateKeys[group], group, "Walph50HodlAlf");
blitz(groupArg, "WalphTimed:BlitzOneDay", "blitz");
blitz(groupArg, "WalphTimed:BlitzOneDayOneAlph", "blitz1");
blitz(groupArg, "WalphTimed:BlitzThreeDays", "blitz3");
/*draw(configuration.networks[networkToUse].privateKeys[group], group, "WalphTimed:BlitzOneDayOneAlph");
  draw(configuration.networks[networkToUse].privateKeys[group], group, "WalphTimed:BlitzThreeDays");
*/
