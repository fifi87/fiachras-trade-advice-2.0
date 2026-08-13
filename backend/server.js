// Secure backend skeleton.
// Put your market-data API key in an environment variable, NEVER in frontend files.
// Example: MARKET_DATA_API_KEY=... node server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express();
app.use(express.json());
app.use(express.static(path.join(__dirname,"../frontend")));

app.get("/api/quote", async (req,res)=>{
  const symbol=String(req.query.symbol||"AMZN").toUpperCase();
  // TODO: connect this route to your chosen licensed live stock/FX data provider.
  // Do not return invented/demo prices.
  if(!process.env.MARKET_DATA_API_KEY){
    return res.status(503).json({error:"Live market provider is not configured yet."});
  }
  return res.status(501).json({error:"Provider adapter not installed yet.",symbol});
});

app.listen(process.env.PORT||3000,()=>console.log("Fiachra's Tradin running on http://localhost:3000"));
