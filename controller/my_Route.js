const express = require("express");
const multer = require("multer");
const path = require("path");
const conn = require("../database/sqldb");
const Product = require("../models/Schema");
const { console } = require("inspector");
const mysql = require("mysql");
const session = require("express-session");

const route = express.Router();

route.use(
  session({
    secret: "hello",
    resave: true,
    saveUninitialized: false,
    name: "traders",
    cookie: { maxAge: 6000 },
  })
);

route.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Store in the "public/uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file to prevent collisions
  },
});

// Initialize Multer
const upload = multer({
  storage: storage,
  // limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

route.get("/login", (req, res) => {
  res.render("login", { title: "register form", errorMsg: "" });
});

route.get("/signup", (req, res) => {
  res.render("signup", { title: "register form", errorMsg: "" });
});

route.get("/cart", (req, res) => {
  res.render("cart", { title: "register form", errorMsg: "" });
});

//  route.get('/index', (req, res)=>{
//   const data = req.query.params;

//   res.render('chart', {data,title:"register form",errorMsg:""})
//  });

route.get("/contact", (req, res) => {
  res.render("contact", { title: "register form", errorMsg: "" });
});

route.get("/about", (req, res) => {
  res.render("about", { title: "register form", errorMsg: "" });
});

route.get("/service", (req, res) => {
  res.render("index", { title: "register form", errorMsg: "" });
});

route.get("/data", (req, res) => {
  res.render("product", { title: "register form", errorMsg: "" });
});

route.get("/products/add", (req, res) => {
  res.render("add-product", { title: "register form", errorMsg: "" });
});

// POST route to handle form submission and save data to MongoDB
route.post("/products/add", upload.single("image"), async (req, res) => {
  const { title, name, price, description } = req.body;
  const image = req.file ? "/uploads/" + req.file.filename : null; // Store the image path

  if (!image) {
    console.error("Image upload failed or image is missing");
    return res.status(400).send("Image is required"); // Error response for missing image
  }

  try {
    const newProduct = new Product({
      title,
      image,
      name,
      price,
      description,
    });

    await newProduct.save(); // Save the product to MongoDB
    res.redirect("/home");
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).send("Server Error");
  }
});

route.get("/home", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("home", { products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Server Error");
  }
});

route.get("/landing", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("landing", { products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Server Error");
  }
});

route.get("/", (req, res) => {
  res.redirect("/landing");
});
//posting registration data

route.post("/reg", (req, res) => {
  console.log("Form Data:", req.body);
  const firstName = req.body.fname;
  let lastName = req.body.lname;
  let email = req.body.email;
  let pass = req.body.pass;
  let confirmpass = req.body.confirmpass;

  if (pass === confirmpass) {
    conn.connect((err) => {
      if (err) console.log(err);
      const sql_stm =
        "INSERT INTO starrs (fname, lname, email, pass) VALUES (?,?,?,?)";
      const insert_stm = conn.format(sql_stm, [
        firstName,
        lastName,
        email,
        pass,
      ]);
      conn.query(insert_stm, (err, result) => {
        if (err) console.log(err);
        res.redirect("login");
      });
    });
  } else {
    console.log(" Password mismatched");
  }
});

route.post("/signin", (req, res) => {
  const email = req.body.email;
  const pass = req.body.pass;

  const sql = "SELECT * FROM starrs WHERE email = ? AND pass = ?";
  conn.query(sql, [email, pass], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.render("login", { errorMsg: "Server error during login" });
    }

    if (results.length === 0) {
      // No matching user found
      return res.render("login", { errorMsg: "Invalid email or password" });
    }
    // create session
    try {
      req.session.user = { id: 1, email, name: "james", pass };
    } catch (error) {
      console.log(error);
    }
    // Successful login
    res.redirect("/home");
  });
});

module.exports = route;
