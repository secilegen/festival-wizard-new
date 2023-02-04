const router = require("express").Router();
const mongoose = require("mongoose");
const { reset } = require("nodemon");
const { rawListeners } = require("../app");
const app = require("../app");
const Festival = require("../models/Festival.model");
const User = require("../models/User.model");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const { userInfo } = require("os");
const fileUploader = require("../config/cloudinary.config");

const countries = require("../utils/countries");
var errorType;
var message;

router.get("/festivals/create", (req, res) => {
  res.render("festivals/new-festival-form", { countries });
});

router.post(
  "/festivals/create",
  fileUploader.single("imageURL"),
  (req, res) => {
    const inputChecked = checkInput(req);

    if (inputChecked.errorMessage) {
      inputChecked.oldData = req.body;
      res.render("festivals/new-festival-form", inputChecked);
    } else {
      const {
        name,
        imageURL,
        startDate,
        endDate,
        country,
        city,
        address,
        currency,
        minPrice,
        maxPrice,
        website,
        mustKnow,
        genre,
      } = req.body;

      Festival.create({
        name,
        imageURL: req.file.path,
        startDate,
        endDate,
        location: { city, country, address },
        currency,
        minPrice,
        maxPrice,
        website,
        mustKnow,
        genre,
      })
        .then((createdFestival) => {
          res.redirect(`/festivals/${createdFestival._id}`);
        })
        .catch((err) =>
          console.log("An error occured creating the festival:", err)
        );
    }
  }
);

router.get("/festivals/list", (req, res) => {
  Festival.find()
    .then((allFestivals) => {
      res.render("festivals/all-festivals", { allFestivals });
    })
    .catch((err) =>
      console.log("Error occured retrieving all festivals:", err)
    );
});

router.get("/festivals/:festivalId", (req, res) => {
  console.log("Req.params is:", req.params);
  let isIncludingFav;

  if (req.session.currentUser) {
    User.findById(req.session.currentUser._id)
      .then((userFromDB) => {
        console.log("User from DB Festivals is", userFromDB);
        for (let i = 0; i < userFromDB.festivals.length; i++) {
          if (userFromDB.festivals.length == 0) {
            isIncludingFav = false;
            return;
          } else if (userFromDB.festivals[i] == req.params.festivalId) {
            isIncludingFav = true;
            return;
          }
        }
        console.log("Does it include Fav?:", isIncludingFav);
      })
      .then(() => {
        Festival.findOne({ _id: req.params.festivalId }).then(
          (festivalDetails) => {
            console.log(festivalDetails);
            res.render("festivals/festival-details", {
              festivalDetails,
              isIncludingFav,
            });
          }
        );
      })
      .catch((err) =>
        console.log("Error getting the festival detail is:", err)
      );
  } else {
    Festival.findOne({ _id: req.params.festivalId }).then((festivalDetails) => {
      console.log(festivalDetails);
      res.render("festivals/festival-details", { festivalDetails });
    });
  }
});

router.get("/delete-festival/:id", (req, res) => {
  const festivalId = req.params.id;

  Festival.findByIdAndDelete(festivalId)
    .then((festivalToDelete) => {
      res.redirect("/festivals/list");
    })
    .catch((err) => console.log("Delete error is", err));
});

router.get("/festivals/:id/edit/", (req, res, next) => {
  Festival.findById(req.params.id)
    .then((festivalToEdit) => {
      res.render("festivals/edit-festival", { countries, festivalToEdit });
    })
    .catch((err) =>
      console.log("Error occured retrieving the data to edit festival:", err)
    );
});

router.get("/festivals/:id/fav/", (req, res) => {
    Festival.findByIdAndUpdate(req.params.id, { $inc: {"favorited" : 1} })
    .then((festFav)=>{
        console.log('Festival faved:', festFav)
    })
    .then(()=>{
        User.findById(req.session.currentUser._id)
            .then((userToUpdate) => {
            console.log("User to Update is", userToUpdate);
            userToUpdate.festivals.push(req.params.id);
            User.create(userToUpdate);
            })
            .then(() => {
            res.redirect(`/festivals/${req.params.id}`);
            })
            .catch((err) => console.log("An error occured while adding to fav:", err));
});
    })

        

router.get("/festivals/:id/unfav/", (req, res) => {
    Festival.findByIdAndUpdate(req.params.id, { $inc: {"favorited" : -1} })
    .then((festUnfav)=>{
        console.log('Festival unfaved:', festUnfav)
    })
    .then(()=>{
        User.findById(req.session.currentUser._id)
    .then((userToUpdate) => {
      console.log("User to Update is", userToUpdate);
      userToUpdate.festivals.pull(req.params.id);
      User.create(userToUpdate);
    })
    .then(() => {
      res.redirect(`/festivals/${req.params.id}`);
    })
    .catch((err) =>
      console.log("An error occured while removing from fav:", err)
    );
});
    })

  
router.post(
  "/festivals/:id/edit",
  fileUploader.single("imageURL"),
  (req, res) => {
    const inputChecked = checkInput(req);

    if (inputChecked.errorMessage) {
      let festivalToEdit = {
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        currency: req.body.currency,
        minPrice: req.body.minPrice,
        maxPrice: req.body.maxPrice,
        website: req.body.website,
        mustKnow: req.body.mustKnow,
        genre: req.body.genre,
        artists: req.body.artists,
        // also fix this acc to cloudinary
        image: req.body.image,
        _id: req.params.id,
        location: {
          city: req.body.city,
          address: req.body.address,
          country: req.body.country,
        },
      };

      res.render("festivals/edit-festival", {
        festivalToEdit,
        countries: inputChecked.countries,
        errorMessage: inputChecked.errorMessage,
        errorType: inputChecked.errorType,
      });
    } else {
      const {
        name,
        existingImage,
        startDate,
        endDate,
        country,
        city,
        address,
        currency,
        minPrice,
        maxPrice,
        website,
        mustKnow,
        genre,
      } = req.body;
      let imageURL;
      if (req.file) {
        imageURL = req.file.path;
      } else {
        imageURL = existingImage;
      }

      Festival.findByIdAndUpdate(req.params.id, {
        name,
        imageURL,
        startDate,
        endDate,
        location: { city, country, address },
        currency,
        minPrice,
        maxPrice,
        website,
        mustKnow,
        genre,
      })
        .then((festivalToUpdate) => {
          res.redirect(`/festivals/${festivalToUpdate._id}`);
        })
        .catch((err) => console.log("Editing error is:", err));
    }
  }
);

function checkInput(req) {
  if (!req.body.name) {
    message = "You must enter a name for your Festival";
    errorType = "error";
  } else if (!req.body.startDate && !req.body.endDate) {
    // if there is an end date but no start date, code below sets start date to end date
    message = "You must enter a Start Date";
    errorType = "error";
  } else if (!req.body.country) {
    message = "You must select a country";
    errorType = "error";
  } else if (!req.body.city) {
    message = "You must enter a city";
    errorType = "error";
  } else if (!req.body.website) {
    message = "You must enter a website";
    errorType = "error";
  } else if (req.body.minPrice && !req.body.maxPrice) {
    message = "Maximum Price has been set to " + req.body.minPrice;
    errorType = "warning";
    req.body.maxPrice = req.body.minPrice;
  } else if (!req.body.minPrice && req.body.maxPrice) {
    message = "Minimum Price has been set to " + req.body.maxPrice;
    errorType = "warning";
    req.body.minPrice = req.body.maxPrice;
  } else if (Number(req.body.minPrice) > Number(req.body.maxPrice)) {
    message =
      "Maximum Price cannot be lower than Minimum. Max price has been set to " +
      req.body.minPrice;
    errorType = "warning";
    req.body.maxPrice = req.body.minPrice;
  } else if (req.body.startDate && !req.body.endDate) {
    message = "End Date has been set to " + req.body.startDate;
    errorType = "warning";
    req.body.endDate = req.body.startDate;
  } else if (!req.body.startDate && req.body.endDate) {
    message = "Start Date has been set to " + req.body.endDate;
    errorType = "warning";
    req.body.startDate = req.body.endDate;
  } else if (req.body.startDate > req.body.endDate) {
    message =
      "End Date cannot be before the Start Date. End Date has been set to " +
      req.body.startDate;
    errorType = "warning";
    req.body.endDate = req.body.startDate;
  } else {
    message = "";
    errorType = "";
  }

  return { countries, errorMessage: message, errorType, oldData: req.body };
}

module.exports = router;
