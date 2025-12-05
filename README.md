# Kameleoon

## Chosen visualization library

D3. [Documentation](https://d3js.org/).

---

## Implemented and bonus features

### Requirements

- Display a **conversion rate (conversionRate)** line chart for all variations, showing all values as **percentages**.
- On **hover**, show a **vertical line** and a **popup** with daily data.
- At least **one variation must always be selected**.
- When variations are toggled, both X and Y axes must **adapt automatically** to the visible data range.
- Display all values as **percentages**.
- Responsive layout for screens between **671 px** and **1300 px**.
- Controls:
    - **Variations selector** (choose which lines to display)
    - **Day / Week selector**

### Bonus Features

- Line style selector (`Line`, `Smooth`, `Area`)
- Light / Dark theme toggle
- Export chart to PNG

---

## Local setup instructions

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

Start the development server on `http://localhost:5173`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```
