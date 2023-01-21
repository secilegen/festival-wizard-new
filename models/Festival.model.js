const { Schema, model, default: mongoose } = require("mongoose");

const festivalSchema = new Schema (
    {
        name: {
            type: String,
            required: [true, "Please enter a festival name"],
            trim: true
        },
        imageURL: {
            type: String,
            trim: true,
            default: 'imageURL'
        },
        startDate: {
            type: Date,
            required: [true, "Please enter a start date"]
        },
        endDate: {
            type: Date
        },
        artists: {
            type: [String]
        },
        location: {
            country: {
                type: String,
                required: [true, "Please enter the country"]
            },
            city: {
                type: String,
                required: [true, "Please enter the city"]
            },
            address: {
                type: String
            }
        },
        currency: {
            type: String,
            enum: ['EUR','USD','GBP'], 
            default: 'EUR'
        },
        minPrice: {
            type: Number
        },
        maxPrice: {
            type: Number
        },
        websiteURL: {
            type: String,
            required: [true, "Please enter a website"]
        },
        mustKnow: {
            type: String
        },
        genre: {
            type: [String],
            enum: ['Rock', 'Pop', 'Electronic', 'Folk', 'Techno', 'Classical']
        },
        users: [{type: Schema.Types.ObjectId, ref: "User"}]
},
{
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const Festival = model("Festival", festivalSchema)

module.exports = Festival