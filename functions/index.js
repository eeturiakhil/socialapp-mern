const functions = require("firebase-functions");
const app = require("express")();
const { db } = require("./util/admin");

const {
  getAllPosts,
  createPost,
  getPost,
  commentOnPost,
  likePost,
  unlikePost,
  deletePost
} = require("./handlers/posts");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUsersDetails,
  markNotificationsRead
} = require("./handlers/users");
const fbAuth = require("./util/fbAuth");

// Get Posts route
app.get("/posts", getAllPosts);
// Create Post route
app.post("/create-post", fbAuth, createPost);
// Get Posts Data
app.get("/post/:postId", getPost);
// Delete Post Data
app.delete("/post/:postId", fbAuth, deletePost);
// Like Post
app.get("/post/:postId/like", fbAuth, likePost);
// Unlike Post
app.get("/post/:postId/unlike", fbAuth, unlikePost);
// Comment on Post
app.post("/post/:postId/comment", fbAuth, commentOnPost);

// User Signup route
app.post("/signup", signup);
// User Login route
app.post("/login", login);
// Upload profile image
app.post("/user/image", fbAuth, uploadImage);
// Add user details
app.post("/user", fbAuth, addUserDetails);
// Get user details
app.get("/user", fbAuth, getAuthenticatedUser);
// Get other user details
app.get("/user/:username", getUsersDetails);
// Get notifications
app.post("/notifications", fbAuth, markNotificationsRead);

// exports.api = functions.region('asia-south1').https.onRequest(app); // Region as example
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().userName !== snapshot.data().userName) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            recipient: doc.data().userName,
            sender: snapshot.data().userName,
            read: false,
            postId: doc.id,
            type: "like",
            createdAt: new Date().toISOString()
          });
        }
      })
      .catch(err => console.error(err));
  });

exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => console.error(err));
  });

exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().userName !== snapshot.data().userName) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            recipient: doc.data().userName,
            sender: snapshot.data().userName,
            read: false,
            postId: doc.id,
            type: "comment",
            createdAt: new Date().toISOString()
          });
        }
      })
      .catch(err => console.error(err));
  });

exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate(change => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("Image is changed");
      const batch = db.batch();
      return db
        .collection("posts")
        .where("userName", "==", change.before.data().username)
        .get()
        .then(data => {
          data.forEach(doc => {
            const post = db.doc(`/posts/${doc.id}`);
            batch.update(post, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onPostDelete = functions.firestore
  .document("/posts/{postId}")
  .onDelete((snapshot, context) => {
    const postId = context.params.postId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("postId", "==", postId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection("likes")
          .where("postId", "==", postId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("postId", "==", postId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.error(err));
  });
