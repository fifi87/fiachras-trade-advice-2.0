// Fiachra's Trading Terminal 2.0
// Frontend market dashboard

const state = {
  symbol: "AAPL",
  market: "stocks",
  interval: "15m"
};

const demoMarkets = {
  stocks: [
    { symbol: "AAPL", name: "Apple", price: 231.50, change: 0.82 },
    { symbol: "AMZN", name: "Amazon", price: 218.40, change: -0.31 },
    { symbol: "MSFT", name: "Microsoft", price: 510.20, change: 1.14 },
    { symbol: "NVDA", name: "NVIDIA", price: 182.70, change: 1.92 },
    { symbol: "TSLA", name: "Tesla", price: 341.80, change: -0.74 }
  ],

  crypto: [
    { symbol: "BTCUSDT", name: "Bitcoin", price: 63752.42, change: -0.41 },
    { symbol: "ETHUSDT", name: "Ethereum", price: 3120.50, change: 0.64 },
    { symbol: "SOLUSDT", name: "Solana", price: 142.80, change: 1.12 },
    { symbol: "BNBUSDT", name: "BNB", price: 612.30, change: -0.22 },
    { symbol: "XRPUSDT", name: "XRP", price: 2.91, change: 0.45 }
  ],

  forex: [
    { symbol: "EURUSD", name: "Euro / US Dollar", price: 1.1682, change: 0.18 },
    { symbol: "GBPUSD", name: "Pound / US Dollar", price: 1.3541, change: -0.12 },
    { symbol: "USDJPY", name: "US Dollar / Yen", price: 147.82, change: 0.21 },
    { symbol: "EURGBP", name: "Euro / Pound", price: 0.8624, change: -0.08 }
  ]
};

function money(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function findElement(...ids) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) return element;
  }
  return null;
}

function setText(ids, value) {
  const element = findElement(...ids);
  if (element) element.textContent = value;
}

function getMarkets() {
  return demoMarkets[state.market] || demoMarkets.stocks;
}

function getSelectedMarket() {
  const markets = getMarkets();

  return (
    markets.find(item => item.symbol.toUpperCase() === state.symbol.toUpperCase()) ||
    markets[0]
  );
}

function updateMainPrice() {
  const market = getSelectedMarket();

  if (!market) return;

  setText(
    ["symbol", "symbolName", "mainSymbol"],
    market.symbol
  );

  setText(
    ["price", "mainPrice", "currentPrice"],
    "$" + money(market.price)
  );

  const changeElement = findElement(
    "change",
    "priceChange",
    "mainChange"
  );

  if (changeElement) {
    const sign = market.change >= 0 ? "+" : "";
    changeElement.textContent =
      sign + market.change.toFixed(2) + "%";

    changeElement.classList.remove("green", "red");
    changeElement.classList.add(
      market.change >= 0 ? "green" : "red"
    );
  }
}

function renderWatchlist() {
  const container = findElement(
    "watchlist",
    "watchList",
    "watchlistItems"
  );

  if (!container) return;

  container.innerHTML = "";

  getMarkets().forEach(market => {
    const item = document.createElement("div");

    item.className = "watchlist-item";

    item.innerHTML = `
      <div>
        <strong>${market.symbol}</strong>
        <small>${market.name}</small>
      </div>

      <div class="watch-price">
        <strong>$${money(market.price)}</strong>
        <span class="${market.change >= 0 ? "green" : "red"}">
          ${market.change >= 0 ? "+" : ""}${market.change.toFixed(2)}%
        </span>
      </div>
    `;

    item.addEventListener("click", () => {
      state.symbol = market.symbol;
      updateMainPrice();
      drawChart();
    });

    container.appendChild(item);
  });
}

function drawChart() {
  const canvas = findElement(
    "chart",
    "priceChart",
    "marketChart"
  );

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const width = canvas.width = canvas.clientWidth || 800;
  const height = canvas.height = canvas.clientHeight || 400;

  ctx.clearRect(0, 0, width, height);

  // Grid
  ctx.strokeStyle = "#243247";
  ctx.lineWidth = 1;

  for (let i = 1; i < 5; i++) {
    const y = (height / 5) * i;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Demo price movement
  const points = [];

  for (let i = 0; i < 60; i++) {
    const x = (width / 59) * i;

    const base =
      height * 0.55 +
      Math.sin(i * 0.35) * height * 0.18 +
      Math.sin(i * 0.11) * height * 0.08;

    const noise = (Math.random() - 0.5) * 12;

    points.push({
      x,
      y: base + noise
    });
  }

  ctx.strokeStyle = "#4da3ff";
  ctx.lineWidth = 3;

  ctx.beginPath();

  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();

  // Last price dot
  const last = points[points.length - 1];

  ctx.fillStyle = "#20d79a";
  ctx.beginPath();
  ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function updateDecision() {
  const market = getSelectedMarket();

  if (!market) return;

  let decision = "WAIT";
  let confidence = 55;

  if (market.change > 1) {
    decision = "BUY";
    confidence = 72;
  } else if (market.change < -1) {
    decision = "SELL";
    confidence = 70;
  }

  setText(
    ["decision", "aiDecision", "signal"],
    decision
  );

  setText(
    ["confidence", "signalConfidence"],
    confidence + "%"
  );

  const bar = findElement(
    "confidenceBar",
    "signalBar"
  );

  if (bar) {
    bar.style.width = confidence + "%";
  }
}

function updateDashboard() {
  updateMainPrice();
  renderWatchlist();
  drawChart();
  updateDecision();
}

function setupSearch() {
  const input = findElement(
    "symbolInput",
    "searchInput",
    "symbolSearch"
  );

  if (!input) return;

  input.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    const value = input.value.trim().toUpperCase();

    if (!value) return;

    state.symbol = value;

    updateMainPrice();
    drawChart();
    updateDecision();
  });
}

function setupIntervals() {
  document.querySelectorAll(
    "[data-interval], .interval-button"
  ).forEach(button => {
    button.addEventListener("click", () => {
      const interval =
        button.dataset.interval ||
        button.textContent.trim();

      state.interval = interval;

      document.querySelectorAll(
        "[data-interval], .interval-button"
      ).forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      drawChart();
    });
  });
}

function setupMarkets() {
  document.querySelectorAll(
    "[data-market], .market-button"
  ).forEach(button => {
    button.addEventListener("click", () => {
      const market = button.dataset.market;

      if (!market) return;

      state.market = market;

      const first = getMarkets()[0];

      if (first) {
        state.symbol = first.symbol;
      }

      document.querySelectorAll(
        "[data-market], .market-button"
      ).forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      updateDashboard();
    });
  });
}

function startDemoRefresh() {
  setInterval(() => {
    getMarkets().forEach(market => {
      const movement = (Math.random() - 0.5) * 0.12;

      market.change =
        Number((market.change + movement).toFixed(2));

      market.price =
        Number(
          (
            market.price *
            (1 + movement / 100)
          ).toFixed(2)
        );
    });

    updateDashboard();
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupIntervals();
  setupMarkets();

  updateDashboard();
  startDemoRefresh();

  console.log(
    "Fiachra's Trading Terminal 2.0 loaded."
  );
});
