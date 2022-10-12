const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
    },
    description: {
      type: String,
    },
    percentage: {
      type: Number,
      required: true,
    },
    maximum: {
      type: Number,
      required: true,
    },
    user: [
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user"
      },
    ],
  },
  { timestamps: true }
);

const coupon = mongoose.model("coupon", couponSchema);
module.exports = coupon;
