const router = require("express").Router();
const Festival = require("../models/Festival.model");
const User = require("../models/User.model");
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
         venue,
         currency,
         minPrice,
         maxPrice,
         website,
         description,
         genre,
       } = req.body;

       Festival.create({
         name,
         imageURL: req.file?.path,
         startDate,
         endDate,
         location: { city, country, venue },
         currency,
         minPrice,
         maxPrice,
         website,
         description,
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
    res.render("festivals/all-festivals", { allFestivals, countries });
  })
  .catch((err) =>
    console.log("Error occured retrieving all festivals:", err)
  );
});


router.get("/search",(req,res)=> {

  var hasName, hasCountry, hasGenre

  const {country}= req.query

  if (req.query.name) {
      hasName = true
   }
  else{
      hasName = false
  }
  hasCountry = !(req.query.country === "--")
  hasGenre = !(req.query.genre === "--")

  if (hasName || hasCountry || hasGenre){

    filter1 = "Name: "+ req.query.name
    filter2 = "Country: "+ req.query.country
    filter3 = "Genre: "+ req.query.genre

    if (hasName && hasCountry && hasGenre){
      Festival.find( {"$or": [{name:{$regex:req.query.name}, "location.country":country, genre:{$regex:req.query.genre}}]}) 
      .then((someFestivals) => {
        res.render('festivals/some-festivals', { countries, someFestivals , filter: filter1+", "+filter2+", "+filter3})
      })
      .catch((err) =>
      console.log("Error occured searching by name, country and genre:", err)
    )}

    else if (hasName && hasCountry){
      Festival.find( {"$or": [{name:{$regex:req.query.name}, "location.country":country}]} )
      .then((someFestivals) => {
        res.render('festivals/some-festivals', { countries, someFestivals , filter: filter1+", "+filter2})
      })
      .catch((err) =>
      console.log("Error occured searching by name and country:", err)
    )}

    else if (hasName && hasGenre){
      Festival.find( {"$or": [{name:{$regex:req.query.name},  genre:{$regex:req.query.genre}}]} )
      .then((someFestivals) => {
        res.render('festivals/some-festivals', { countries, someFestivals , filter: filter1+", "+filter3})
      })
      .catch((err) =>
      console.log("Error occured searching by name and genre:", err)
    )}

    else if (hasCountry && hasGenre){
      Festival.find( {"$or": [{"location.country":country, genre:{$regex:req.query.genre}}]} )
      .then((someFestivals) => {
        res.render('festivals/some-festivals', { countries, someFestivals , filter: filter2+", "+filter3})
      })
      .catch((err) =>
      console.log("Error occured searching by country and genre:", err)
    )}

    else if (hasName) {
      Festival.find( {"$or": [{name:{$regex:req.query.name}}]} )
      .then((someFestivals) => {
        res.render('festivals/some-festivals', { countries, someFestivals , filter: filter1})
      })
      .catch((err) =>
      console.log("Error occured searching by name:", err)
    )}

    else if (hasCountry) {
      Festival.find( {"$or": [{"location.country":country}]} )
      .then((someFestivals) => {
        res.render('festivals/some-festivals', { countries, someFestivals , filter: filter2})
      })
      .catch((err) =>
      console.log("Error occured searching by country:", err)
    )}

    else if (hasGenre){
      Festival.find( {"$or": [{genre:{$regex:req.query.genre}}]} )
      .then((someFestivals) => {
        res.render('festivals/some-festivals', { countries, someFestivals , filter: filter3})
      })
      .catch((err) =>
      console.log("Error occured searching by genre:", err)
    )}

    else{
      console.log("This should be impossible. Check your code")
    }}
  else {
    errorMessage = "Please select a Festival Name, Country, or Genre before searching"
    errorType = "selectWarning"
    Festival.find()
    .then((allFestivals) => {
      res.render("festivals/all-festivals", { allFestivals, countries, errorMessage, errorType});
    })
    .catch((err) =>
      console.log("Error occured retrieving all festivals:", err)
    );
  }
})

router.get("/festivals/feelinglucky", (req, res) => {
  //isIncludingFav to be added
  let randomFestival
  Festival.aggregate([{$sample: {size:1}}])
  .then((result) => {
    randomFestival = result[0]
    console.log("Random festival is:", randomFestival)
    res.render("festivals/random-festival", {randomFestival});
  })
  .catch(err=>console.log(err))

});


router.get("/festivals/:festivalId", (req, res) => {
  let isIncludingFav;

  if (req.session.currentUser) {
    User.findById(req.session.currentUser._id)
      .then((userFromDB) => {
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
  Festival.findByIdAndUpdate(req.params.id, { $inc: { favorited: 1 } })
  .then(() => {
      return User.findByIdAndUpdate(req.session.currentUser._id, {
        $push: { festivals: req.params.id },
      })
        .then(() => {
          res.redirect(`/festivals/${req.params.id}`);
        })
        .catch((err) =>
          console.log("An error occured while adding to fav:", err)
        );
    }
  );
});

router.get("/festivals/:id/unfav/", (req, res) => {
  Festival.findByIdAndUpdate(req.params.id, { $inc: { favorited: -1 } })
    .then(() => {
      return User.findByIdAndUpdate(req.session.currentUser._id, { $pull: {festivals: req.params.id}})
        .then(() => {
          res.redirect(`/festivals/${req.params.id}`);
        })
        .catch((err) =>
          console.log("An error occured while removing from fav:", err)
        );
    });
});

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
        description: req.body.description,
        genre: req.body.genre,
        artists: req.body.artists,
        // also fix this acc to cloudinary
        image: req.body.image,
        _id: req.params.id,
        location: {
          city: req.body.city,
          venue: req.body.venue,
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
        venue,
        currency,
        minPrice,
        maxPrice,
        website,
        description,
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
        location: { city, country, venue },
        currency,
        minPrice,
        maxPrice,
        website,
        description,
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
