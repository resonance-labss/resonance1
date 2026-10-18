# Resonance — A Rialo Learning Adventure

An anime-inspired learning adventure connecting reactive transaction concepts to practical, budget-limited Web3 simulations.

**Live preview:** https://resonance-learning-adventure.vercel.app

## What works today

- Short character lessons; Diren, Ece and Ade each have a current four-question, four-option check.
- Sepolia character NFTs, Rabby connection, mint receipt verification and current-ownership access checks.
- Diren's conditional-buy simulation: explicit budget, price cap, expiry, cancellation and execution checks.
- Ece's Reserve Studio: shared weekly cap, reserve floor and data-age checks, three stress scenarios, protected/unprotected comparisons, downloadable local reports, browser-saved settings and comparisons between completed policies.
- Ade’s NFT-gated Plan Lab: audit two policies on identical hypothetical price paths, compare cash/asset value/fees, and explore compound growth in a separate assumption-based calculator.
- Guided experiments, a visible rule timeline and explanations that connect outcomes to the lesson.
- A guided tour and a Terms panel on every page, and a one-sentence result with a downloadable image card in each tool.
- Hosted Gemini drafts for Diren and Ece, plus Diren’s Latch proposal checks with a persistent shared free-preview quota. Credentials remain on the server; applying a draft and confirming the simulation are separate actions.

NFT minting is on Sepolia, not Rialo. Purchases and balances in the vault are fictional. The test NFT contract does not verify gameplay; local completion gates only the app's mint flow. Denis's scheduled tool (Eric in older versions) is an experimental implementation with development currently paused.

## Run the public version locally

Requirements: Python 3 and a modern browser. Rabby in an extension-enabled browser is needed for wallet features.

```sh
python3 integrations/web/build.py
python3 -m http.server 8767 --bind 127.0.0.1 --directory output/vercel-site/public
```

Open http://127.0.0.1:8767. This build includes the landing page, game, mint screen, Diren vault, Ece Reserve Studio and Ade Plan Lab. It deliberately excludes secrets, backend services and development screenshots.

Browser progress is stored per origin. Existing localhost progress will not automatically appear on the live domain; NFTs remain in the wallet.

## Project layout

- `output/selection/`: editable game, quiz, mint and vault sources. `build.py` assembles the game HTML.
- `contracts/`: ERC-721 character reward contract and local tests.
- `integrations/web/`: landing page and allowlisted public build.
- `integrations/latch/`: local backend and proposal service experiments; these do not execute purchases.
- `output/nft-v2/`: NFT artwork and metadata preparation.

The local AI/Latch development server currently expects credentials in the developer's Desktop/Resonance/.private directory. Credentials are never committed. See `integrations/web/README.md` for publication steps and public/local scope.

## Validate

Contract tests use a local Ganache chain, not a funded public account:

```sh
cd contracts
npm ci --ignore-scripts
npm test
```

The pure scheduled simulation can be checked with `node output/selection/vault/scheduled-engine.test.cjs` from the project root. Browser checks require Playwright and Chrome; existing `check-*.cjs` scripts and `contracts/test/*-ui.cjs` document the covered workflows.

## Development direction

Refine the connected Diren buying and Ece budget-protection journeys. Ece uses deterministic local rules; her cumulative protections are not enforced by the current hosted Latch service. Hosted AI/Latch access now has shared request limits; real Rialo execution requires separately verified network, wallet, data and transaction integration.

Independent community prototype. No profit guarantees, mainnet execution or security-audit claims. No open-source license has been selected yet; publishing the repository does not grant unrestricted rights to its code or artwork.
