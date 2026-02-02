import express from "express";
import authRoutes from "./routes/auth";
import studentRoutes from "./routes/students";
import companyRoutes from "./routes/companies";
import exportRoutes from "./routes/exports";
import uploadRoutes from "./routes/uploads";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/companies", companyRoutes);
app.use("/exports", exportRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/uploads", uploadRoutes);
app.use(express.static("public"));

export default app;
