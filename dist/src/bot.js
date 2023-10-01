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
const rtf1 = new Intl.RelativeTimeFormat("en", { style: "short" });
const tenMinutes = 10 * 60 * 1000;
const threeHours = 3 * 3600 * 1000;
function sendMessage(message) {
    bot.sendMessage(chatId, message, { parse_mode: "HTML" });
}
async function blitz(group, contractName) {
    //.deployments contains the info of our `TokenFaucet` deployement, as we need to now the contractId and address
    //This was auto-generated with the `cli deploy` of our `scripts/0_deploy_faucet.ts`
    const deployments = await cli_1.Deployments.from("./artifacts/.deployments." + networkToUse + ".json");
    //Make sure it match your address group
    const accountGroup = group;
    const deployed = deployments.getDeployedContractResult(accountGroup, contractName);
    const walpheContractAddress = deployed.contractInstance.address;
    const WalphState = ts_1.WalphTimed.at(walpheContractAddress);
    const initialState = await WalphState.fetchState();
    async function messageFomo(timeMinutes) {
        const initialState = await WalphState.fetchState();
        const drawTimestamp = Number(initialState.fields.drawTimestamp);
        const prizePot = Number(initialState.fields.balance / web3_1.ONE_ALPH);
        const numAttendees = Number(initialState.fields.numAttendees);
        const timeLeft = drawTimestamp - Date.now();
        if (numAttendees > 0 && timeLeft <= threeHours) {
            //ten minutes
            const message = "🚨 Blitz Walph on group " +
                group +
                "\n\n😱 <b>" +
                timeMinutes +
                "minutes left till next draw</b>\n\n" +
                "🏆 Prize pot: " +
                prizePot +
                " ℵ\n\n<a href='https://walph.io/blitz'>🧇 Play here</a>";
            sendMessage(message);
        }
        console.log(group + " - 3 hours - Notification at " +
            new Date(timeLeft - threeHours + Date.now()));
        setTimeout(messageTimeLeft, timeLeft - threeHours);
    }
    async function messageTimeLeft() {
        const initialState = await WalphState.fetchState();
        const drawTimestamp = Number(initialState.fields.drawTimestamp);
        const prizePot = Number(initialState.fields.balance / web3_1.ONE_ALPH);
        const numAttendees = Number(initialState.fields.numAttendees);
        const timeLeft = drawTimestamp - Date.now();
        const timeLeftFormat = rtf1.format(Math.round(timeLeft / 3600000), // format to hour
        "hours");
        if (numAttendees > 0 && timeLeft <= tenMinutes) {
            let message = "Blitz Walph on group " +
                group +
                "\n\n⏳<b>" +
                timeLeftFormat +
                "</b>\n\n🏆 Prize pot: " +
                prizePot +
                " ℵ\n\n<a href='https://walph.io/blitz'>🧇 Play here</a>";
            sendMessage(message);
        }
        console.log(group + " - 10 minutes - Notification at " +
            new Date(timeLeft - tenMinutes + Date.now()));
        setTimeout(messageFomo, timeLeft - tenMinutes, 10);
    }
    async function getWinner() {
        let initialState = await WalphState.fetchState();
        const actualDrawTimestamp = initialState.fields.drawTimestamp;
        const actualNumAttendees = initialState.fields.numAttendees;
        const timeLeft = drawTimestamp - Date.now();
        if (actualNumAttendees > 0 && timeLeft <= tenMinutes) {
            let newState = await WalphState.fetchState();
            let state = newState.fields.drawTimestamp;
            while (actualDrawTimestamp === state) {
                newState = await WalphState.fetchState();
                state = newState.fields.drawTimestamp;
                await (0, web3_1.sleep)(10 * 1000);
            }
            initialState = await WalphState.fetchState();
            const winner = initialState.fields.lastWinner.toString().slice(0, 6) +
                "..." +
                initialState.fields.lastWinner.toString().slice(-6);
            const message = "🎲 Blitz Walph on group " +
                group +
                " drawn" +
                "\n\n🎉 Winner: " +
                winner +
                "\n\n🍀 Try your chance <a href='https://walph.io/blitz'>here</a>";
            sendMessage(message);
        }
        console.log(group + " - winner - Notification at " +
            new Date(timeLeft - tenMinutes + Date.now()));
        setTimeout(getWinner, timeLeft - tenMinutes);
    }
    const drawTimestamp = Number(initialState.fields.drawTimestamp);
    const timeLeft = drawTimestamp - Date.now();
    console.log(group + " - Draw is at " + new Date(drawTimestamp));
    if (timeLeft > 0) {
        //3 hours
        messageTimeLeft();
        // ten minutes
        messageFomo(10);
        getWinner();
    }
}
const networkToUse = "mainnet";
//Select our network defined in alephium.config.ts
const network = alephium_config_1.default.networks[networkToUse];
//NodeProvider is an abstraction of a connection to the Alephium network
const nodeProvider = new web3_1.NodeProvider(network.nodeUrl, undefined, retryFetch);
//Sometimes, it's convenient to setup a global NodeProvider for your project:
web3_1.web3.setCurrentNodeProvider(nodeProvider);
const groupArg = parseInt(process.argv.slice(2)[0]);
//distribute(configuration.networks[networkToUse].privateKeys[group], group, "Walph");
//distribute(configuration.networks[networkToUse].privateKeys[group], group, "Walph50HodlAlf");
blitz(groupArg, "WalphTimed");
