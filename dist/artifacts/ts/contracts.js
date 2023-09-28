"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractByCodeHash = void 0;
const _1 = require(".");
let contracts = undefined;
function getContractByCodeHash(codeHash) {
    if (contracts === undefined) {
        contracts = [_1.Walf, _1.Walph, _1.Walph50HodlAlf, _1.WalphTimed];
    }
    const c = contracts.find((c) => c.contract.codeHash === codeHash || c.contract.codeHashDebug === codeHash);
    if (c === undefined) {
        throw new Error("Unknown code with code hash: " + codeHash);
    }
    return c.contract;
}
exports.getContractByCodeHash = getContractByCodeHash;
