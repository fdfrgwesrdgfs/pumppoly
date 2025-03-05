import { ethers } from "hardhat";

async function main() {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    
    // Deploy PlatformToken
    const PlatformToken = await ethers.getContractFactory("PlatformToken");
    const platformToken = await PlatformToken.deploy(deployer.address);
    await platformToken.deployed();
    console.log("PlatformToken deployed to:", platformToken.address);
    
    // Deploy MarketFactory
    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    const marketFactory = await MarketFactory.deploy(platformToken.address);
    await marketFactory.deployed();
    console.log("MarketFactory deployed to:", marketFactory.address);
    
    // Verify contracts on Etherscan
    if (process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying contracts on Etherscan...");
        
        // Wait for a few block confirmations
        await platformToken.deployTransaction.wait(5);
        await marketFactory.deployTransaction.wait(5);
        
        // Verify PlatformToken
        await hre.run("verify:verify", {
            address: platformToken.address,
            constructorArguments: [deployer.address],
        });
        
        // Verify MarketFactory
        await hre.run("verify:verify", {
            address: marketFactory.address,
            constructorArguments: [platformToken.address],
        });
        
        console.log("Contracts verified on Etherscan");
    }
    
    // Save deployment addresses
    const deploymentInfo = {
        platformToken: platformToken.address,
        marketFactory: marketFactory.address,
        deployer: deployer.address,
        network: (await ethers.provider.getNetwork()).name,
        timestamp: new Date().toISOString(),
    };
    
    // Write to deployment.json
    const fs = require("fs");
    fs.writeFileSync(
        "deployment.json",
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("Deployment info saved to deployment.json");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 