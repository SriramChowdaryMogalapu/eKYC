require('dotenv').config();

let client;
let space;

// Function to initialize Web3.Storage client and space if not already initialized
async function initializeWeb3Storage() {
    if (!client || !space) {
        const { create } = await import('@web3-storage/w3up-client');
        
        // Initialize Web3.Storage client
        client = await create();
        console.log("Web3.storage Client is Initialized!");

        // Login to Web3.Storage account
        const myAccount = await client.login(process.env.WEB3_STORAGE_EMAIL);
        console.log("Check your email to confirm login for Web3.Storage.");

        // Wait for email confirmation and payment plan selection
        while (true) {
            const res = await myAccount.plan.get();
            if (res.ok) break;
            console.log('Waiting for payment plan selection...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Create and provision space
        space = await client.createSpace('my-awesome-space');
        await myAccount.provision(space.did());
        await space.save();
        await client.setCurrentSpace(space.did());

        console.log("Web3.Storage initialized successfully.");
    }
}

// Upload to IPFS function
const uploadToIPFS = async (fileBuffer) => {
    await initializeWeb3Storage(); // Ensure client and space are initialized

    if (!client || !space) {
        throw new Error("Web3.Storage client or space not initialized.");
    }

    console.log("Uploading...");

    // Create a Blob from the file buffer
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });

    try {
        const cid = await client.uploadFile(blob);
        console.log("File uploaded successfully to IPFS with CID:", cid);
        return cid;
    } catch (error) {
        console.error('Error uploading file to Web3.Storage:', error);
        throw error;
    }
};

module.exports = { uploadToIPFS };
