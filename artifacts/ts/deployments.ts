/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { RunScriptResult, DeployContractExecutionResult } from "@alephium/cli";
import { NetworkId } from "@alephium/web3";
import {
  WalphTimed,
  WalphTimedInstance,
  WalphTimedToken,
  WalphTimedTokenInstance,
} from ".";
import { default as mainnetDeployments } from "../.deployments.mainnet.json";
import { default as devnetDeployments } from "../.deployments.devnet.json";

export type Deployments = {
  deployerAddress: string;
  contracts: {
    WalphTimed_BlitzOneDay: DeployContractExecutionResult<WalphTimedInstance>;
    WalphTimed_BlitzOneDayOneAlph: DeployContractExecutionResult<WalphTimedInstance>;
    WalphTimed_BlitzThreeDays: DeployContractExecutionResult<WalphTimedInstance>;
    WalphTimedToken_BlitzThreeDaysAlf: DeployContractExecutionResult<WalphTimedTokenInstance>;
    WalphTimedToken_BlitzThreeDaysAyin: DeployContractExecutionResult<WalphTimedTokenInstance>;
  };
};

function toDeployments(json: any): Deployments {
  const contracts = {
    WalphTimed_BlitzOneDay: {
      ...json.contracts["WalphTimed:BlitzOneDay"],
      contractInstance: WalphTimed.at(
        json.contracts["WalphTimed:BlitzOneDay"].contractInstance.address
      ),
    },
    WalphTimed_BlitzOneDayOneAlph: {
      ...json.contracts["WalphTimed:BlitzOneDayOneAlph"],
      contractInstance: WalphTimed.at(
        json.contracts["WalphTimed:BlitzOneDayOneAlph"].contractInstance.address
      ),
    },
    WalphTimed_BlitzThreeDays: {
      ...json.contracts["WalphTimed:BlitzThreeDays"],
      contractInstance: WalphTimed.at(
        json.contracts["WalphTimed:BlitzThreeDays"].contractInstance.address
      ),
    },
    WalphTimedToken_BlitzThreeDaysAlf: {
      ...json.contracts["WalphTimedToken:BlitzThreeDaysAlf"],
      contractInstance: WalphTimedToken.at(
        json.contracts["WalphTimedToken:BlitzThreeDaysAlf"].contractInstance
          .address
      ),
    },
    WalphTimedToken_BlitzThreeDaysAyin: {
      ...json.contracts["WalphTimedToken:BlitzThreeDaysAyin"],
      contractInstance: WalphTimedToken.at(
        json.contracts["WalphTimedToken:BlitzThreeDaysAyin"].contractInstance
          .address
      ),
    },
  };
  return {
    ...json,
    contracts: contracts as Deployments["contracts"],
  };
}

export function loadDeployments(
  networkId: NetworkId,
  deployerAddress?: string
): Deployments {
  const deployments =
    networkId === "mainnet"
      ? mainnetDeployments
      : networkId === "devnet"
      ? devnetDeployments
      : undefined;
  if (deployments === undefined) {
    throw Error("The contract has not been deployed to the " + networkId);
  }
  const allDeployments = Array.isArray(deployments)
    ? deployments
    : [deployments];
  if (deployerAddress === undefined) {
    if (allDeployments.length > 1) {
      throw Error(
        "The contract has been deployed multiple times on " +
          networkId +
          ", please specify the deployer address"
      );
    } else {
      return toDeployments(allDeployments[0]);
    }
  }
  const result = allDeployments.find(
    (d) => d.deployerAddress === deployerAddress
  );
  if (result === undefined) {
    throw Error("The contract deployment result does not exist");
  }
  return toDeployments(result);
}
