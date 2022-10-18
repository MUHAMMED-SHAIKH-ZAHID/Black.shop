var express = require("express");
const app = require("../app");
var router = express.Router();
const multer=require('multer')
const UserModel = require("../models/userModels");
const addressModal= require('../models/addressModels')
const bcrypt = require("bcrypt");
const userHelper = require("../helpers/userHelper");
const { response } = require("../app");
const adminHelper = require("../helpers/adminHelper");
const user = require("../models/userModels");
const product = require("../models/productModels");
const { resolve } = require("promise");
const { validateRequest } = require("twilio/lib/webhooks/webhooks");
const session = require("express-session");

// ==========================MULTER==========================//

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-images/image-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const upload=multer({storage:multerStorage})

//==========================================================//

const isLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

const notLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect("/user-home");
  } else {
    next();
  }
};

/* GET home page. */
router.get("/", function (req, res, next) {
  adminHelper.getAllBanner().then((banner)=>{
    adminHelper.getallproducts().then((product) => {
      adminHelper.getAllCategory().then((category)=>{
        let users = req.session.users;
        let user = true;
        let loggedIn = req.session.loggedIn;
        res.render("user/user-home", { loggedIn, users, product, user,banner,category});

      })
    });
  })
});

router.get("/user-home", (req, res) => {
  res.redirect("/");
});

router.post("/register", async (req, res) => {
  userHelper.userCheck(req.body).then((response) => {
    if (response.exist) {
      res.redirect("/login");
    } else {
      userHelper.sendOtp(req.body.mobile).then((data) => {
        req.session.user = req.body;
        req.session.mobile = req.body.mobile;
        res.redirect("/signUpOtp");
      });
    }
  });
});

router.get("/signUpOtp", (req, res) => {
  var mobile = req.session.mobile;
  otpCheck = req.session.otpCheck;
  req.session.otpcheck = null;
  console.log(otpCheck,"its the data of otp check in the singupp otp varify and lets check the otpCheck")
  res.render("user/signUpOtp",{mobile,otpCheck});
});

router.get("/signupform", (req, res) => {
  res.render("user/signupform", { user: false, layout: "formlayout" });
});

router.post("/signUpOtpVerify", (req, res) => {
  userHelper.verifyOtp(req.body, req.session.mobile).then((check) => {
    if (check === "approved") {
      req.session.otpcheck = false;
      userHelper.doSignUp(req.session.user).then((data) => {
        res.redirect("/login");

      });
    } else {
      req.session.otpCheck = true;
      res.redirect("/signUpOtp");
    }
  });
});

router.post("/login",notLogin, async (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    console.log(response,"wwwwwwwww")
    if(response.status === "blocked"){
      console.log("wwwwwoooooooooowwwwwwwwwww");
        req.session.logInError = "User Blocked"
        res.redirect("/login");
    }else{
      
      if (response.status) {
        req.session.loggedIn = true;
        req.session.users = response.user;
        res.redirect("/");
      } else {
        req.session.logInError = "Invalid Email Or Password ";
        res.redirect("/login");
      }
    }
  });
});

router.get("/login",notLogin, (req, res) => {
  let logInError = req.session.logInError;
  req.session.logInError = null;
  res.render("user/login", { user: false, logInError });
});

let proid;
router.get("/singleProduct/:id", (req, res,next) => {
 try{
  let users = req.session.users;
  let loggedIn = req.session.loggedIn;
  console.log(req.params.id);
  proid = req.params.id;
  adminHelper.getsingleproduct(req.params.id).then((products) => {
    userHelper.getReview(req.params.id).then((review)=>{
      res.render("user/singleproduct", {loggedIn,users, products,user:true,review:review[1]});
    })
  }).catch((err)=>{
    next(err)
  })
 }catch(err){
  next(err)
 }
});

// router.get("/user-cart",(req,res)=>{
//   let users = req.session.users;
//   let loggedIn = req.session.loggedIn;
//   res.render("user/cart",{user:true,users,loggedIn})
// })

router.post('/addToCart/:id',isLogin,(req,res,next)=>{
  console.log("wow the axios is working huraaaaaaaaaaaay");
  console.log(req.body);
  console.log(req.session);
  let userId=req.session.users._id
  let productId=req.params.id;
  let size1=req.body.size
  userHelper.addToCart(userId,productId,size1).then((response)=>{
    res.json({response})
  }).catch((err)=>{
    next(err)
  })

})

router.post('/quantityplus/:id',isLogin,(req,res,next)=>{
  console.log("to check wheather axios on quantity plus is working o r nnooooot");
  userHelper.quantityPlus(req.params.id,req.session.users._id,req.body.quantity).then((response)=>{
    res.json({response})
  }).catch((err)=>{
    next(err)
  })                                                                                                                                                                                    
})

router.post('/quantityminus/:id',isLogin,(req,res,next)=>{
  console.log("it is to check wheather the axios of quantity minus is working or not",req.params.id)
  userHelper.quantityMinus(req.params.id,req.session.users._id).then((response)=>{
    res.json({response})
  }).catch((err)=>{
    next(err)
  })
})

router.get('/Cart',isLogin,(req,res)=>{
  let session=req.session;
  let loggedIn=req.session.loggedIn
  let users = req.session.users;
  req.session.coupon=null;
  req.session.discount=null;
  userHelper.getCartProducts(req.session.users._id).then((response)=>{
    if(response.notEmpty){
      let cart=response.cart;
      userHelper.getCoupon(req.session.users._id).then((data)=>{
        console.log(data,"data data data on of the get coupon of user .js ")
        res.render('user/cart',{cart,user:true,session,loggedIn,data,response})
    })
    }else{
      res.render('user/cart',{user:true,loggedIn,response,session,users})
    }
    })
  
})

router.post('/deleteFromCart/:id', isLogin, (req, res,next) => {
  userHelper.deleteFromCart(req.session.users._id, req.params.id).then((response) => {
    console.log(response,"its the response from delete from cart");
    res.json({ response })
  }).catch((err)=>{
    next(err)
  }) 
})  

router.get('/cartCount',(req,res)=>{
  userHelper.getCartCount(req.session.users._id).then((response)=>{
    res.json({response})
  })
})

router.get('/Wishlist',isLogin,(req,res)=>{
  let user = req.session.users
  let session=req.session
  let loggedIn=req.session.loggedIn
  userHelper.getAllWishlist(user).then((wishlist)=>{
    res.render('user/wishlist',{wishlist,user:true,loggedIn,session})
  })
 
})

router.get('/wishlist/:id',isLogin,(req,res)=>{
  console.log("item in the wishlist ");
  userHelper.addToWishlist(req.params.id,req.session.users._id).then((response)=>{
    res.json({response})
  })
})

router.post('/RemoveFromWishlist/:id',isLogin,(req,res)=>{
  console.log("it is just to check wheather the remove wishlist is working")
  userHelper.DeleteFromWishlist(req.params.id,req.session.users._id).then((response)=>{
    res.json({response})
  })
})

router.get('/wishlistCount',(req,res)=>{
  userHelper.getWishlistCount(req.session.users._id).then((response)=>{
   res.json({response})
  })
})

router.post('/applyCoupon',isLogin,(req,res)=>{
  userHelper.applyCoupon(req.body,req.session.users._id).then((response)=>{
    console.log(response,"testing testing testing testing testing testing")
    if(response.status){
      req.session.coupon=response.coupon;
      req.session.discount=response.discount
    }
    res.json({response})
  })
})

router.post('/showCoupon',isLogin,(req,res)=>{
  adminHelper.getAllCoupons().then((response)=>{
    res.json(response)
  })
})

router.get('/dashbord',isLogin,(req,res)=>{
  let loggedIn = req.session.loggedIn;
  adminHelper.getOneUser(req.session.users._id).then((users)=>{
    userHelper.getAllAddresses(req.session.users._id).then((address)=>{
      userHelper.orderManagment(req.session.users._id).then((order)=>{
        let a=JSON.stringify(order)
        res.render('user/dashbord',{user:true,users,address,order,loggedIn})
 })
})
})
})

router.get('/orderDetails/:id',isLogin,(req,res,next)=>{
  let session=req.session;
  let loggedIn=req.session.loggedIn
  let users = req.session.users;
  userHelper.getOrder(req.params.id).then((order)=>{
    console.log(req.session)
    res.render('user/orderDetails',{user:true,order,session,loggedIn,users})
  }).catch((err)=>{
    next(err)
  })
})



router.post('/updateUser',upload.array('userimg',1),isLogin,(req,res)=>{
  console.log("testing wheather the update user is working or notoooooooooooooooooooooooooooooooooooooooooooo")
  const images=req.files
  let array=[]
  array= images.map((values)=>values.filename)
  req.body.userimg=array
 userHelper.updateUser(req.body,req.session.users._id).then((data)=>{
  res.redirect('/dashbord')
 })
})

router.post('/addAddress',isLogin,(req,res)=>{
  userHelper.addAddress(req.body,req.session.users._id).then((response)=>{
    res.redirect('/dashbord')
  })
})
router.post('/addAddress1',isLogin,(req,res)=>{
  userHelper.addAddress(req.body,req.session.users._id).then((response)=>{
    res.redirect('/checkout')
  })
})

router.post('/deleteAddress/:id',isLogin,(req,res,next)=>{
  userHelper.deleteAddress(req.params.id).then((response)=>{
    res.json(response)
  }).catch((err)=>{
    next(err)
  })
})

router.post('/review/:id',isLogin,(req,res,next)=>{
  userHelper.addReview(req.params.id,req.body,req.session.users._id).then((response)=>{
    res.redirect('/singleProduct/'+req.params.id)
  }).catch((err)=>{
    next(err)
  })
})

router.get('/checkout',isLogin,(req,res)=>{
  let session=req.session;
  let loggedIn=req.session.loggedIn
  let users = req.session.users;
  userHelper.getAllAddresses(req.session.users._id).then((address)=>{
    userHelper.getCartProducts(req.session.users._id).then((response)=>{
      let cartProducts=response.cart;
      if(req.session.discount){
       cartProducts.discount = req.session.discount;
       console.log(req.session.discount,"is it the discount of the cart")
      }
      userHelper.cartTotal({cart:cartProducts}).then((response)=>{
        res.render('user/checkout',{user:true,response,session,cartProducts,address,users,loggedIn})
      })
    })
  })

})

router.post('/payment',isLogin,(req,res)=>{
  console.log(req.body,"it is the request body of payment method")
  let checkoutAddress=req.body.address
  req.session.checkoutAddress=checkoutAddress
  res.json({checkoutAddress})
})

router.get('/paymentMethod',isLogin,((req,res)=>{
  console.log('slfja;lfsdkj')
  let session=req.session;
  let loggedIn=req.session.loggedIn
  addressModal.findById(req.session.checkoutAddress).lean().then((address)=>{
    userHelper.getCartProducts(req.session.users._id).then((response)=>{
      if(!response.notEmpty){
        res.redirect('/')
      }else{
        let cartProducts=response.cart;
        if(req.session.discount){
          cartProducts.discount = req.session.discount;
        }
        console.log(cartProducts)
        userHelper.cartTotal({cart:cartProducts}).then((response)=>{
          res.render('user/paymentMethod',{user:true,response,session,cartProducts,address,loggedIn})
        })
      }
    }).catch((err)=>{
      console.log(err)
      res.redirect('/')
    })
  }).catch((err)=>{
    console.log(err,"address error")
  })
}))

router.post("/placeOrder", isLogin, (req, res) => {
  orderDetails = req.body;
  if (req.session.coupon) {
    orderDetails.discount = req.session.discount;
  }
  userHelper.PlaceOrder(orderDetails,req.session.users._id).then(async (order) => {
    console.log(order._id,"so it is the order id of the order id order id OrderId orderId ORDERID oRDERiD")
    if (order.paymentDetails === "COD") {
      if (req.session.coupon) {
        await userHelper.couponUser(
          req.session.users._id,
          req.session.coupon
        );
      }
      userHelper
        .changeOrderStatus(order._id,req.session.users._id)
        .then((data) => {
          console.log(data, "this line 352");
          req.session.coupon = null;
          res.json({ order });
        });
    } else {
      userHelper.generateRazorPay(order, req.session.users).then((data) => {
        console.log(req.session ,"its in teh else of change placeOrder as the value andf aajtghhh") 
        res.json({ data });
      });
    }
  });
});
 
router.post('/verifyPayment',isLogin,(req,res)=>{
  console.log(req.body,"it is tthe output in post request of varify Payment")
  userHelper.verifyPayment(req.body).then(async()=>{
    if(req.session.coupon){
      await userHelper.couponUser(req.session.users._id,req.session.coupon);
    }
    console.log(req.body.order,"it is the console of req, body, order")
    userHelper.changeOrderStatus(req.body.order.receipt,req.session.users._id).then(() =>{
      res.json({status:true})
    })
  }).catch(err=>{
    console.log(err,'laskdfjlaskdfjlkakjdflajf')
    res.redirect('/')
  })
})

router.get('/orderSuccess/:id',isLogin,(req,res,next)=>{
  const id = req.params.id;
  let session=req.session
  let loggedIn=req.session.loggedIn
  let users = req.session.users;
  userHelper.getOrder(req.params.id).then((order)=>{
    res.render('user/orderSuccess',{user:true,order,session,users,loggedIn})
  })
  .catch((err) => {
    next(err)
  })
})

router.post("/cancelOrder/:id",isLogin,(req,res,next)=>{
  console.log(req.params.id,"it is to check the req.parms.id in the function cancel order vie axios is working or not lets check how it is going")
  userHelper.cancelOrder(req.params.id).then((data)=>{
    res.json({data})
  }).catch((err)=>{
    next(err)
  })
})

router.get("/allproducts",(req,res)=>{
  adminHelper.getallproducts().then((products)=>{
    adminHelper.getAllCategory().then((category)=>{
      res.render('user/allProducts',{user:true,category,products})
    })
  })
})

router.get("/category/:id",(req,res,next)=>{
  let loggedIn=req.session.loggedIn
  let users = req.session.users;
  let session = req.session;
  adminHelper.getOneCategory(req.params.id).then((product)=>{
    console.log(product,"it is the categorised Product It Is The Categorised Product ppppppprrrrrrrrrrrrrrrrrrrroooooooooooooooodddddddddd")
    res.render('user/category',{user:true,product,loggedIn,users,session})
  }).catch((err)=>{
    next(err)
  })
})

router.get("/invoice/:id",isLogin,(req,res,next)=>{
  let session=req.session;
  userHelper.getOrder(req.params.id).then((order)=>{
    console.log(req.session)
    res.render('user/invoice',{session,order})
  }).catch((err)=>{
    next(err)
  })
})

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
