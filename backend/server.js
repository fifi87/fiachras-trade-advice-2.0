import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// BASIC SERVER
// --------------------------------------------------

app.use(express.json());

// Serve the frontend
app.use(express.static(path.join(__dirname, "../frontend")));


// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    application: "Fiachra's Tradin",
    founder: "Fiachra Gardner",
    liveData: false,
    message: "Backend is running."
  });
});


// --------------------------------------------------
// MARKET DATA ENDPOINT
// --------------------------------------------------

app.get("/api/quote", async (req, res) => {

  const symbol = String(
    req.query.symbol || "AMZN"
  ).toUpperCase();

  /*
    IMPORTANT:

    This endpoint will eventually connect to the
    real market-data provider.

    We are NOT putting an API key in the frontend.

    We also do NOT invent a fake market price here.
  */

  if (!process.env.MARKET_DATA_API_KEY) {

    return res.status(503).json({
      error: "Live market data is not configured yet.",
      symbol: symbol,
      live: false
    });

  }

  /*
    The provider adapter will be added next.

    It will handle:

      Stocks
      Amazon (AMZN)
      Forex
      Indices
      Crypto
  */

  return res.status(501).json({
    error: "Market-data provider adapter not installed yet.",
    symbol: symbol,
    live: false
  });
});


// --------------------------------------------------
// SUPPORTED MARKETS
// --------------------------------------------------

app.get("/api/markets", (req, res) => {

  res.json({

    stocks: [
      "AMZN",
      "AAPL",
      "MSFT",
      "NVDA",
      "TSLA",
      "ABBV",
      "GOOGL",
      "META"
    ],

    forex: [
      "EURUSD",
      "GBPUSD",
      "USDJPY",
      "EURGBP",
      "AUDUSD",
      "USDCAD"
    ],

    indices: [
      "SPX",
      "NDX",
      "DJI"
    ],

    crypto: [
      "BTCUSD",
      "ETHUSD",
      "SOLUSD"
    ]

  });

});


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {

  console.log(
    `Fiachra's Tradin backend running on port ${PORT}`
  );

});
