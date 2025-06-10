// models/SiteConfig.js
import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

siteConfigSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.SiteConfig ||
  mongoose.model("SiteConfig", siteConfigSchema);
