"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalphTimedTokenInstance = exports.WalphTimedToken = void 0;
const web3_1 = require("@alephium/web3");
const WalphTimedToken_ral_json_1 = __importDefault(require("../WalphTimedToken.ral.json"));
const contracts_1 = require("./contracts");
class Factory extends web3_1.ContractFactory {
    constructor() {
        super(...arguments);
        this.eventIndex = {
            TicketBought: 0,
            PoolOpen: 1,
            PoolClose: 2,
            Destroy: 3,
            Winner: 4,
            PoolDrawn: 5,
            NewRepeatEvery: 6,
            PoolFull: 7,
        };
        this.consts = {
            ErrorCodes: {
                PoolFull: BigInt(0),
                PoolAlreadyClose: BigInt(1),
                PoolAlreadyOpen: BigInt(2),
                PoolClosed: BigInt(3),
                InvalidCaller: BigInt(4),
                PoolNotFull: BigInt(6),
                InvalidAmount: BigInt(7),
                TimestampOrAttendeesNotReached: BigInt(8),
                NoAttendees: BigInt(9),
                NotValidAddress: BigInt(10),
                TimestampReached: BigInt(11),
            },
        };
        this.tests = {
            random: async (params) => {
                return (0, web3_1.testMethod)(this, "random", params);
            },
            distributePrize: async (params) => {
                return (0, web3_1.testMethod)(this, "distributePrize", params);
            },
            getPoolState: async (params) => {
                return (0, web3_1.testMethod)(this, "getPoolState", params);
            },
            getPoolSize: async (params) => {
                return (0, web3_1.testMethod)(this, "getPoolSize", params);
            },
            getBalance: async (params) => {
                return (0, web3_1.testMethod)(this, "getBalance", params);
            },
            getTicketPrice: async (params) => {
                return (0, web3_1.testMethod)(this, "getTicketPrice", params);
            },
            withdraw: async (params) => {
                return (0, web3_1.testMethod)(this, "withdraw", params);
            },
            draw: async (params) => {
                return (0, web3_1.testMethod)(this, "draw", params);
            },
            buyTicket: async (params) => {
                return (0, web3_1.testMethod)(this, "buyTicket", params);
            },
            closePool: async (params) => {
                return (0, web3_1.testMethod)(this, "closePool", params);
            },
            openPool: async (params) => {
                return (0, web3_1.testMethod)(this, "openPool", params);
            },
            destroyPool: async (params) => {
                return (0, web3_1.testMethod)(this, "destroyPool", params);
            },
            changeRepeatEvery: async (params) => {
                return (0, web3_1.testMethod)(this, "changeRepeatEvery", params);
            },
        };
    }
    getInitialFieldsWithDefaultValues() {
        return this.contract.getInitialFieldsWithDefaultValues();
    }
    at(address) {
        return new WalphTimedTokenInstance(address);
    }
}
// Use this object to test and deploy the contract
exports.WalphTimedToken = new Factory(web3_1.Contract.fromJson(WalphTimedToken_ral_json_1.default, "=6-2=2-1+2=4-1+7=2-1=1+0=3-1+9=2-2+d2=2-2+db=2-1+0=3-2+5=1-2=1+1fc=3-1+1=3-1+7=2+3a=2+4f=11-1+4=30+0016007e0207726e6420697320=1114", "a4be006787d53653d252eda4baeecb407e1137fc30f83e715e742e8edf7db863"));
// Use this class to interact with the blockchain
class WalphTimedTokenInstance extends web3_1.ContractInstance {
    constructor(address) {
        super(address);
        this.methods = {
            getPoolState: async (params) => {
                return (0, web3_1.callMethod)(exports.WalphTimedToken, this, "getPoolState", params === undefined ? {} : params, contracts_1.getContractByCodeHash);
            },
            getPoolSize: async (params) => {
                return (0, web3_1.callMethod)(exports.WalphTimedToken, this, "getPoolSize", params === undefined ? {} : params, contracts_1.getContractByCodeHash);
            },
            getBalance: async (params) => {
                return (0, web3_1.callMethod)(exports.WalphTimedToken, this, "getBalance", params === undefined ? {} : params, contracts_1.getContractByCodeHash);
            },
            getTicketPrice: async (params) => {
                return (0, web3_1.callMethod)(exports.WalphTimedToken, this, "getTicketPrice", params === undefined ? {} : params, contracts_1.getContractByCodeHash);
            },
        };
    }
    async fetchState() {
        return (0, web3_1.fetchContractState)(exports.WalphTimedToken, this);
    }
    async getContractEventsCurrentCount() {
        return (0, web3_1.getContractEventsCurrentCount)(this.address);
    }
    subscribeTicketBoughtEvent(options, fromCount) {
        return (0, web3_1.subscribeContractEvent)(exports.WalphTimedToken.contract, this, options, "TicketBought", fromCount);
    }
    subscribePoolOpenEvent(options, fromCount) {
        return (0, web3_1.subscribeContractEvent)(exports.WalphTimedToken.contract, this, options, "PoolOpen", fromCount);
    }
    subscribePoolCloseEvent(options, fromCount) {
        return (0, web3_1.subscribeContractEvent)(exports.WalphTimedToken.contract, this, options, "PoolClose", fromCount);
    }
    subscribeDestroyEvent(options, fromCount) {
        return (0, web3_1.subscribeContractEvent)(exports.WalphTimedToken.contract, this, options, "Destroy", fromCount);
    }
    subscribeWinnerEvent(options, fromCount) {
        return (0, web3_1.subscribeContractEvent)(exports.WalphTimedToken.contract, this, options, "Winner", fromCount);
    }
    subscribePoolDrawnEvent(options, fromCount) {
        return (0, web3_1.subscribeContractEvent)(exports.WalphTimedToken.contract, this, options, "PoolDrawn", fromCount);
    }
    subscribeNewRepeatEveryEvent(options, fromCount) {
        return (0, web3_1.subscribeContractEvent)(exports.WalphTimedToken.contract, this, options, "NewRepeatEvery", fromCount);
    }
    subscribePoolFullEvent(options, fromCount) {
        return (0, web3_1.subscribeContractEvent)(exports.WalphTimedToken.contract, this, options, "PoolFull", fromCount);
    }
    subscribeAllEvents(options, fromCount) {
        return (0, web3_1.subscribeContractEvents)(exports.WalphTimedToken.contract, this, options, fromCount);
    }
    async multicall(calls) {
        return (await (0, web3_1.multicallMethods)(exports.WalphTimedToken, this, calls, contracts_1.getContractByCodeHash));
    }
}
exports.WalphTimedTokenInstance = WalphTimedTokenInstance;
