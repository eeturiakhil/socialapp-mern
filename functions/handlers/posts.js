const { db } = require("../util/admin");

exports.getAllPosts = (req, res) => {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        // posts.push(doc.data());
        posts.push({
          id: doc.id,
          body: doc.data().body,
          userName: doc.data().userName,
          createdAt: doc.data().createdAt
        });
      });
      if (posts.length == 0) return res.json("No Posts");
      else return res.json(posts);
    })
    .catch(err => {
      console.log("Error: " + JSON.stringify(err));
      return res.status(500).json(err);
    });
};

exports.createPost = (req, res) => {
  const newScream = {
    body: req.body.body,
    userName: req.user.username,
    // userName: req.body.userName,
    // createdAt: admin.firestore.Timestamp.fromDate(new Date())
    createdAt: new Date().toISOString()
  };

  db.collection("posts")
    .add(newScream)
    .then(doc => {
      res
        .status(200)
        .json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
      console.log(err);
    });
};
