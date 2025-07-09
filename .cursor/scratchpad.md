# Web3 Migration Project: Spotify-like Music Platform to Zora Coins Integration

## Background and Motivation

We are migrating a Spotify-like music streaming application from Web2 to Web3 by integrating Zora Coins V4 contract for tokenization. The current application is built with:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Supabase for authentication and database
- **Features**: Song upload, playbook, search, liked songs, user authentication
- **Current Architecture**: Traditional web2 with centralized data storage

**Goal**: Create a SIMPLE functional demo that properly implements Zora Coins V4 features and requirements.

## CoinV4 Features → Existing Components Mapping

### 🎯 **Direct Integration Points**

#### **1. Header.tsx** → **Wallet Connection for CoinV4**
- **Current**: Has login/logout with Supabase auth
- **CoinV4 Integration**: Add wallet connect button alongside existing auth
- **Required Functions**: Need wallet to call `setPayoutRecipient()`, `setContractURI()`, factory functions
- **UI Enhancement**: Show connected wallet address, network status

#### **2. UploadModal.tsx** → **Coin Creation with Metadata**
- **Current**: Collects (title, author, mp3, image) and uploads to Supabase
- **CoinV4 Integration**: 
  - Add coin creation form fields (coin name, symbol, initial supply)
  - Implement `PoolConfiguration` setup (fee tier, tick spacing)
  - Call factory.createCoin() with proper metadata URI
  - Set artist as payout recipient via `setPayoutRecipient()`
  - Enable multi-ownership (platform + artist)
- **UI Enhancement**: "Create Artist Coin" checkbox/section in existing form

#### **3. SongItem.tsx** → **Coin Data Display & Trading**
- **Current**: Shows (title, author, image, play button)
- **CoinV4 Integration**:
  - Display coin address, pool key from `getPoolKey()`
  - Show real-time price from Uniswap V4 pool
  - Add "Buy/Sell Coin" buttons
  - Monitor `Swapped` events for trading activity
  - Display `CoinMarketRewardsV4` data (creator rewards)
- **UI Enhancement**: Coin info section below existing song info

#### **4. Player.tsx & PlayerContent.tsx** → **Real-time Coin Performance**
- **Current**: Shows currently playing song with controls
- **CoinV4 Integration**:
  - Display live coin price while song plays
  - Show recent trading activity via hook events
  - Real-time reward distribution data
  - "Invest in Artist" CTA during playback
- **UI Enhancement**: Coin ticker/performance overlay

#### **5. Types.ts** → **Extended Song Interface**
```typescript
interface Song {
  // Existing fields
  id: string;
  user_id: string;
  author: string;
  title: string;
  song_path: string;
  image_path: string;
  
  // New CoinV4 fields
  coin_address?: string;
  pool_key?: string;
  currency?: string;
  platform_referrer?: string;
  payout_recipient?: string;
  contract_uri?: string;
}
```

#### **6. PageContent.tsx** → **Coin Performance Grid**
- **Current**: Grid layout showing all songs
- **CoinV4 Integration**:
  - Sort by coin performance (price change, volume)
  - Show "trending coins" section
  - Display market cap, trading volume for each song/coin
- **UI Enhancement**: Coin metrics in song cards

### 🔄 **Hook Events Integration**

#### **Real-time Data from CoinV4 Events:**
- **`Swapped`** → Update song/coin prices in SongItem components
- **`CoinMarketRewardsV4`** → Show artist earnings in real-time
- **`CoinTradeRewards`** → Display platform revenue from referrals
- **`CoinTransfer`** → Track coin ownership changes

## Key Challenges and Analysis

### CoinV4.sol Features Requirements (from official docs)

#### Core CoinV4 Architecture:
- **ERC20 + Uniswap V4**: Each coin gets automatic liquidity pool with ZoraV4CoinHook
- **Multi-ownership**: Multiple owners can manage coins (`MultiOwnable`)
- **Metadata Management**: Updatable contract metadata via URI (`setContractURI`)
- **Automatic Hook System**: `ZoraV4CoinHook` handles fee collection and reward distribution

#### Required Reward Distribution (Built-in):
- **Creator**: 50% (`CREATOR_REWARD_BPS = 5000`) → Artists
- **Create Referral**: 15% (`CREATE_REFERRAL_REWARD_BPS = 1500`) → Our platform 
- **Trade Referral**: 15% (`TRADE_REFERRAL_REWARD_BPS = 1500`) → Our platform per trade
- **Protocol**: 20% → Zora treasury (remainder)
- **Doppler**: 5% (`DOPPLER_REWARD_BPS = 500`) → Governance

#### Pool Configuration Requirements:
- Custom `PoolConfiguration` with fee tier, tick spacing, liquidity positions
- Support for multiple liquidity positions and market curves
- Proper pool key management (`getPoolKey()`, `getPoolConfiguration()`)

#### Multi-Hop Swap Paths:
- `getPayoutSwapPath()` for complex reward distribution
- Support for coins paired with other coins (Content Coin → Backing Coin → USDC)

### Integration Strategy
**Enhance existing components with CoinV4 features rather than building from scratch:**
1. Extend UploadModal for coin creation with proper metadata
2. Enhance SongItem with coin data and trading interface
3. Add wallet connection to existing Header auth flow
4. Integrate real-time coin data into Player components
5. Update Types to include coin-related fields

## High-level Task Breakdown

### Phase 1: CoinV4 Contract Integration
- [ ] **Task 1.1**: Setup wagmi with proper CoinV4 contract ABIs
  - Success Criteria: Can interact with CoinV4 functions (getPoolKey, hooks, etc.)
- [ ] **Task 1.2**: Implement coin factory integration with proper parameters
  - Success Criteria: Can call factory.createCoin() with PoolConfiguration
- [ ] **Task 1.3**: Add proper metadata URI management
  - Success Criteria: Can set/update contract metadata via setContractURI

### Phase 2: CoinV4 Feature Implementation
- [ ] **Task 2.1**: Implement pool configuration setup
  - Success Criteria: Proper PoolConfiguration with fee tier, tick spacing
- [ ] **Task 2.2**: Add payout recipient management
  - Success Criteria: Can set artist as payout recipient via setPayoutRecipient
- [ ] **Task 2.3**: Implement multi-ownership support
  - Success Criteria: Platform and artist both have ownership permissions
- [ ] **Task 2.4**: Add reward distribution monitoring
  - Success Criteria: Can track CoinMarketRewardsV4 and CoinTradeRewards events

### Phase 3: Hook System Integration
- [ ] **Task 3.1**: Monitor hook events (Swapped, CoinMarketRewardsV4)
  - Success Criteria: Display real-time swap and reward data
- [ ] **Task 3.2**: Implement swap path configuration for multi-hop rewards
  - Success Criteria: Proper getPayoutSwapPath setup for coin-to-coin pairs
- [ ] **Task 3.3**: Add automatic reward tracking
  - Success Criteria: Show creator/platform/trade referral rewards

## Project Status Board

### 🔴 In Progress
- Phase 1: CoinV4 Contract Integration
  - Task 2.1: Implement pool configuration setup
    - ⏳ Need to analyze pool configuration requirements
    - ⏳ Need to implement proper fee tier and tick spacing setup

### ⏳ Pending
- Phase 2: CoinV4 Feature Implementation (remaining tasks)
- Phase 3: Hook System Integration

### ✅ Completed
- [x] CoinV4 documentation analysis
- [x] Feature requirements identification
- [x] Component mapping analysis
- [x] Initial Web3 setup with correct dependencies
- [x] Integrated Web3Provider into app layout
- [x] Created useCreateCoin hook for Zora Coins SDK
- [x] Updated UploadModal with coin creation UI
- [x] Added coin_address to database schema
- [x] Implemented proper factory integration with initial purchase setup
- [x] Added multi-owner support in coin creation
- [x] Task 1.3: Added proper metadata URI management
  - Created useCreateMetadata hook with Zora's builder
  - Implemented IPFS upload via Zora's uploader
  - Added metadata validation and error handling
  - Enhanced UploadModal with proper file handling

### ❌ Cancelled
- Basic coin creation without CoinV4 features

## Current Status / Progress Tracking

**Current Focus**: Moving on to Task 2.1: Implement pool configuration setup

**Completed**:
- ✅ Installed correct dependencies (@zoralabs/coins-sdk)
- ✅ Set up Web3Provider with wagmi configuration
- ✅ Initialized Zora Coins SDK with API key support
- ✅ Added Web3Provider to app layout
- ✅ Created useCreateCoin hook with proper Zora SDK integration
- ✅ Updated UploadModal with coin creation UI and functionality
- ✅ Added coin_address field to songs table in database
- ✅ Implemented proper factory integration with:
  - Initial purchase configuration
  - Multi-owner support
  - Proper parameter types and validation
  - Error handling and user feedback
- ✅ Implemented proper metadata management with:
  - Zora's metadata builder tool
  - IPFS upload via Zora's uploader
  - Metadata validation and error handling
  - Enhanced file handling in UploadModal

**Next Steps**: 
1. Begin Task 2.1: Implement pool configuration setup
   - Analyze pool configuration requirements
   - Implement proper fee tier and tick spacing setup
   - Add pool configuration to coin creation flow

**Pending**:
- ⏳ Implement pool configuration setup
- ⏳ Add payout recipient management
- ⏳ Implement multi-ownership support
- ⏳ Add reward distribution monitoring

## Executor's Notes

Successfully completed Task 1.3 with proper metadata management:
1. Created useCreateMetadata hook using Zora's official tools:
   - Uses metadata builder for proper structure
   - Handles IPFS upload via Zora's uploader
   - Validates metadata before upload
2. Enhanced useCreateCoin hook:
   - Integrated metadata creation flow
   - Added initial purchase support
   - Improved error handling
3. Updated UploadModal:
   - Added proper file handling
   - Enhanced UX with conditional fields
   - Improved loading states

Key Learnings from Metadata Implementation:
- Zora provides official tools for metadata handling
- IPFS upload is handled through their SDK
- Metadata validation is critical for success
- Initial purchase helps with liquidity
- File handling needs careful consideration

## Lessons

- CoinV4 is not just an ERC20 - it's ERC20 + Uniswap V4 + Hook system
- Must implement proper PoolConfiguration with fee tiers and tick spacing
- Automatic reward distribution requires proper payout recipient setup
- Multi-ownership allows platform to co-manage coins with artists
- Hook system handles all fee collection and reward distribution automatically
- Need to monitor hook events for real-time trading data
- **Existing components can be enhanced rather than rebuilt from scratch**
- **Song upload flow is perfect place for coin creation**
- **Player components ideal for real-time coin performance display**
- **Use @zoralabs/coins-sdk for Zora Coins V4 integration**
- **Need to set up ZORA_API_KEY for full SDK functionality**
- **Use Zora's metadata builder for proper metadata structure**
- **IPFS upload should use Zora's official uploader**
- **Initial purchase amount helps seed liquidity**
- **File handling needs careful consideration in metadata creation** 