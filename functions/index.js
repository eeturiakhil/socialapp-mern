const functions = require("firebase-functions");

const app = require("express")();

const { getAllPosts } = require("./handlers/posts");
const { createPost } = require("./handlers/posts");
const { signup, login } = require("./handlers/users");
const fbAuth = require("./util/fbAuth");

// Get Posts route
app.get("/posts", getAllPosts);
// Create Post route
app.post("/create-post", fbAuth, createPost);
// User Signup route
app.post("/signup", signup);
// User Login route
app.post("/login", login);

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   response.send("Hello World!");
// });

// exports.getScreams = functions.https.onRequest((req, res) => {
//   admin
//     .firestore()
//     .collection("posts")
//     .get()
//     .then(data => {
//       let posts = [];
//       data.forEach(doc => {
//         posts.push(doc.data());
//       });
//       return res.json(posts);
//     })
//     .catch(err => {
//       console.log("Error: " + JSON.stringify(err));
//     });
// });

// exports.createScream = functions.https.onRequest((req, res) => {
//   if (req.method != "POST") {
//     return res.status(400).json({ error: "Method not allowed" });
//   }
//   const newScream = {
//     body: req.body.body,
//     userName: req.body.userName,
//     createdAt: admin.firestore.Timestamp.fromDate(new Date())
//   };

//   admin
//     .firestore()
//     .collection("posts")
//     .add(newScream)
//     .then(doc => {
//       res
//         .status(200)
//         .json({ message: `document ${doc.id} created successfully` });
//     })
//     .catch(err => {
//       res.status(500).json({ error: err.message });
//       console.log(err);
//     });
// });

// exports.api = functions.region('asia-south1').https.onRequest(app); // Region as example
exports.api = functions.https.onRequest(app);
