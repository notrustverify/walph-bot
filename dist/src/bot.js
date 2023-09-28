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
const poolOpenTime = 6 * 3600 * 1000;
let messageCounter = 0; //used to check when a message is sent, when all the message are sent, restart the process
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
    const blitzChecker = async function () {
        const balanceContract = await nodeProvider.addresses.getAddressesAddressBalance(walpheContractAddress);
        console.log(walpheContractAddress +
            " - Balance contract is " +
            balanceContract.balanceHint);
        const WalphState = ts_1.WalphTimed.at(walpheContractAddress);
        const initialState = await WalphState.fetchState();
        const drawTimestamp = Number(initialState.fields.drawTimestamp);
        const prizePot = Number(initialState.fields.balance / web3_1.ONE_ALPH);
        const numAttendees = Number(initialState.fields.numAttendees);
        const timeLeft = drawTimestamp - Date.now();
        const timeLeftFormat = rtf1.format(Math.round(timeLeft / 3600000), // format to hour
        "hours");
        messageCounter += 1;
        if (timeLeft <= threeHours && numAttendees > 0) {
            let message = "Blitz Walph on group " +
                group +
                "\n\n⏳<b>" +
                timeLeftFormat +
                "</b>\n\n🏆 Prize pot: " +
                prizePot +
                " ℵ\n\n<a href='https://walph.io/blitz'>🧇 Play here</a>";
            sendMessage(message);
        }
        if (timeLeft <= tenMinutes && numAttendees > 0) {
            //ten minutes
            const message = "🚨 Blitz Walph on group " +
                group +
                "\n\n😱 <b>10 minutes left till next draw</b>\n\n" +
                "🏆 Prize pot: " +
                prizePot +
                " ℵ\n\n<a href='https://walph.io/blitz'>🧇 Play here</a>";
            sendMessage(message);
        }
        if (timeLeft >= poolOpenTime - tenMinutes) {
            const message = "🎟️ Tickets available for blitz Walph on group " +
                group +
                "\n\n🍀 Try your chance <a href='https://walph.io/blitz'>here</a>";
            sendMessage(message);
        }
        console.log(walpheContractAddress +
            " - Next draw: " +
            new Date(Number(initialState.fields.drawTimestamp)));
    };
    async function getWinner() {
        const deployments = await cli_1.Deployments.from("./artifacts/.deployments." + networkToUse + ".json");
        //Make sure it match your address group
        const accountGroup = group;
        const deployed = deployments.getDeployedContractResult(accountGroup, contractName);
        const walpheContractAddress = deployed.contractInstance.address;
        const WalphState = ts_1.WalphTimed.at(walpheContractAddress);
        let initialState = await WalphState.fetchState();
        const actualDrawTimestamp = initialState.fields.drawTimestamp;
        const actualNumAttendees = initialState.fields.numAttendees;
        if (actualNumAttendees > 0) {
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
                "drawn" +
                +"\n\n🎉 Winner: " +
                winner +
                "\n\n🍀 Try your chance <a href='https://walph.io/blitz'>here</a>";
            sendMessage(message);
        }
    }
    const drawTimestamp = Number(initialState.fields.drawTimestamp);
    const timeLeft = drawTimestamp - Date.now();
    console.log("Group " + group);
    if (timeLeft > 0) {
        //3 hours
        if (timeLeft >= threeHours) {
            console.log("3 hours - Notification at " +
                new Date(timeLeft - threeHours + Date.now()));
            setTimeout(blitzChecker, timeLeft - threeHours);
        }
        // ten minutes
        if (timeLeft >= tenMinutes) {
            console.log("10 minutes - Notification at " +
                new Date(timeLeft - tenMinutes + Date.now()));
            setTimeout(blitzChecker, timeLeft - tenMinutes);
        }
        console.log("winner - Notification at " + new Date(timeLeft + Date.now()));
        setTimeout(getWinner, 1000);
    }
}
const networkToUse = "mainnet";
//Select our network defined in alephium.config.ts
const network = alephium_config_1.default.networks[networkToUse];
//NodeProvider is an abstraction of a connection to the Alephium network
const nodeProvider = new web3_1.NodeProvider(network.nodeUrl, undefined, retryFetch);
//Sometimes, it's convenient to setup a global NodeProvider for your project:
web3_1.web3.setCurrentNodeProvider(nodeProvider);
Array.from(Array(4).keys()).forEach((group) => {
    //distribute(configuration.networks[networkToUse].privateKeys[group], group, "Walph");
    //distribute(configuration.networks[networkToUse].privateKeys[group], group, "Walph50HodlAlf");
    //blitz(group, "WalphTimed");
});
setTimeout(() => { console.log("dfsfd"); }, 1000);
