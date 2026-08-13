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
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${process.env.MARKET_DATA_API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        error: "Market data provider request failed.",
        symbol: symbol,
        live: false
      });
    }

    const data = await response.json();

    if (!data || typeof data.c !== "number") {
      return res.status(502).json({
        error: "No valid market data returned.",
        symbol: symbol,
        live: false
      });
    }

    return res.json({
      symbol: symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      live: true
    });

  } catch (error) {
    console.error("Finnhub request failed:", error);

    return res.status(500).json({
      error: "Unable to fetch market data.",
      symbol: symbol,
      live: false
      });
}
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
