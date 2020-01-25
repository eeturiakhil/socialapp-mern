let db = {
  users: [
    {
      userId: "aytugfuagfafbaksf",
      email: "user@gmail.com",
      userName: "user",
      createdAt: "2020-01-17T17:06:13.228Z",
      imageUrl: "image/bfasf/asfgasfk.png",
      bio: "Hello world",
      website: "http://user.com",
      location: "Telangana, India"
    }
  ],
  posts: [
    {
      userName: "user",
      body: "This is post body",
      createdAt: "020-01-04T19:19:18.853Z",
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userName: "aruna",
      postId: "",
      body: "",
      createdAt: ""
    }
  ]
};

const userDetails = {
  // Redux data
  credentials: {
    userId: "",
    email: "",
    username: "",
    createdAt: "",
    imageUrl: "",
    bio: "",
    website: "",
    location: ""
  },
  likes: [
    {
      userName: "",
      postId: ""
    },
    {
      userName: "",
      postId: ""
    }
  ]
};
