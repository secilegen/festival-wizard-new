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
            default: 'https://res.cloudinary.com/dl4tnpmqr/image/upload/v1675363760/festival-wizard/pe0ok5lbfnhqegvefyuu.jpg'
        },
        startDate: {
            type: String,
            required: [true, "Please enter a start date"]
        },
        endDate: {
            type: String
        },
        artists: {
            type: String
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
            venue: {
                type: String
            }
        },
        currency: {
            type: String,
            enum: ['--','€','$','£'], 
            default: '€'
        },
        minPrice: {
            type: Number
        },
        maxPrice: {
            type: Number
        },
        website: {
            type: String,
            required: [true, "Please enter a website"]
        },
        description: {
            type: String
        },
        genre: {
            type: [String],
            enum: ['Rock', 'Pop', 'Electronic', 'Folk', 'Techno', 'Classical','Hip-hop', 'Jazz']
        },
        users: [{type: Schema.Types.ObjectId, ref: "User"}],
        favorited: {
            type: Number,
            default: 0
    }
},
{
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const Festival = model("Festival", festivalSchema)

module.exports = Festival