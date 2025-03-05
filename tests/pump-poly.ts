import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PumpPoly } from "../target/types/pump_poly";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";
import { expect } from "chai";

describe("pump-poly", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PumpPoly as Program<PumpPoly>;
  const platform = anchor.web3.Keypair.generate();
  const market = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();
  
  let platformTokenMint: anchor.web3.PublicKey;
  let platformTokenAccount: anchor.web3.PublicKey;
  let userTokenAccount: anchor.web3.PublicKey;

  before(async () => {
    // Create platform token
    platformTokenMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      9
    );

    // Create platform token account
    platformTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      platformTokenMint,
      platform.publicKey
    );

    // Create user token account
    userTokenAccount = await createAccount(
      provider.connection,
      provider.wallet.payer,
      platformTokenMint,
      user.publicKey
    );

    // Mint tokens to user
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      platformTokenMint,
      userTokenAccount,
      provider.wallet.publicKey,
      1000000000 // 1 token
    );
  });

  it("Initializes the platform", async () => {
    const bump = 0;
    
    await program.methods
      .initializePlatform(bump)
      .accounts({
        platform: platform.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([platform])
      .rpc();

    const platformAccount = await program.account.platform.fetch(
      platform.publicKey
    );
    expect(platformAccount.authority).to.eql(provider.wallet.publicKey);
    expect(platformAccount.totalMarkets).to.equal(0);
  });

  it("Creates a prediction market", async () => {
    const question = "Will Bitcoin reach $100,000 by 2024?";
    const endTime = new Date().getTime() / 1000 + 86400; // 24 hours from now
    const bump = 0;

    await program.methods
      .createMarket(question, new anchor.BN(endTime), bump)
      .accounts({
        market: market.publicKey,
        authority: provider.wallet.publicKey,
        yesMint: market.publicKey,
        noMint: market.publicKey,
        yesToken: market.publicKey,
        noToken: market.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([market])
      .rpc();

    const marketAccount = await program.account.market.fetch(market.publicKey);
    expect(marketAccount.question).to.equal(question);
    expect(marketAccount.endTime.toNumber()).to.equal(endTime);
    expect(marketAccount.resolved).to.be.false;
    expect(marketAccount.outcome).to.be.false;
    expect(marketAccount.totalLiquidity.toNumber()).to.equal(0);
  });

  it("Trades shares in the market", async () => {
    const amount = new anchor.BN(100000000); // 0.1 tokens
    const isYes = true;

    await program.methods
      .tradeShares(amount, isYes)
      .accounts({
        market: market.publicKey,
        trader: user.publicKey,
        traderTokenAccount: userTokenAccount,
        marketTokenAccount: platformTokenAccount,
        yesToken: market.publicKey,
        noToken: market.publicKey,
        traderShareAccount: userTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const marketAccount = await program.account.market.fetch(market.publicKey);
    expect(marketAccount.totalLiquidity.toNumber()).to.equal(amount.toNumber());
  });

  it("Resolves the market", async () => {
    // Mock Pyth price feed account
    const priceFeed = anchor.web3.Keypair.generate();

    await program.methods
      .resolveMarket()
      .accounts({
        market: market.publicKey,
        priceFeed: priceFeed.publicKey,
      })
      .rpc();

    const marketAccount = await program.account.market.fetch(market.publicKey);
    expect(marketAccount.resolved).to.be.true;
  });
}); 