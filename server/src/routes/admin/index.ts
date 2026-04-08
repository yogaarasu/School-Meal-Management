import { Router } from "express";
import {
  createOrganizerController,
  dashboardStatsController,
  deleteOrganizerController,
  listOrganizersController,
  updateOrganizerController
} from "../../controllers/admin/organizer.controller.js";
import { getPricingController, updatePricingController } from "../../controllers/admin/pricing.controller.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/dashboard", dashboardStatsController);
adminRouter.get("/organizers", listOrganizersController);
adminRouter.post("/organizers", createOrganizerController);
adminRouter.put("/organizers/:organizerId", updateOrganizerController);
adminRouter.delete("/organizers/:organizerId", deleteOrganizerController);
adminRouter.get("/pricing", getPricingController);
adminRouter.put("/pricing", updatePricingController);