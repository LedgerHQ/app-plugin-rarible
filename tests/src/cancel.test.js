import "core-js/stable";
import "regenerator-runtime/runtime";
import {waitForAppScreen, zemu, genericTx, networks} from './test.fixture';
import {ethers} from "ethers";

const {exchangeNetworks} = networks

// Transactions can be found on etherscan with https://ropsten.etherscan.io/address/0xd4224267C4aB4a184bD1aa066b3361E70EfBBEaf

test.each(exchangeNetworks)("%s - Cancel from Contract", async ({name, device, abi, contractAddr}) => {
    await zemu(device, name, async (sim, eth) => {
        const contract = new ethers.Contract(contractAddr, abi);

        // Constants used to create the transaction
        const order = {
            maker: "0x15557c8b7246C38EE71eA6dc69e4347F5DAc2104",
            makeAsset: {
                assetType: {
                    assetClass: Buffer.from("30450221", "hex"),
                    data: Buffer.from("3045022100f6e1a922c745e244fa", "hex")
                },
                value: 1000
            },
            taker: "0x15557c8b7246C38EE71eA6dc69e4347F5DAc2104",
            takeAsset: {
                assetType: {
                    assetClass: Buffer.from("30450221", "hex"),
                    data: Buffer.from("3045022100f6e1a922c745e244fa", "hex")
                },
                value: 1000
            },
            salt: 1000,
            start: 1000,
            end: 1000,
            dataType: Buffer.from("30450221", "hex"),
            data: Buffer.from("3045022100f6e1a922c745e244fa", "hex")
        }

        const {data} = await contract.populateTransaction.cancel(order);

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
        await sim.navigateAndCompareSnapshots('.', `${device}_${name}_cancel_from_contract`, [device === "nanos" ? 9 : 5, 0]);

        await tx;
    })();
})

test.each(exchangeNetworks)("%s - Cancel from Etherscan", async ({name, device, abi, contractAddr}) => {
    await zemu(device, name, async (sim, eth) => {
        // Rather than constructing the tx ourselves, one can can obtain it directly through etherscan.
        // The rawTx of the tx up above is accessible through: https://ropsten.etherscan.io/tx/0x34808927cc7c2b9b0480eb0361e6c68afbc086646050e146c41a2a6e92474503
        // In this case, you could remove the above code, and simply create your tx like so:
        const data = "0xe2864fe30000000000000000000000000000000000000000000000000000000000000020000000000000000000000000d4224267c4ab4a184bd1aa066b3361e70efbbeaf0000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004a0330123d657b446fc1f3ba3e85a221e5d5b9469d1a4ea5c0302a284663346d5520000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023d235ef0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000a1cdfaa4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000002e00000000000000000000000006a94ac200342ac823f909f142a65232e2f0521830000000000000000000000000000000000000000000000000000000000000040d4224267c4ab4a184bd1aa066b3361e70efbbeaf00000000000000000000000100000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000000342f697066732f516d533264366e6538776f5551517544476161697a454c4a4b374167384339577a7466426839465a416946336b650000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d4224267c4ab4a184bd1aa066b3361e70efbbeaf00000000000000000000000000000000000000000000000000000000000027100000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d4224267c4ab4a184bd1aa066b3361e70efbbeaf00000000000000000000000000000000000000000000000000000000000003e80000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000416fbe622847120060c97cbfb7180cd8726b69605510e13e966a1a3d51c94c3ffe17f63abc9961b197b28748cbed9337b3b00e49f2e345d11ef5d9cb7737a546e71b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000002386f26fc10000aaaebeba0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000076c5855e93bd498b6331652854c4549d34bc3a3000000000000000000000000000000000000000000000000000000000000000fa";

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
        await sim.navigateAndCompareSnapshots('.', `${device}_${name}_cancel_from_etherscan`, [device === "nanos" ? 9 : 5, 0]);

        await tx;
    })();
})
