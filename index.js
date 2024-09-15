import express from "express";
import mongoose from "mongoose";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());
mongoose
  .connect(
    "mongodb+srv://sripadhavigneshdev:s6mHDcLT55mCZsXw@clusterforgame.c2elv.mongodb.net/",
    {
      dbName: "gameData",
    }
  )
  .then((e) => console.log(`Data base is connected with ${e.connection.host} `))
  .catch((e) => console.log(e));

// const schema = new mongoose.Schema({
//   levelName: String,
//   content: Array,
// });

const PORT = process.env.PORT || 5000;
const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  score: {
    type: Number,
  },
});

const userRegister = mongoose.model("userData", userSchema);
// const levels = mongoose.model("levels", schema);
app.listen(PORT, () => {
  console.log("server is running");
});

app.get("/", (req, res) => {
  res.send("hello");
});
// app.get("/level/EASY", async (req, res) => {
//   const level = await levels.find({ levelName: "EASY" });
//   res.json(level);
// });
// app.get("/level/MEDIUM", async (req, res) => {
//   const level = await levels.find({ levelName: "MEDIUM" });
//   res.json(level);
// });
// app.get("/level/HARD", async (req, res) => {
//   const level = await levels.find({ levelName: "HARD" });
//   res.json(level);
// });

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate the request body
    if (!username || !email || !password) {
      return res.status(400).json({
        response: 400,
        error: "All fields are required",
      });
    }

    // Check if a user with the same username or email already exists
    const existingUser = await userRegister.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (existingUser) {
      return res.status(400).json({
        response: 400,
        error: "Username or email already exists",
      });
    }

    const user = await userRegister.create({
      username: username,
      email: email,
      password: password,
      score: 0,
    });

    res.status(201).json({
      response: 201,
      data: "Account Created Successfully",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      response: 500,
      error: "Internal Server Error",
    });
  }
});

app.get("/data", async (req, res) => {
  try {
    const userDetails = await userRegister.find({});
    res.json(userDetails);
  } catch {
    console.log("error");
  }
});

app.post("/update-score", async (req, res) => {
  try {
    const { username, email, score } = req.body;

    if (!username && !email) {
      return res.status(400).json({
        response: 400,
        error: "Username or email is required",
      });
    }
    if (score === undefined || score === null) {
      return res.status(400).json({
        response: 400,
        error: "Score is required",
      });
    }

    // Find the user by username or email
    const user = await userRegister.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (!user) {
      return res.status(404).json({
        response: 404,
        error: "User not found",
      });
    }

    // Update the user's score
    user.score = score;
    await user.save();

    res.status(200).json({
      response: 200,
      data: "Score updated successfully",
      user: {
        username: user.username,
        email: user.email,
        score: user.score,
      },
    });
  } catch (error) {
    console.error("Update Score error:", error); // Log with context
    res.status(500).json({
      response: 500,
      error: "Internal Server Error",
    });
  }
});
