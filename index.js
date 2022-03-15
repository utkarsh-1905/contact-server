if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const app = express();

const dbUrl = process.env.DB_URL;
const connectDB = async () => {
  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
connectDB()
  .then(() => console.log("Connected to Database"))
  .catch((e) => console.log(e));

app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/api/contact", async (req, res) => {
  try {
    const data = req.body;
    const newContact = new Contact(data);
    await newContact.save();
    console.log("done");
    res.status(200).json({ status: "ok" });
  } catch (e) {
    console.log(e);
    res.status(200).json({ status: "not-ok" });
  }
});

app.listen(process.env.PORT || 8080, () => console.log("listening"));
