const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");
const multer = require("multer");
const  path  = require("path");

const filename = `${(new Date().toJSON().slice(0,10))}`

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, filename + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limit: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

//handling incoming requests from /products
router.get("/", (req, res, next) => {
  Product.find()
  .select("name price _id productImg")
    .then((docs) => {
      const response = {
        count: docs.length,
        //this map creates a product array
        //to store all the products in DataBase, fetched by GET request
        products: docs.map((doc) => {
          //we can custom return the structure of response
          //here, we're additionally attaching the request type originally: {type, url}
          return {
            name: doc.name,
            price: doc.price,
            productImg: doc.productImg,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/", upload.single('productImage'), (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  // const file = req.files.productImage;
  // const p = path.join( __dirname, '../../' , "/uploads/" , new Date().getTime() + file.name)

  // file.mv(p, (err) => {
  //   if (err) {
  //     return res.status(500).send(err);
  //   }
  // });

  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImg: req.file.path
  });

  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Product has been Posted",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          productImg: result.productImg,
          request: {
            type: "POST",
            url: "http://localhost:300/products/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:productID", (req, res, next) => {
  const id = req.params.productID;

  Product.findById(id)
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          message: "Product with given ID is fetched",
          prodFetched: {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/" + doc._id,
            },
          },
        });
      } else {
        res.status(400).json({
            message: 'ID NOT FOUND'
        })
      }
    })
    .catch((err) => {
      console.group(err);
      res.status(400).json({ error: err });
    });
});

router.patch("/:productID", (req, res, next) => {
  const id = req.params.productID;
  Product.update({ _id: id }, { $set: req.body }, { new: true })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Product Updated",
        request: {
          type: "PATCH",
          ur: "http://localhost:3000/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:productID", (req, res, next) => {
  const id = req.params.productID;
  Product.remove({ _id: id })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Product Deleted",
        request: {
          type: "DELETE",
          url: "http://localhost:3000/" + id,
          body: { name: "String", price: "Number" },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
