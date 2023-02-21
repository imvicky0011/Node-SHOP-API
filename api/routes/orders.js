const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const Order = require("../models/order");
const Product = require("../models/product");

//handling incoming requests from /orders
router.get("/", (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .populate("product")
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              method: "GET",
              url: "http://localhost:3000/" + doc._id
            }
          }
          
        })
      })
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/:productID", (req, res, next) => {
    //before blindly creating a order, we are first checking
    //if the productID is valid
    //then we return an async order.save(),
    //this is async call, and it returns a promise
    Product.findById(req.params.productID).exec()
    .then((product) => {
        if(!product) {
            return res.status(400).json({
                message: "Product ID is invalid"
            })
        }

        //subsequent code will execute only if prouduct ID is valid
        const order = new Order({
          _id: new mongoose.Types.ObjectId(),
          product: req.body.productID,
          quantity: req.body.quantity,
        });
        
        return order.save()
    })
    .then((result) => {
      res.status(201).json({
          message: "ORDER HAS BEEN GENERATED",
          createdOrder: {
              _id: result._id,
              product: result.product,
              quantity: result.quantity,
              request: {
                  type: "POST",
                  url: "http://localhost:3000/orders/" + result._id
              }
          }
      })
    })
    .catch((err) => {
      res.status(400).json({
          error: err
      })
    })
});

router.get("/:orderID", (req, res, next) => {
  Order.findById(req.params.orderID)
    .populate("product")
    .exec()
    .then((doc) => {
      if (doc) {
        //doc results in the format of Order Schema, since .findbyId searches through the product schema.
        res.status(200).json({
          message: "Order with designated ID is fetched",
          OrderFetched: {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + doc._id,
            }
          },
        });
      }
      else {
        res.status(400).json({
          message: "ID not found",
          request: {
            method: "GET",
            url: "http://localhost:3000/orders/" + req.params.orderID 
          }
        });
      }
    })
    .catch((err) => {
        res.status(400).json({
            error: err
        })
    })
});

router.delete("/:orderID", (req, res, next) => {
  Order.remove({_id: req.params.orderID})
  .then((result) => {
    res.status(200).json({
      message: "Order deleted",
      request: {
        type: "DELETE",
        url: "http://localhost:3000/orders/" + req.params.orderID,
      }
    })
  })
  .catch((err) => {
    res.status(400).json({
      error: err
    })
  })
});

module.exports = router;
