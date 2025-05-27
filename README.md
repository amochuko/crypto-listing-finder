# Token listing Finder

This is a telegram bot which sources for listed Tokens/Cryptocurrency in the Ethereum network via Coinmarketcap API. It filters the listing by a 24hr trading volume that defaults to a minimum of 10_000_000.

Other feature is coming in soon.

## Usage

To use, some API tokens are required from the respective API providers. Check `src/sample.env`
for ones included

```bash
cp sample.env .env
```
Update `.env` with your gotten API tokens


Install dependencies
```javascript
npm install
```

Run app
```javascript
npm run dev
```
