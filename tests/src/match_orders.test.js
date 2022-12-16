import "core-js/stable";
import "regenerator-runtime/runtime";
import {waitForAppScreen, zemu, genericTx, networks} from './test.fixture';
import {ethers} from "ethers";

const {exchangeNetworks} = networks

// Transactions can be found on etherscan with https://ropsten.etherscan.io/address/0xd4224267C4aB4a184bD1aa066b3361E70EfBBEaf

test.each(exchangeNetworks)("%s - Match Orders from Contract", async ({name, device, abi, contractAddr}) => {
    await zemu(device, name, async (sim, eth) => {
        const contract = new ethers.Contract(contractAddr, abi);

        // Constants used to create the transaction
        const orderLeft = {
            maker: "0xB07952A55bF9c45C268F37C3631823Df50ac721a",
            makeAsset: {
                assetType: {
                    assetClass: Buffer.from("30450221", "hex"),
                    data: Buffer.from("c45C268F37C3631823Df50ac721a", "hex")
                },
                value: 1000
            },
            taker: "0x411FAF48009A9479b24298B34C9Aa224d7D80805",
            takeAsset: {
                assetType: {
                    assetClass: Buffer.from("69842188", "hex"),
                    data: Buffer.from("433e0b9f9b50dd124ea3041f223a", "hex")
                },
                value: 1000
            },
            salt: 1000,
            start: 1000,
            end: 1000,
            dataType: Buffer.from("45152201", "hex"),
            data: Buffer.from("a922c745e244fa3045022100f6e1", "hex")
        }
        const signatureLeft = Buffer.from("3045022100f6e1a922c745e244fa", "hex")
        const orderRight = {
            maker: "0x45d2bafe56c85433e0b9f9b50dd124ea3041f223",
            makeAsset: {
                assetType: {
                    assetClass: Buffer.from("12354545", "hex"),
                    data: Buffer.from("85433e0b9f9b50dd124ea3041f22", "hex")
                },
                value: 1000
            },
            taker: "0x15557c8b7246C38EE71eA6dc69e4347F5DAc2104",
            takeAsset: {
                assetType: {
                    assetClass: Buffer.from("69e4347F", "hex"),
                    data: Buffer.from("6C38EE71eA6dc69e4347F5DAc210", "hex")
                },
                value: 1000
            },
            salt: 1000,
            start: 1000,
            end: 1000,
            dataType: Buffer.from("78945644", "hex"),
            data: Buffer.from("46C38EE71eA6dc69e4347F5DAA", "hex")
        }
        const signatureRight = Buffer.from("e1a922c745e243045022100f64fa", "hex")

        const {data} = await contract.populateTransaction.matchOrders(orderLeft, signatureLeft, orderRight, signatureRight);

        // Get the generic transaction template
        let unsignedTx = genericTx;
        // Modify `to` to make it interact with the contract
        unsignedTx.to = contractAddr;
        // Modify the attached data
        unsignedTx.data = data;

        // Create serializedTx and remove the "0x" prefix
        const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

        const tx = eth.signTransaction(
            "44'/60'/0'/0",
            serializedTx,
        );

        // Wait for the application to actually load and parse the transaction
        await waitForAppScreen(sim);

        // Navigate the display by pressing the right button 10 times, then pressing both buttons to accept the transaction.
        await sim.navigateAndCompareSnapshots('.', `${device}_${name}_match_orders_from_contract`, [device === "nanos" ? 15 : 7, 0]);

        await tx;
    })();
})

test.each(exchangeNetworks)("%s - Match Orders from Etherscan", async ({name, device, abi, contractAddr}) => {
    await zemu(device, name, async (sim, eth) => {
        // Rather than constructing the tx ourselves, one can can obtain it directly through etherscan.
        // The rawTx of the tx up above is accessible through: https://ropsten.etherscan.io/tx/0xab76826a0b410f001ebd91ea57cc6c5ca48abd672a8cfd06cabde89b4653663b
        // In this case, you could remove the above code, and simply create your tx like so:
        const data = "0xe99a3f800000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000044000000000000000000000000000000000000000000000000000000000000004c00000000000000000000000000000000000000000000000000000000000000880000000000000000000000000c108382b38514349322aa9fead1d7bcbc9aadd450000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002009cec1c50c32e5fc58ff2310d0477bef926bafdab2734c5cfc29fc91ddb258cb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023d235ef0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000173ad2146000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000025ec3bbc85af8b7498c8f5b1cd1c39675431a13c0000000000000000000000000000000000000000000000000000000000002efe0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000013c310749028000aaaebeba0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000076c5855e93bd498b6331652854c4549d34bc3a3000000000000000000000000000000000000000000000000000000000000000fa0000000000000000000000000000000000000000000000000000000000000041d7ee15fe411d851d3c95f483eb7a112a06ad8c19cbaebaf24d2c9b9b5ff1e1927b1c41e156e3a3681bf678c4e222b03a3c8509fba6ba2ae10497b125d70539e91b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000d4224267c4ab4a184bd1aa066b3361e70efbbeaf0000000000000000000000000000000000000000000000000000000000000120000000000000000000000000c108382b38514349322aa9fead1d7bcbc9aadd4500000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023d235ef0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000013c310749028000aaaebeba00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000173ad2146000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000025ec3bbc85af8b7498c8f5b1cd1c39675431a13c0000000000000000000000000000000000000000000000000000000000002efe000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000076c5855e93bd498b6331652854c4549d34bc3a3000000000000000000000000000000000000000000000000000000000000000fa0000000000000000000000000000000000000000000000000000000000000000";

        // Get the generic transaction template
        let unsignedTx = genericTx;
        // Modify `to` to make it interact with the contract
        unsignedTx.to = contractAddr;
        // Modify the attached data
        unsignedTx.data = data;

        // Create serializedTx and remove the "0x" prefix
        const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

        const tx = eth.signTransaction(
            "44'/60'/0'/0",
            serializedTx
        );

        // Wait for the application to actually load and parse the transaction
        await waitForAppScreen(sim);
        // Navigate the display by pressing the right button 10 times, then pressing both buttons to accept the transaction.
        // EDIT THIS: modify `10` to fix the number of screens you are expecting to navigate through.
        await sim.navigateAndCompareSnapshots('.', `${device}_${name}_match_orders_from_etherscan`, [device === "nanos" ? 15 : 7, 0]);

        await tx;
    })();
})