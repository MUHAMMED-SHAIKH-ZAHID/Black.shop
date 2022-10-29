var express = require('express');
const { response } = require('../app');
var router = express.Router();
const adminHelper = require("../helpers/adminHelper");
const userHelper = require('../helpers/userHelper');
const couponModel=require('../models/couponModels')
const bannerModel=require('../models/bannerModels')
const multer = require('multer')
//const upload = multer({dest: "public/product-images"});
//const file = require("../models/product")
const categoryModel = require('../models/categoryModels')
const admin = require('../models/adminModels');
const category = require('../models/categoryModels');
const subCategoryModel = require('../models/subcategoryModels');
const productModel= require('../models/productModels');
const { resolve } = require('promise');

// ==========================MULTER==========================//

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `product-images/images-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const upload=multer({storage:multerStorage})

// ================================ISLOGIN NOTLOGIN=====================//

const isLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

const notLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    res.redirect('/admin')
  }
}


/* GET users listing. */
router.get('/',isLogin, function(req, res, next) {
  res.render('admin/admin',{ admin:true ,layout:"adminlayout"})
});

router.get('/login',(req,res)=>{
  res.render('admin/adminlogin',{admin:false,user:false})
})


router.post("/register",(req,res) => {
adminHelper.doSignUp(req.body).then((data)=>{
  res.redirect('/admin')
})
})

router.post('/login',async(req,res)=>{
  adminHelper.doLogin(req.body).then((response)=>{
    console.log(response);
    if(response.status){
      req.session.loggedIn = true
      res.redirect('/admin');
    }else{
      res.redirect('/admin/login')
    }
  })
})

router.get("/update-users/:id",isLogin,(req,res,next) =>{
  userHelper.changeStatus(req.params.id).then((response)=>{
     res.redirect('/admin/userdetails')
  }).catch((err)=>{
    err.admin = true;
    next(err)
  })
})


router.get("/userdetails",isLogin,(req,res)=>{
  console.log(req.session);
  adminHelper.getAllUsers().then((users)=>{
    res.render('admin/userdetails',{admin:true ,layout:"adminlayout",users})
  })
})

router.get("/product-Managment",isLogin,(req,res)=>{
  adminHelper.getallproducts().then((product)=>{
  adminHelper.getAllCategory().then((category)=>{
    adminHelper.getAllSubCategory().then((subCategory)=>{
      res.render('admin/product-Managment',{admin:true,category,subCategory,product,layout:"adminlayout"})
    })
  })
})  
})

router.get("/update-product/:id",isLogin,(async(req,res,next)=>{
  let category = await categoryModel.find({}).lean()
  let subCategory= await subCategoryModel.find({}).lean()
  let product = await productModel.findById(req.params.id).populate('Category').populate('SubCategory').lean()
  res.render("admin/update-product",{product,category,subCategory,admin:true,layout:'adminlayout'})
}))

router.get("/delete-product/:id",isLogin,(async(req,res)=>{
  adminHelper.deleteProduct(req.params.id).then((resolve)=>{
    res.redirect('/admin/product-Managment')
  })
}))

router.post("/update-products/:id",upload.array('myimg',4),(req,res)=>{
  console.log(req.body);
  const images=req.files
  console.log(req.files)
  let array=[]  
  array = images.map((value)=> value.filename)
  console.log(array);
  req.body.myimg=array
  adminHelper.updateProduct(req.body,req.params.id).then((response)=>{
    console.log(response+"req bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
    res.redirect('/admin/product-Managment')
  })
})

router.get("/category",isLogin,(req,res)=>{
  adminHelper.getAllCategory().then((category)=>{
    adminHelper.getAllSubCategory().then((subCategory)=>{
      res.render('admin/category',{admin:true ,layout:"adminlayout" ,category,subCategory})
    })
    
   
  })
  
})

router.get('/getsubcategory/:id',isLogin,(req,res,next)=>{
  adminHelper.getSubCategory(req.params.id).then((subcategories)=>{
    res.json({subcategories})
  }).catch((err)=>{
    err.admin = true;
    next(err)
  })
})

router.get('/add-category',isLogin,(req,res)=>{
  res.render("admin//add-category",{admin:true ,layout:"adminlayout"})
})

router.get("/sub-category",isLogin,(req,res)=>{
  adminHelper.getAllCategory().then((category)=>{
    res.render("admin/add-Subcategory",{admin:true ,layout:"adminlayout",category})
  })
  })

router.post("/categoryregister",(req,res)=>{
 adminHelper.categoryModel(req.body).then((data)=>{
  
  console.log(data);
  res.redirect('/admin/category')
 })
})

router.post("/deleteCategory/:id",isLogin,(req,res,next)=>{
  adminHelper.deleteCategory(req.params.id).then((response)=>{
   res.json({response})
  }).catch((err)=>{
    err.admin = true;
    next(err)
  })
})

router.get("/remove-Subcategory/:id",isLogin,(req,res,next)=>{
  adminHelper.deleteSubcategory(req.params.id).then((response)=>{
    res.redirect('/admin/category')
  }).catch((err)=>{
    err.admin = true;
    next(err)
  })
})



router.post("/subcategoryregister",(req,res)=>{
  adminHelper.AddSubCategory(req.body).then((response)=>{
    res.redirect('/admin/category')
  })
})

router.post('/register-products',upload.array("myimg",4),(req,res)=>{
  const images=req.files
  let array=[]  
  array = images.map((value)=> value.filename)
  console.log(array);
  req.body.myimg=array
  adminHelper.AddProduct(req.body).then((response)=>{
    res.redirect('/admin/product-Managment')
  })
})

router.get('/coupon-Managment',isLogin,(req,res)=>{
  adminHelper.getAllCoupons().then((coupons)=>{
    res.render('admin/coupon-Manager',{admin:true,layout:'adminlayout',coupons})
  })
})


router.post('/register-coupons',isLogin,(req,res)=>{
  console.log(req.body,"its the req body of coupoons")
  adminHelper.addCoupon(req.body).then((response)=>{
    res.redirect('/admin/coupon-Managment')
  })
})

router.get('/update-Coupon/:id',isLogin,(async(req,res,next)=>{
  let coupon = await couponModel.findById(req.params.id).lean();
 res.render('admin/update-Coupon',{admin:true,layout:'adminlayout',coupon})
}))

router.post('/Update-coupons/:id',isLogin,(req,res,next)=>{
  adminHelper.updateCoupon(req.params.id,req.body).then((response)=>{
    res.redirect('/admin/coupon-Managment')
  }).catch((err)=>{
    err.admin = true;
    next(err)
  })
})

router.get('/delete-coupon/:id',isLogin,(req,res,next)=>{
  adminHelper.deleteCoupon(req.params.id).then((response)=>{
    res.redirect('/admin/coupon-Managment')
  })
  .catch((err)=>{
    err.admin = true;
    next(err)
  })
})

router.get('/banner-Manage',isLogin,(req,res)=>{
  adminHelper.getallproducts().then((product)=>{
    adminHelper.getAllBanner().then((banner)=>{
      res.render('admin/banner-Manage',{admin:true,layout:'adminlayout',product,banner})
    })
  })
})

router.post('/register-banner',upload.array('bannerimg',2),isLogin,(req,res)=>{
  const images=req.files
  let array=[]  
  array = images.map((value)=> value.filename)
  console.log(array);
  req.body.bannerimg=array
  adminHelper.addBanner(req.body).then((response)=>{
    res.redirect('/admin/banner-Manage')
  })
})

router.get('/update-banner/:id',isLogin,((req,res,next)=>{
  adminHelper.getallproducts().then(async(product)=>{
    let banner= await bannerModel.findById(req.params.id).lean()
    res.render('admin/update-banner',{admin:true,layout:'adminlayout',banner,product})
  })
  .catch((err)=>{
    err.admin = true;
    next(err);
  })
}))

router.post('/updated-banner/:id',upload.array('bannerimg',1),isLogin,(req,res,next)=>{
  const images=req.files
  let array=[]
  array = images.map((value)=>value.filename)
  req.body.bannerimg=array
  adminHelper.updateBanner(req.body,req.params.id).then((data)=>{
    res.redirect('/admin/banner-Manage')
  })
  .catch((err)=>{
    err.admin = true;
    next(err);
  })
})

router.get('/delete-banner/:id',isLogin,(req,res,next)=>{
  adminHelper.deleteBanner(req.params.id).then((data)=>{
    res.redirect('/admin/banner-Manage')
  })
  .catch((err) => {
    err.admin = true;
    next(err);
  });
})

router.get("/orders",isLogin,(req,res)=>{
  adminHelper.getAllOrders().then((orders)=>{
    res.render('admin/orderManagment',{admin:true,orders,layout:'adminlayout'})
  })
})

router.post("/changeShipping/:id",isLogin,(req,res,next)=>{
  adminHelper.changeShipingStatus(req.params.id,req.body).then((data)=>{
    res.redirect("/admin/orders")
  }).catch((err)=>{
    err.admin = true;
    next(err);
  })
})

router.get('/revenueChart',(req,res)=>{
  adminHelper.getAllOrders().then((orders)=>{
    res.json({ orders });
  })
})

router.get("/getOrderCount", (req, res) => {
  adminHelper.getOrderCount().then((response) => {
    res.json({ response });
  });
})



router.get('/logout',(req,res)=>{
  req.session.destroy()
    res.redirect('/admin/login')
  
})

module.exports = router;
