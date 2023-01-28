const { Schema, model, default: mongoose } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
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
    // Come back to this one
    festivals: [{type: Schema.Types.ObjectId, ref: "Festival"}]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
