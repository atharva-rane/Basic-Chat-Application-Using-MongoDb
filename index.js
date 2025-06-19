const express = require("express");
const app = express();
let mongoose = require("mongoose");
const path = require("path");
const Chat = require("./MODELS/chat.js");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

main()
  .then(() => {
    console.log("Connection Successful.");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/fakeWhatsapp");
}

//asyncWrap
let asyncWrap = (fn) => {     // Accepts an async function `fn`
  return function (req, res, next) { // Returns a new function Express can call
    fn(req, res, next) // Executes the original async function
    .catch((err) => next(err)); // Catches any rejected Promise (error) and passes it to Express
  };
};


// Index Route
app.get(
  "/chats",
  asyncWrap(async (req, res, next) => {
    let chats = await Chat.find();
    res.render("index.ejs", { chats });
  })
);

app.get("/", (req, res) => {
  res.send("Route is working.");
});

// New Route
app.get("/chats/new", (req, res, next) => {
  try {
    res.render("new.ejs");
  } catch (err) {
    next(err);
  }
  // throw new ExpressError(404, "Page Not Found");
});

// Create Route
app.post(
  "/chats",
  asyncWrap(async (req, res, next) => {
    let { from, to, msg } = req.body;
    let newChat = new Chat({
      from: from,
      to: to,
      msg: msg,
      created_at: new Date(),
    });

    await newChat.save();
    res.redirect("/chats");
  })
);

app.get(
  "/chats/:id/edit",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let chat = await Chat.findById(id);
    res.render("edit.ejs", { chat });
  })
);

//NEW - Show Route
app.get(
  "/chats/:id",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let chat = await Chat.findById(id);
    if (!chat) {
      next(new ExpressError(500, "Chat Not Found"));
    }
    res.render("edit.ejs", { chat });
  })
);

//Update Route
app.put(
  "/chats/:id",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let { msg: newMsg } = req.body;

    let updatedChat = await Chat.findByIdAndUpdate(
      id,
      { msg: newMsg },
      { runValidators: true, new: true }
    );

    console.log(updatedChat);
    res.redirect("/chats");
  })
);

//Destroy Route
app.delete(
  "/chats/:id",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let deletedChat = await Chat.findByIdAndDelete(id);
    console.log(deletedChat);
    res.redirect("/chats");
  })
);

//Handliing Mongoose Errors: Validation & Cast
app.use((err,req,res,next) => {
    if(err.name === "ValidationError"){
        console.log("Error: ValidationError")
        res.send("ValidationError");
    }else if(err.name === "CastError"){
        console.log("Error: CastError")
        res.send("CastError");
    }
    next(err);
})

//Error Handling Middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Some Error" } = err;
  res.status(status).send(message);
});

app.listen(8080, () => {
  console.log("App listening on port 8080.");
});
