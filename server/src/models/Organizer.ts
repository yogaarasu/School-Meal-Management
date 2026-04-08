import { Schema, model, type InferSchemaType } from "mongoose";
import { SchoolType } from "../types/domain.js";

const organizerSchema = new Schema(
  {
    organizerId: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    schoolType: { type: String, enum: Object.values(SchoolType), required: true },
    district: { type: String, required: true, trim: true },
    taluk: { type: String, default: "", trim: true },
    town: { type: String, default: "", trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true, collection: "organizers" }
);

organizerSchema.index({ district: 1 });
organizerSchema.index({ schoolType: 1 });

export type OrganizerDocument = InferSchemaType<typeof organizerSchema>;
export const OrganizerModel = model("Organizer", organizerSchema);
