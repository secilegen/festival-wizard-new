# Festival Wizard
​
## Description
​
Platform displaying music festivals and information about them
​
## Features
​
* **Browse All** / **Festivals** List of all Festivals in the database
* **Search** by festival name, country, genre or a combination of the 3
* **See Details** View more details of a selected festival
* **I'm feeling Lucky** Link to a random festival
* **Popular Festivals** Festivals most popular with users
* **Recently Added** Festivals most recently added
* **Logo top left** which always links to the home page 
* **Sign-up** One time sign up for the website
* **Login** Log in to view extra features
* **Profile** Link to user profile including a list of favorite festivals
* **Add Favorite** / **Remove Favorite**
* **Create Festival** Create a new festival (admin oniy)
* **Edit** Edit selected festival (admin only)
* **Delete** Delete selected festival (admin only)
* **Comprehensive error handling**
​
​
## ROUTES:
​
In auth.route.js
​
* GET /sign-up
  * Only accessible if the user is not logged in (isLoggedOut)
  * Renders the signup page using auth/sign-up.hbs
​
* POST /sign-up
  * Sets variables email and password to the equivalent values contained in req.body
  * Encrypts the password to create the new variable hashedPassword
  * Redirects to the page /login when sign up is complete
​
* GET /login
  * Only accessible if the user is not logged in (isLoggedOut)
  * Renders the login page using auth/login.hbs
​
* POST /login
  * Checks that an email and password has been set. If not, renders an error message
  * Checks that the password matches the email. If not, renders an error message
  * Checks that there is a user stored for the email address. If not, renders an error message
  * Sets the variable req.session.currentUser to the current user
  * Redirects to the page /profile when login is complete
​
* GET /profile
  * Only accessible if the user is logged in (isLoggedIn)
  * Finds the user corresponding to req.session.currentUser
  * Populates the user with info from the festivals model
  * Renders the Profile page using user/profile.hbs
​
* POST /logout
  * Only accessible if the user is logged in (isLoggedIn)
  * Logs out the user using req.session.destroy
  * Redirects to the page /login
​
​
In festival.routes.js
​
* GET /festivals/create
  * Renders the Create festival page using festivals/new-festival-form.hbs
  * Passes the array {countries} which contains all countries in the world (other routes do the same thing)
​
* POST /festivals/create
  * Uploads an image file using fileUploader
  * Uses the function inputChecked to check the inputted values
    * If any mandatory variables have not been sets, renders an error message
    * If a "minimum" value is set but no "maximum", sets the maximum to the minimum and renders a warning message
    * If a "maximum" value is set but no "minimum", sets the minimum to the maximum and renders a warning message
    * If the "minimum" is greater than the "maximum", sets the maximum to the minimum and renders a warning message
  * If any inputted values are invalid, reproduces the previous page with an added message at the bottom of the screen
  * If all inputted values are valid, create a const containing these values
  * If no image has been selected, set imageURL to the default picture
  * Updates the Festival object
  * Redirects to the page /festivals/ID, where ID is the festival ID
​
* GET /festivals/lists
  * Finds all festivals in the array Festival
  * Renders a page containing all festivals using festivals/all-festivals.hbs
​
* GET /search
  * Checks whether search filters for Festival Name, Country and/or Genre have been selected
  * If no filters have been set posts a Warning message asking the User to select at least one category before pressing the Search button
  * Otherwise, searches the array Festival for all cases matching the selected filters
  * Renders the search results using festivals/some-festivals.hbs
​
* GET /festivals/:festivalID
  * If there is a current user, sets the boolean isIncludingFav to say whether the current user has selected any favourite festivals
  * Finds the Festival corresponding to festivalID
  * Renders this festival using festivals/festival-details.hbs
​
* GET delete-festival/:id
  * Finds the festival corresponding to id and deletes it
  * Redirects to the page /festivals/list
​
* GET /festivals/:id/edit
  * Finds the Festival corresponding to :id
  * Renders the Edit Festival page using /festivals/edit-festival.hbs
​
*  GET /festivals/:id/fav
   * Finds the festival corresponding to :id
   * Increments favorited, the variable giving the number of favourites for this user, by 1
   * Adds the found festival to festivals:req.params.id
   * Redirects to the page /festivals/${req.params.id}
​
*  GET /festivals/:id/unfav
   * Finds the festival corresponding to :id
   * Decrements favorited, the variable giving the number of favourites for this user, by 1
   * Removes the found festival from festivals:req.params.id
   * Redirects to the page /festivals/${req.params.id}
​
* POST /festivals/:id/edit
  * Sets the variable festivalEdit to the information for the route in req.body
  * Renders the Edit Festival page using /festivals/edit-festival.hbs
  * find the festival corresponding to :id
  * Redirects to the page /festivals/ID, where ID is the festival ID
​
​
In index.routes.js
​
* GET /
  * Finds and sorts favourited festivals
  * Calculates the smost popular festivals
  * Finds a sort the most resent festivals
  * Renders the home page using index.hbs
​
## MODELS:
​
* Festival schema:
  * name: Festival name - mandatory String
  * imageURL: Link to the image - String (default provided)
  * startDate, endDate - dates in String format. startDate is mandatory
  * artists: Names of artists performing - array of strings
  * location: country, city, and venue - 3 separate strings, country and city are mandatory
  * currency: currency for ticket prices - string (possible values '--','€','$', and'£') 
  * minPrice, maxPrice - showing range of ticket prices, both numbers
  * website: website in String format. Mandatory
  * description: string
  * Genre: array of strings with possible values 'Rock', 'Pop', 'Electronic', 'Folk', 'Techno', and 'Classical'
  * users: array containing the type and ref of all users
  * favourited: number of favourites - type Number, default 0
​
* User schema
  * eMail - mandatory unique String. Saved in lowercase format
  * passwordHash: encrypted password - mandatory String
  * firstName, lastName: names of user - strings
  * Location: country, city and venue - all strings
  * isAdmin: whether the user has admin rights - boolean (default false)
  * Festivals: array containing the type and ref of festivals connected with this user
​
​
## LINKS
​
* Miro board https://miro.com/app/board/uXjVPvvuCdc=/
* Github https://github.com/team-phil-sec/festival-wizard
* Presentation https://docs.google.com/presentation/d/1Rh2fEt2Fz9753MsF1YgZR2ZuKY34s5pC4cVh__uU_-M/edit#slide=id.p