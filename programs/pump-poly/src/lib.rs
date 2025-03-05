use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use pyth_sdk_solana::load_price_feed_from_account_info;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod pump_poly {
    use super::*;

    // Initialize platform token
    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        bump: u8,
    ) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.authority = ctx.accounts.authority.key();
        platform.bump = bump;
        platform.total_markets = 0;
        Ok(())
    }

    // Create a new prediction market
    pub fn create_market(
        ctx: Context<CreateMarket>,
        question: String,
        end_time: i64,
        bump: u8,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.question = question;
        market.end_time = end_time;
        market.bump = bump;
        market.resolved = false;
        market.outcome = false;
        market.total_liquidity = 0;
        
        // Create Yes and No token accounts
        let yes_token = &mut ctx.accounts.yes_token;
        let no_token = &mut ctx.accounts.no_token;
        
        // Initialize token accounts
        token::initialize_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::InitializeAccount {
                    account: yes_token.to_account_info(),
                    mint: ctx.accounts.yes_mint.to_account_info(),
                    authority: market.to_account_info(),
                },
            )?,
            9,
            &ctx.accounts.authority.key(),
            false,
        )?;

        token::initialize_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::InitializeAccount {
                    account: no_token.to_account_info(),
                    mint: ctx.accounts.no_mint.to_account_info(),
                    authority: market.to_account_info(),
                },
            )?,
            9,
            &ctx.accounts.authority.key(),
            false,
        )?;

        Ok(())
    }

    // Trade shares in the market
    pub fn trade_shares(
        ctx: Context<TradeShares>,
        amount: u64,
        is_yes: bool,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, ErrorCode::MarketAlreadyResolved);
        require!(amount > 0, ErrorCode::InvalidAmount);

        // Calculate fee (0.3%)
        let fee = amount.checked_mul(3).unwrap().checked_div(1000).unwrap();
        let amount_after_fee = amount.checked_sub(fee).unwrap();

        // Transfer platform tokens from trader to market
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.trader_token_account.to_account_info(),
                to: ctx.accounts.market_token_account.to_account_info(),
                authority: ctx.accounts.trader.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        // Calculate output amount
        let output_amount = calculate_output_amount(
            amount_after_fee,
            market.total_liquidity,
            if is_yes {
                ctx.accounts.yes_token.amount
            } else {
                ctx.accounts.no_token.amount
            },
        );

        // Transfer Yes/No tokens to trader
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: if is_yes {
                    ctx.accounts.yes_token.to_account_info()
                } else {
                    ctx.accounts.no_token.to_account_info()
                },
                to: ctx.accounts.trader_share_account.to_account_info(),
                authority: market.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, output_amount)?;

        Ok(())
    }

    // Resolve market using Pyth price feed
    pub fn resolve_market(ctx: Context<ResolveMarket>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, ErrorCode::MarketAlreadyResolved);
        require!(
            Clock::get()?.unix_timestamp >= market.end_time,
            ErrorCode::MarketNotEnded
        );

        // Get price from Pyth feed
        let price_feed = load_price_feed_from_account_info(&ctx.accounts.price_feed)
            .map_err(|_| ErrorCode::InvalidPriceFeed)?;
        
        let current_price = price_feed
            .get_current_price()
            .ok_or(ErrorCode::InvalidPriceFeed)?;

        // Resolve market based on price
        market.outcome = current_price.price >= 0;
        market.resolved = true;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 8,
    )]
    pub platform: Account<'info, Platform>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 4 + 200 + 8 + 1 + 1 + 8 + 1,
    )]
    pub market: Account<'info, Market>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = market,
        space = 82,
    )]
    pub yes_mint: Account<'info, token::Mint>,
    
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = market,
        space = 82,
    )]
    pub no_mint: Account<'info, token::Mint>,
    
    #[account(
        init,
        payer = authority,
        token::mint = yes_mint,
        token::authority = market,
        space = 165,
    )]
    pub yes_token: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        token::mint = no_mint,
        token::authority = market,
        space = 165,
    )]
    pub no_token: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TradeShares<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    #[account(mut)]
    pub trader: Signer<'info>,
    
    #[account(mut)]
    pub trader_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub market_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub yes_token: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub no_token: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub trader_share_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    /// CHECK: This is the Pyth price feed account
    pub price_feed: AccountInfo<'info>,
}

#[account]
pub struct Platform {
    pub authority: Pubkey,
    pub bump: u8,
    pub total_markets: u64,
}

#[account]
pub struct Market {
    pub question: String,
    pub end_time: i64,
    pub bump: u8,
    pub resolved: bool,
    pub outcome: bool,
    pub total_liquidity: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Market is already resolved")]
    MarketAlreadyResolved,
    
    #[msg("Invalid amount")]
    InvalidAmount,
    
    #[msg("Market has not ended")]
    MarketNotEnded,
    
    #[msg("Invalid price feed")]
    InvalidPriceFeed,
}

fn calculate_output_amount(
    amount_in: u64,
    total_liquidity: u64,
    total_supply: u64,
) -> u64 {
    if total_supply == 0 {
        return amount_in;
    }
    
    amount_in
        .checked_mul(total_supply)
        .unwrap()
        .checked_div(total_liquidity.checked_add(amount_in).unwrap())
        .unwrap()
} 