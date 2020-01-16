const { db } = require("../util/admin");
const firebase = require("firebase");
const config = require("../util/config");

const { validateSignupData, validateLoginData } = require("../util/helpers");

firebase.initializeApp(config);

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    username: req.body.username
  };

  const { valid, errors } = validateSignupData(newUser);
  if (!valid) return res.status(400).json(errors);

  //   TODO validate data
  let userId, token;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ username: "This username is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: userId
      };
      return db.doc(`/users/${newUser.username}`).set(userCredentials);
    })
    .then(() => {
      res.status(201).json({ token });
    })
    .catch(err => {
      console.log("Error: " + JSON.stringify(err));
      if (err.code === "auth/email-already-in-use") {
        res.status(400).json({ email: "Email is already in use" });
      } else if (err.code === "auth/weak-password") {
        res
          .status(400)
          .json({ email: "Password must be atleast 6 characters" });
      } else {
        res.status(500).json({ error: err.code });
      }
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.log(err);
      if (err.code == "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try later" });
      } else if (err.code == "auth/user-not-found") {
        res.status(403).json({ general: "No user found with this email" });
      } else return res.status(500).json({ error: err.code });
    });
};
