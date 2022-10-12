const userModel = require("../models/userModels");
const cartModel = require("../models/cartModels");
const wishlistModel = require("../models/wishlistModel");
const couponModel = require("../models/couponModels");
const addressModel = require("../models/addressModels");
const reviewModel = require("../models/reviewModels");
const productModels = require("../models/productModels");
const orderModel = require("../models/orderModels");
const Razorpay =require('razorpay')
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");
const { response, off } = require("../app");
const { findOne, findOneAndDelete } = require("../models/adminModels");
const review = require("../models/reviewModels");
const { ObjectId } = require("mongodb");
const accountSid =process.env.accountSid 
const authToken = process.env.authToken
const serviceSid = process.env.serviceSid
const client = require("twilio")(accountSid, authToken);

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env. key_secret
});

let userHelper = {
  userCheck: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await userModel.findOne({ email: userData.email });
      if (user) {
        response.exist = true;
        resolve(response);
      } else {
        response.exist = false;
        resolve(response);
      }
    });
  },
  sendOtp: (mobile) => {
    return new Promise((resolve, reject) => {
      client.verify.v2
        .services(serviceSid)
        .verifications.create({ to: "+91" + mobile, channel: "sms" })
        .then((verification) => {
          resolve(verification);
        });
    });
  },
  verifyOtp: (otp, mobile) => {
    console.log("prasham entha muthe");
    otp =
      otp.first + otp.second + otp.third + otp.fourth + otp.fifth + otp.sixth;
    return new Promise((resolve, reject) => {
      console.log(otp, mobile);
      client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: "+91" + mobile, code: otp })
        .then((verification_check) => {
          resolve(verification_check.status);
        });
    });
  },
  doSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
      const { firstname, lastname, email, password, mobile } = userData;
      const hashedpsw = await bcrypt.hash(password, 12);
      let status = true;
      user = new userModel({
        firstname,
        lastname,
        email,
        password: hashedpsw,
        mobile,
        status,
      });
      user.save().then((data) => {
        resolve(data);
      });
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      const { email, password } = userData;
      let response = {};
      const user = await userModel.findOne({ email });
      if (!user) {
        response.status = false;
        resolve(response);
      } else {
        if (user.status) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            response.status = false;
            resolve(response);
          } else {
            response.status = true;
            response.user = user;
            resolve(response);
          }
        } else {
          response.status = "blocked";
          resolve(response);
        }
      }
    });
  },

  changeStatus: (id) => {
    return new Promise(async (resolve, reject) => {
      const user = await userModel.findById(id);
      if (user.status) {
        userModel.findByIdAndUpdate(id, { status: false }).then((data) => {
          resolve(data);
        });
      } else {
        console.log(user.status, "vgbhn");
        userModel.findByIdAndUpdate(id, { status: true }).then((data) => {
          console.log(data);
          resolve(data);
        });
      }
    });
    1;
  },

  updateUser: (data, id) => {
    return new Promise((resolve, reject) => {
      if(data.userimg==''){
        userModel
        .findByIdAndUpdate(id, {
          firstname: data.firstname,
          lastname: data.lastname,
          DOB: data.DOB,
          email: data.email,
          alternatemobile: data.alternatemobile,
          
        }).then((response) => {
          resolve(response);
        });
      }else{
        userModel
        .findByIdAndUpdate(id, {
          firstname: data.firstname,
          lastname: data.lastname,
          DOB: data.DOB,
          email: data.email,
          alternatemobile: data.alternatemobile,
          userimg: data.userimg,
        })
        .then((response) => {
          resolve(response);
        });
      }
     
    });
  },

  addToCart: (userId, productid, size1) => {
    let user_Id = mongoose.Types.ObjectId(userId);
    const response = {
      productduplicate: false,
    };

    return new Promise(async (resolve, reject) => {
      let cart = await cartModel.findOne({ user: userId });
      if (cart) {
        console.log(
          "its in ccccccccccccaaaaaaaaaaaaarrrrrrrrrrrtttttttttttttt"
        );
        let product = await cartModel.findOne({
          user: userId,
          "Cart.product": productid,
        });
        if (product) {
          console.log("inside the product");
          response.productduplicate = true;
          resolve(response);

          // let size = await cartModel.findOne({
          //   user: userId,
          //   "Cart.product": productid
          // });

          //          let checkSize= size.Cart.find(e=>{e.size == size1})
          //          console.log(checkSize);
          //           if(checkSize){
          //             console.log(
          //               "its in ssssssssssssiiiiiiiiiiiiiiiizzzzzzzzzzzzzeeeeeeeeeeee"
          //             );

          //           }else{
          //             console.log("its in an else of the sizeeeeeeeeeeeeee");
          //             let sizeArray = { product: productid, quantity: 1, size: size1 };
          //             cartModel
          //               .findOneAndUpdate(
          //                 { user: userId },
          //                 { $push: { Cart: sizeArray } }
          //               )
          //               .then((data) => {
          //                 resolve(data);
          //               });
          //           }

          //   console.log(size.Cart.length);

          // console.log(size.Cart[4].size,"size of the fucking cart");
        } else { 
          console.log("inside else of the product");
          let cartarray = { product: productid, quantity: 1, size: size1 };
          cartModel
            .findOneAndUpdate({ user: userId }, { $push: { Cart: cartarray } })
            .then(async (data) => {
              let wishlist = await wishlistModel.findOne({
                user: userId,
                "wishlist.product": productid,
              });
              if (wishlist) {
                wishlistModel
                  .findOneAndUpdate(
                    { user: userId },
                    { $pull: { wishlist: { product: productid } } }
                  )
                  .then((data) => {
                    response.data = data;
                    response.added = false;
                    resolve(response);
                  });
              }
              resolve(data);
            });
        }
      } else {
        let product = productid;
        let quantity = 1;
        let size = size1;

        let Cart = new cartModel({
          user: userId,
          Cart: [
            {
              product,
              quantity,
              size,
            },
          ],
        });
        Cart.save()
          .then(async (data) => {
            let wishlist = await wishlistModel.findOne({
              user: userId,
              "wishlist.product": productid,
            });
            if (wishlist) {
              wishlistModel
                .updateOne(
                  { user: userId },
                  { $pull: { wishlist: { product: productid } } }
                )
                .then((data) => {
                  response.data = data;
                  response.added = false;
                  resolve(response);
                });
            }
            resolve(data);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  },

  quantityPlus: (proId, userId,quantity) => {
    console.log(proId, "its in helpers pro id and sshowing pro id", userId);
    return new Promise(async(resolve, reject) => {
      let response = {};
     let product=await productModels.findById(proId).lean()
     if(product.Stock <= quantity){
      console.log("so wee win this match or else we lose run too fast to win")
      response.noStock=true;
      resolve(response)
     }else{
      cartModel
        .updateOne(
          { user: userId, "Cart.product": proId },
          { $inc: { "Cart.$.quantity": 1 } }
        )
        .then(async (data) => {
          let cart = await cartModel.findOne({ user: userId });
          let count = null;
          for (let i = 0; i < cart.Cart.length; i++) {
            if (cart.Cart[i].product == proId) {
              count = cart.Cart[i].quantity;
            }
          }
          response.count = count;
          resolve(response);
        }) .catch((err) => {
          reject(err);
        });
     }
    });
  },

  quantityMinus: (proId, userId) => {
    return new Promise((resolve, reject) => {
      cartModel
        .updateOne(
          { user: userId, "Cart.product": proId },
          { $inc: { "Cart.$.quantity": -1 } }
        )
        .then(async (data) => {
          let cart = await cartModel.findOne({ user: userId }).lean();
          let response = {};
          let count = null;
          for (let i = 0; i < cart.Cart.length; i++) {
            if (cart.Cart[i].product == proId) {
              count = cart.Cart[i].quantity;
            }
          }
          if (count == 0) {
            console.log("its inside the count is 0");
            cartModel
              .updateOne(
                { user: userId },
                { $pull: { Cart: { product: proId } } }
              )
              .then((data) => {
                response.data = data;
              });
          }
          response.count = count;
          resolve(response);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let cartitems = await cartModel
        .findOne({ user: userId })
        .populate("Cart.product")
        .lean();
      if (cartitems) {
        if (cartitems.Cart.length > 0) {
          console.log(cartitems.Cart.length);
          response.notEmpty = true;
          response.cart = cartitems;
          resolve(response);
        } else {
          response.notEmpty = false;
          resolve(response);
        }
      } else {
        response.notEmpty = false;
        resolve(response);
      }
    });
  },

  deleteFromCart: (userId, proId) => {
    return new Promise((resolve, reject) => {
      cartModel
        .updateOne(
          { user: userId },
          {
            $pull: {
              Cart: { product: proId },
            },
          }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cartProduct = await cartModel.findOne({ user: userId });
      if (cartProduct) {
        count = cartProduct.Cart.length;
      }
      resolve(count);
    }) .catch((err) => {
      reject(err);
    });
  },

  cartTotal: ({ cart }) => {
    return new Promise((resolve, reject) => {
      let total = cart.Cart.reduce((acc, curr) => {
        acc = acc + curr.product.price * curr.quantity;
        return acc;
      }, 0);
      let response = {};
      let shiping = 0;
      if (total < 10000) {
        shiping = 100;
      }
      response.shiping = shiping;
      response.total = total;
      response.grandTotal = response.shiping + response.total;
      if (cart.discount) {
        response.grandTotal = response.grandTotal - cart.discount;
        response.grandTotal=parseInt(response.grandTotal)
        response.discount = cart.discount;
      }
      resolve(response);
    }) .catch((err) => {
      reject(err);
    });
  },

  addToWishlist: (proId, userId) => {
    const response = { wishlistDuplicate: false };
    return new Promise(async (resolve, reject) => {
      let user = await wishlistModel.findOne({ user: userId });
      if (user) {
        let Wishlist = await wishlistModel
          .findOne({ user: userId, "wishlist.product": proId })
          .lean();
        if (Wishlist) {
          console.log("oops the item already exist");
          response.wishlistDuplicate = true;
          resolve(response);
        } else {
          console.log("its in the user exist and the product not exist");
          let productArray = { product: proId };
          wishlistModel
            .findOneAndUpdate(
              { user: userId },
              { $push: { wishlist: productArray } }
            )
            .then((data) => {
              response.added = true;
              response.data = data;
              resolve(response);
            });
        }
      } else {
        let product = proId;
        let user = userId;
        const Wishlist = new wishlistModel({
          user: userId,
          wishlist: [
            {
              product,
            },
          ],
        });
        Wishlist.save().then((data) => {
          response.added = true;
          response.data = data;
          resolve(response);
        });
      }
    }) .catch((err) => {
      reject(err);
    });
  },

  getAllWishlist: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishlist = await wishlistModel
        .findOne({ user: userId })
        .populate("wishlist.product")
        .lean();
      resolve(wishlist);
    }) .catch((err) => {
      reject(err);
    });
  },

  DeleteFromWishlist: (proId, userId) => {
    return new Promise((resolve, reject) => {
      wishlistModel
        .findOneAndUpdate(
          { user: userId },
          { $pull: { wishlist: { product: proId } } }
        )
        .then((data) => {
          resolve(data);
        });
    }) .catch((err) => {
      reject(err);
    });
  },

  getWishlistCount: (userId) => {
    console.log(
      userId,
      "wishlist wishlist wishlist wishlist wishlist wishlist wishlist wishllist"
    );

    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlistcount = await wishlistModel.findOne({ user: userId });
      if (wishlistcount) {
        count = wishlistcount.wishlist.length;
      }
      resolve(count);
    })
    .catch((err) => {
      reject(err);
    });
  },

  applyCoupon: (Code, userId) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      response.discount = 0;
      Code = Code.code;
      let coupon = await couponModel.findOne({ code: Code });

      console.log(
        coupon,
        "it is to check wheather this coupen helper conditions are working or not"
      );

      if (coupon) {
        let couponUser = await couponModel.findOne({
          code: Code,
          user: { $in: [userId] },
        });
        console.log(userId, "applcpon", couponUser);
        if (couponUser) {
          response.status = false;
          resolve(response);
        } else {
          response.status = true;
          response.coupon = coupon;
          userHelper.getCartProducts(userId).then((cartProduct) => {
            console.log(
              cartProduct,
              "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh"
            );
            userHelper.cartTotal(cartProduct).then((total) => {
              console.log(
                total.grandTotal,
                coupon.percentage,coupon.maximum,
                "it is to check wheather the apply coupon is working or not afathi yaaa"
              );
              response.discount = (total.grandTotal * coupon.percentage) / 100;
              if(response.discount > coupon.maximum ){
               response.discount = coupon.maximum
               response.grandTotal = total.grandTotal - response.discount;
               console.log(
                 response.discount,
                 response.grandTotal,
                 "i think its working"
               );
               resolve(response);
              }else{
                
                response.grandTotal = total.grandTotal - response.discount;
                console.log(
                  response.discount,
                  response.grandTotal,
                  "biaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaiiiiiiiiiiiii i"
                );
                resolve(response);
              }

            });
          });
        }
      } else {
        response.status = false;
        console.log("is this else is working of apply Coupons");
        resolve(response);
      }
    });
  },

  getCoupon:(id)=>{
    return new Promise(async(resolve,reject)=>{
    let response={}
    let coupon = await couponModel.find({ user:{$ne:id}}).lean()
    if(coupon.length>0){
      response.coupons=coupon
      resolve(response)
    }else{
      response.nothing=true;
      resolve(response)
    }
    
  }) .catch((err) => {
    reject(err);
  });
  },

  addAddress: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      let defaultAddress = null;
      let address = await addressModel.findOne({ user: userId }).lean();
      if (address) {
        console.log(
          address,
          "address Adress Adress Adress Adress Address Address"
        );
        defaultAddress = false;
      } else {
        defaultAddress = true;
      }
      console.log(
        userId,
        "it is the user id in the add adderess sidre to checj rhe id"
      );
      let Address = new addressModel({
        user: userId,
        Name: data.Name,
        mobile: data.mobile,
        Address1: data.Address1,
        Address2: data.Address2,
        pincode: data.pincode,
        Area: data.Area,
        District: data.District,
        State: data.State,
        Type: data.Type,
        defaultAddress,
      });
      Address.save().then((address) => {
        resolve(address);
      });
    });
  },

  getAllAddresses: (id) => {
    return new Promise(async (resolve, reject) => {
      let address = await addressModel.find({ user: id }).lean();
      resolve(address);
    })
    .catch((err) => {
      reject(err);
    });
  },

  deleteAddress: (id) => {
    return new Promise((resolve, reject) => {
      addressModel.findByIdAndRemove(id).then((response) => {
        resolve(response);
      });
    })
    .catch((err) => {
      reject(err);
    });
  },

  addReview: (productId, data, userId) => {
    return new Promise(async (resolve, reject) => {
      let usercheck = await reviewModel.findOne({
        product: productId,
        "Rating.user": userId,
      });
      if (usercheck) {
        console.log("the if condition of the add rewiew is working");
        let reviewArray = {
          user: userId,
          rating: data.rating,
          Title: data.Tile,
          review: data.rewiew,
        };
        reviewModel
          .findOneAndUpdate(
            { product: productId },
            {
              $set: {
                Rating: [
                  {
                    user: userId,
                    rating: data.rating,
                    Title: data.Title,
                    review: data.review,
                  },
                ],
              },
            }
          )
          .then((responses) => {
            console.log(
              responses,
              "it is the response in the add reviwe  at user helper to check wheather it is saving or not"
            );
            resolve(responses);
          });
      } else {
        let Review = new reviewModel({
          product: productId,
          Rating: [
            {
              user: userId,
              rating: data.rating,
              Title: data.Title,
              review: data.review,
            },
          ],
        });
        Review.save().then((response) => {
          console.log(
            response,
            "it is the response in the add reviwe  at user helper to check wheather it is saving or not"
          );
          resolve(response);
        });
      }
    });
  },

  getReview: (id) => {
    return new Promise(async (resolve, reject) => {
      let review = await reviewModel.find({ product: id }).populate('Rating.user').lean();
      resolve(review);
    })
    .catch((err) => {
      reject(err);
    });
  },

  PlaceOrder: (data, userId) => {
    let orderStatus;
    return new Promise(async (resolve, reject) => {
      if (data.paymentMethod === "COD") {
        orderStatus = true;
      }
      console.log(data);
      userHelper.getCartProducts(userId).then((cartProducts) => {
        userHelper.cartTotal({ cart: cartProducts.cart }).then((response) => {
          if (data.discount) {
            response.grandTotal = response.grandTotal - data.discount;
          }
          let order = new orderModel({
            user: userId,
            orderItems: cartProducts.cart.Cart,
            totalPrice: response.grandTotal,
            deliveryCharge: response.shiping,
            deliveryDetails: data.address,
            paymentDetails: data.paymentMethod,
            discount:data.discount,
            orderStatus,
          });
          order.save().then(async (data) => {
            let cartItems = cartProducts.cart.Cart;
            for (let i = 0; i < cartItems.length; i++) {
              console.log(cartItems.product,cartItems.quantity,cartItems,"the quantity of cart item in teh loop been decreased every time and its not seeing anywherer theats why i am writing this unlimited code to excibit the local eyes on focus on this words and write something")
              productModels
                .findByIdAndUpdate(cartItems[i].product, {
                  $inc: { Stock: -cartItems[i].quantity },
                })
                .then((data) => {
                  console.log(data);
                });
            }
            resolve(data);
          });
        });
      });
    });
  },

  couponUser: (userId, coupon) => {
    console.log(
      coupon._id,
      "couponid dskfjlsdhfsadhglkdfj couponid sdjfhhbsjdafh  couponId"
    );
    return new Promise((resolve, reject) => {
      couponModel
        .findByIdAndUpdate(coupon._id, { $push: { user: userId } })
        .then((data) => {
          console.log("hhh", data);
          resolve(data);
        });
    });
  },

  changeOrderStatus: (id, userId) => {
    console.log(id,"it is to check that wheather the order id and the user  id are corect or not")
    return new Promise(async (resolve, reject) => {
      orderModel
        .findOneAndUpdate(
          { _id: id },
          { orderStatus: true, deliveryStatus: "processing" }
        )
        .then((data) => {
          console.log(data, "we're here");
          cartModel.findOneAndRemove({ user: userId }).then(() => {
            console.log("if it reached here it must be removed from the cart lets check it again whats the matteer")
            resolve();
          });
        });
    })
    .catch((err) => {
      reject(err);
    });
  },

  generateRazorPay:(orderId,userId)=>{
    console.log(orderId,"it is the orderid",userId)
    let money = orderId.totalPrice * 100;
    money = parseInt(money);
    return new Promise((resolve,reject)=>{
      var options = {
        amount: money,
        currency: "INR",
        receipt: ""+orderId._id,
       };
       instance.orders.create(options,function(err,order){
        console.log(order,"is the console of orders in razorpay gateway")
        console.log(err)
        order.user=userId;
        resolve(order);
       })
      
    })
  },

  verifyPayment: (data) => {
    return new Promise(async (resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "nwO204ilMnnkhlHyEKTTbPvE");
      let body =
        data.payment.razorpay_order_id + "|" + data.payment.razorpay_payment_id;
      hmac.update(body.toString());
      hmac = hmac.digest("hex");
      if (hmac == data.payment.razorpay_signature) {
        resolve();
      } else {
        reject();
      }
    });
  },

  getOrder: (id) =>{
    return new Promise((resolve,reject)=>{
      console.log(id,"just checking the id for the working it so properly and safelg")
      orderModel
      .findById(id)
      .populate('orderItems')
      .populate("orderItems.product")
      .populate('orderItems.product.Category')
      .populate('deliveryDetails')
      .lean()
      .then((order)=>{
        console.log(order,"just checking the id for the working it so properly and safelg")

        resolve(order)
      })
      .catch((err)=>{
        reject(err)
      })
    })
  },

  orderManagment:(id)=>{
    return new Promise((resolve,reject)=>{
      orderModel
      .find({ user:id })
      .populate('orderItems')
      .populate("orderItems.product")
      .populate('orderItems.product.Category')
      .populate('deliveryDetails')
      .sort({'createdAt':-1})
      .lean()
      .then((order)=>{
        resolve(order)
      })
    })
  },

  cancelOrder: (id)=>{
    return new Promise((resolve,reject)=>{
      orderModel.findOneAndUpdate({_id:id},{deliveryStatus:"Cancelled"}).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    })
    .catch((err) => {
      reject(err);
    });
   },
  
   
};
module.exports = userHelper;
