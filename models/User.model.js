const { Schema, model, default: mongoose } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true,"Email is required"],
      unique: [true, "Email already in use, try a different email"],
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"]
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    location: {
      country: String,
      city:  String,
      address: String,
    },
    isAdmin: {
      type: Boolean,
      default: false
    },

    festivals: [{type: Schema.Types.ObjectId, ref: "Festival"}]
  },
  {
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
