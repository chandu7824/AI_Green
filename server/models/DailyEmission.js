import mongoose from "mongoose";

const DailyEmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  date: {
    type: String,
    required: true,
    index: true,
  },

  totals: {
    transport: {
      bike: { type: Number, default: 0 },
      car: { type: Number, default: 0 },
      bus: { type: Number, default: 0 },
      train: { type: Number, default: 0 },
    },
    electricity: { type: Number, default: 0 },
    diet: { type: Number, default: 0 },
    plasticWaste: { type: Number, default: 0 },
    householdWastage: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    cookingFuel: { type: Number, default: 0 },
    overall: { type: Number, default: 0 },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

DailyEmissionSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyEmission = mongoose.model(
  "DailyEmission",
  DailyEmissionSchema,
);
