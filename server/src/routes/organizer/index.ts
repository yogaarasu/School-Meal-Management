import { Router } from "express";
import { organizerDashboardController } from "../../controllers/organizer/dashboard.controller.js";
import { organizerPricingController } from "../../controllers/organizer/pricing.controller.js";
import {
  createReportController,
  deleteReportController,
  listReportsController,
  updateReportController
} from "../../controllers/organizer/report.controller.js";
import {
  addStockController,
  deleteStockController,
  listStockController,
  monthlyReportController
} from "../../controllers/organizer/stock.controller.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

export const organizerRouter = Router();

organizerRouter.use(requireAuth, requireRole("ORGANIZER"));

organizerRouter.get("/dashboard", organizerDashboardController);
organizerRouter.get("/pricing", organizerPricingController);
organizerRouter.get("/reports", listReportsController);
organizerRouter.post("/reports", createReportController);
organizerRouter.put("/reports/:reportId", updateReportController);
organizerRouter.delete("/reports/:reportId", deleteReportController);
organizerRouter.get("/stock", listStockController);
organizerRouter.post("/stock", addStockController);
organizerRouter.delete("/stock/:entryId", deleteStockController);
organizerRouter.get("/monthly-report", monthlyReportController);