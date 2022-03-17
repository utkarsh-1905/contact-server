if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const app = express();
const nodemailer = require("nodemailer");

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

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS,
  },
});

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
    const findContact = await Contact.findOne({ name: data.name });
    if (findContact) {
      const msg = findContact.description.trim().toLowerCase();
      if (msg === data.description.trim().toLowerCase()) {
        res.status(200).json({
          message: "Message already sent",
          status: "ok",
        });
      }
    } else {
      const newContact = new Contact(data);
      await newContact.save();
      console.log("done");
      await transporter
        .sendMail({
          from: `"Utkarsh" <utripathi_be21@thapar.edu>`,
          to: "utripathi2002@gmail.com",
          subject: "New Contact Request from Portfolio",
          html: `From ${data.name} <br> Email: ${data.email} <br> Type: ${data.type} <br> Description: ${data.description}`,
        })
        .then(() => console.log("mail sent"));
      res.status(200).json({ message: "Message sent", status: "ok" });
    }
  } catch (e) {
    console.log(e);
    res
      .status(200)
      .json({ message: "Network error! Please try again.", status: "error" });
  }
});

app.get("/api/getContacts", async (req, res) => {
  try {
    const data = await Contact.find({});
    res.status(200).json({ data }).send(data);
  } catch (e) {
    console.log(e);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening ${port}`));
