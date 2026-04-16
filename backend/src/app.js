import express from "express";
import authRoutes from "./routes/auth.route.js";
import allocationRoutes from "./routes/allocation.route.js";
import reportRoutes from "./routes/report.route.js";
import zoneRoutes from "./routes/zone.route.js";
import volunteerRoutes from "./routes/volunteer.route.js";
import simulationRoutes from "./routes/simulation.route.js";
import alertRoutes from "./routes/alert.route.js";
import metricsRoutes from "./routes/metrics.route.js";
import cors from "cors";




const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/zones', zoneRoutes);
app.use("/api/v1/volunteers", volunteerRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/allocations", allocationRoutes);
app.use("/api/v1/simulations", simulationRoutes);
app.use("/api/v1/alerts", alertRoutes);
app.use("/api/v1/metrics", metricsRoutes);


app.get("/", (req, res) => {
  res.send("Welcome to Resource Allocation API");
})


export default app;