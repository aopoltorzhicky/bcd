import { DAppClient, ColorMode, NetworkType } from "@airgap/beacon-sdk";
// import { PermissionScope } from "@airgap/beacon-types";
import TZKTBlockExplorer from "@/utils/tzkt";

const CORRECT_NETWORK_TYPES = {
    "sandboxnet": NetworkType.CUSTOM,
    "rollupnet": NetworkType.CUSTOM,
}

export function isCustom(network) {
    return network === NetworkType.CUSTOM;
}

export class Wallet {
    static async getWallet(network, eventHandlers = null) {
        if (Wallet.wallet) return Wallet.wallet

        Wallet.wallet = new DAppClient({
            name: "Better Call Dev",
            // eventHandlers,
            // preferredNetwork: network in CORRECT_NETWORK_TYPES ? CORRECT_NETWORK_TYPES[network] : NetworkType.GHOSTNET,
            // blockExplorer: new TZKTBlockExplorer(),
        });

        // await Wallet.setTheme();

        return Wallet.wallet
    }

    static changeWalletState(cb) {
        const arrayChangeHandler = {
            set() {
                cb()
                return true
            }
        };
        Wallet.changer = new Proxy([], arrayChangeHandler);
    }

    static async getClient(network, eventHandlers, isLast) {
        let client;

        if (Wallet.wallet) {
            console.log("it's a wallet");
            client = Wallet.wallet;
            await Wallet.setTheme();
        } else {
            console.log("it's not a wallet");
            client = await Wallet.getWallet(network, eventHandlers)
        }

        if (!isLast) {
            console.log("Not isLast");
            Wallet.isPermissionGiven = false            
            await this.getNewPermissions(network, isLast);            
        } else {
            console.log("isLast");
            if (!Wallet.isPermissionGiven) {
                console.log("No permissions given");
                const permissions = await this.getNewPermissions(network, isLast);
            }
        }

        Wallet.changer[0] = 'connect' + Wallet.wallet.requestCounter[0]

        return client;
    }

    static getLastUsedAccount() {
        const accounts = localStorage.getItem('beacon:accounts');
        if(!accounts) return null

        const communicationPeersDapp = localStorage.getItem('beacon:communication-peers-dapp');
        const postmessagePeersDapp =  localStorage.getItem('beacon:postmessage-peers-dapp');
        let peers = [];

        if(communicationPeersDapp) {
            peers = [...peers, ...JSON.parse(communicationPeersDapp)]
        }

        if(postmessagePeersDapp) {
            peers = [...peers, ...JSON.parse(postmessagePeersDapp)]
        }

        const parsedAccounts = JSON.parse(accounts);
        const connectionTimes = parsedAccounts.map(item => item.connectedAt);
        const recentConnectionTime = Math.max(...connectionTimes);
        const lastAccount = parsedAccounts.find(item => item.connectedAt === recentConnectionTime);
        const extension = peers.find(item => item.extensionId === lastAccount.origin.id || item.publicKey  === lastAccount.origin.id);

        if(extension) {
            lastAccount.walletName = extension.name
        }

        return lastAccount;
    }

    static async getNewPermissions(network, isLast) {
        const rpcUrl = window.config.rpc_endpoints[network];
        const type = CORRECT_NETWORK_TYPES[network] || network;
        // if (!isLast) {
        //     console.log("getNewPermissions !isLast");
        //     await Wallet.wallet.clearActiveAccount();
        // } else {
        //     console.log("getNewPermissions isLast");
        //     await Wallet.wallet.setActiveAccount(Wallet.getLastUsedAccount());
        // }
        const activeAccount = await this.wallet.getActiveAccount();
        
        return this.wallet.requestPermissions();

        // return new Promise((resolve, reject) => {
        //     if(activeAccount) {
        //         console.log("getNewPermissions activeAccount");
        //         Wallet.isPermissionGiven = true;
        //         return resolve();
        //     }
        //     console.log("getNewPermissions !activeAccount");
        //     // this.wallet.requestPermissions({
        //     //     network: {
        //     //         type: type in CORRECT_NETWORK_TYPES ? CORRECT_NETWORK_TYPES[type] : type,
        //     //         name: network,
        //     //         rpcUrl,
        //     //     },
        //     // })
        //     // const scopes = [
        //     //     PermissionScope.OPERATION_REQUEST,
        //     //     PermissionScope.SIGN,
        //     // ];

        //     this.wallet.requestPermissions()
        //     .then(() => {
        //         console.log(".then requestPermissions");
        //         Wallet.isPermissionGiven = true;
        //         resolve();
        //     })
        //     .catch(e => {
        //         console.log(".catch requestPermissions");
        //         if (e.title && e.title.toUpperCase() === 'ABORTED') {
        //             resolve();
        //         } else {
        //             console.log(e);
        //             reject();
        //         }
        //     })
        // })
    }

    static async setTheme() {
        if (!Wallet.wallet) return;
        let mode = localStorage.getItem("dark") === 'true' ? ColorMode.DARK : ColorMode.LIGHT;
        await Wallet.wallet.setColorMode(mode);
    }
}
Wallet.changer = {}