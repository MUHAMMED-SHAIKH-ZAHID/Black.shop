const adminModel = require("../models/adminModels");
const userModel = require("../models/userModels");
const categoryModel = require("../models/categoryModels");
const subCategoryModel = require("../models/subcategoryModels");
const productModel = require("../models/productModels");
const wishlistModel = require ("../models/wishlistModel")
const couponModel=require('../models/couponModels')
const bannerModel=require('../models/bannerModels')
const orderModel=require("../models/orderModels")
const bcrypt = require("bcrypt");
const user = require("../models/userModels");
const admin = require("../models/adminModels");

const { resolve, reject } = require("promise");
const category = require("../models/categoryModels");
const subCategory = require("../models/subcategoryModels");
const { response } = require("../app");

module.exports = {
  doSignUp: (admindata) => {
    return new Promise(async (resolve, reject) => {
      const { name, email, password } = admindata;
      const hashedpsw = await bcrypt.hash(password, 12);
      admins = new adminModel({
        name,
        email,
        password: hashedpsw,
      });

      admins.save().then((data) => {
        resolve(data);
      });
    });
  },

  doLogin: (admindata) => {
    return new Promise(async (resolve, reject) => {
      const { email, password } = admindata;
      let response = {};
      const admin = await adminModel.findOne({ email });
      if (!admin) {
        response.status = false;
        resolve(response);
      } else {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          response.status = false;
          resolve(response);
        } else {
          response.status = true;
          resolve(response);
        }
      }
    });
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await userModel.find({}).lean();
      resolve(users);
    });
  },

  getOneUser:(id)=>{
    return new Promise((resolve,reject)=>{
      userModel.findById(id).lean().then((userDetails)=>{
        resolve(userDetails)
      })
    })
    .catch((err) => {
      reject(err);
    });
  },

  categoryModel: (categorydata) => {
    return new Promise((resolve, reject) => {
      const { categoryname, CategoryName } = categorydata;
      categorys = new categoryModel({
        categoryname,
        CategoryName,
      });
      categorys.save().then((data) => {
        resolve(data);
      });
    });
  },

  getAllCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await categoryModel.find({}).lean();
      resolve(category);
    });
  },

  deleteCategory: (id) => {
    return new Promise(async(resolve, reject) => {
      let response={}
      let product= await productModel.find({Category:id}).lean()
      console.log(product,"tu ham safar heun phir kya fikar hain")
      if(product!=""){
        console.log("sadanam und mone")
       let response=false
       resolve(response)
      }else{
        console.log("sanam illa")
        categoryModel.findByIdAndDelete(id).then((data) => {
          resolve(data);
        });
      }
    })
    .catch((err) => {
      reject(err);
    });
  },

  AddSubCategory: (subCategoryData) => {
    return new Promise((resolve, reject) => {
      subCategorys = new subCategoryModel({
        subCategoryName: subCategoryData.subCategoryName,
        Category: subCategoryData.Category,
      });
      subCategorys.save().then((data) => {
        resolve(data);
      });
    });
  },

  getAllSubCategory: () => {
    return new Promise(async (resolve, reject) => {
      let subCategory = await subCategoryModel
        .find({})
        .populate("Category")
        .lean();
      resolve(subCategory);
    });
  },

  deleteSubcategory: (id) => {
    return new Promise((resolve, reject) => {
      subCategoryModel.findByIdAndDelete(id).then((data) => {
        resolve(data);
      });
    })
    .catch((err) => {
      reject(err);
    });
  },

  AddProduct: (productData) => {
    return new Promise((resolve, reject) => {
      products = new productModel({
        pro_name: productData.pro_name,
        description: productData.description,
        size: productData.size,
        price: productData.price,
        discount: productData.discount,
        Category: productData.Category,
        SubCategory: productData.SubCategory,
        Stock: productData.Stock,
        myimg: productData.myimg,
        material:productData.material,

      });
      products.save().then((data) => {
        resolve(data);
      });
    })
    .catch((err) => {
      reject(err);
    });
  },

  getallproducts: () => {
    return new Promise((resolve, reject) => {
      productModel
        .find({})
        .populate("Category")
        .populate("SubCategory")
        .lean()
        .then((products) => {
          resolve(products);
        });
    });
  },

  getsingleproduct:(id)=>{
    console.log(id);
   return new Promise(async(resolve,reject)=> {
    try{
      let product= await productModel.findById(id).populate('Category').populate('SubCategory').lean()
        if(product==""){
          console.log("error to be printed")
        }else{
          productModel.findById(id).populate('Category').populate('SubCategory').lean().then((singleproduct)=>{
          resolve(singleproduct)
          })
        }
    }catch(err){
      reject(err)
    }
   })
  },

  updateProduct: (productData,id) => {
    console.log(JSON.stringify(productData));
    console.log(id);
    if(productData.myimg==''){
      console.log("the if of product update is working")
      return new Promise((resolve, reject) => {
        productModel
          .findByIdAndUpdate(id, {
            pro_name: productData.pro_name,
            description: productData.description,
            size: productData.size,
            price: productData.price,
            discount: productData.discount,
            material:productData.material,
            Category: productData.Category,
            SubCategory: productData.SubCategory,
            Stock: productData.Stock,
          })
          .then((response) => {
            resolve(response);
          });
      })
      .catch((err) => {
        reject(err);
      });

    }else{
    return new Promise((resolve, reject) => {
      productModel
        .findByIdAndUpdate(id, {
          pro_name: productData.pro_name,
          description: productData.description,
          size: productData.size,
          price: productData.price,
          discount: productData.discount,
          Category: productData.Category,
          SubCategory: productData.SubCategory,
          Stock: productData.Stock,
          myimg: productData.myimg,
        })
        .then((response) => {
          resolve(response);
        });
    })
    .catch((err) => {
      reject(err);
    });}
  },

deleteProduct:(id)=>{
  return new Promise((resolve,reject)=>{
    productModel.findByIdAndRemove(id).then((response)=>{
      resolve(response)
    })
  })
  .catch((err) => {
    reject(err);
  });
},

  getSubCategory:(category)=>{
    return new Promise((resolve,reject)=>{
        subCategoryModel.find({Category:category}).populate('Category').lean().then((subcategories)=>{
            resolve(subcategories)
        })
    })
  },
 
  addCoupon:(body)=>{
   return new Promise(async(resolve,reject)=>{
    await couponModel.create(body).then((data)=>{
      resolve(data)
    })
   })
  },

  getAllCoupons:()=>{
    return new Promise((resolve,reject)=>{
     couponModel.find({}).lean().then((response)=>{
      resolve(response)
     })
    })
  },

  updateCoupon:(id,body)=>{
   return new Promise ((resolve,reject)=>{
couponModel.findByIdAndUpdate(id,{
    name:body.name,
    code:body.code,
    description:body.description,
    percentage:body.percentage,
    maximum:body.maximum,
   }).then((response)=>{
    resolve(response)
   })
  })
  .catch((err) => {
    reject(err);
  });
},

  deleteCoupon:(id)=>{
    return new Promise((resolve,reject)=>{
      couponModel.findByIdAndRemove(id).then((response)=>{
        resolve(response)
      })
    })
    .catch((err) => {
      reject(err);
    });
  },

  addBanner:(data)=>{
    console.log(data)
   return new Promise(async(resolve,reject)=>{
    await bannerModel.create(data).then((data)=>{
      resolve(data)
    })
   })
   .catch((err) => {
    reject(err);
  });
  },

  getAllBanner:() =>{
   return new Promise((resolve,reject)=>{
    bannerModel.find({}).populate("product").lean().then((banner)=>{
      resolve(banner)
    })
   })
  },

  updateBanner:(data,id)=>{
    if(data.bannerimg==''){
      console.log("update without image is working")
      return new Promise((resolve,reject)=>{
        bannerModel.findByIdAndUpdate(id,{
          title:data.title,
          subTitle:data.subTitle,
          product:data.product,
        }).then((response)=>{
          resolve(response)
        })
      })
      .catch((err) => {
        reject(err);
      });

    }else{
      return new Promise((resolve,reject)=>{
        bannerModel.findByIdAndUpdate(id,{
          title:data.title,
          subTitle:data.subTitle,
          bannerimg:data.bannerimg,
          product:data.product,
        }).then((response)=>{
          resolve(response)
        })
      })
      .catch((err) => {
        reject(err);
      });
    }

  },

  deleteBanner:(id)=>{
    return new Promise((resolve,reject)=>{
      bannerModel.findByIdAndRemove(id).then((data)=>{
        resolve(data)
      })
    })
    .catch((err) => {
      reject(err);
    });
  },


 getAllOrders:()=>{
  return new Promise((resolve,rejecct)=>{
    let orders=orderModel.find({})
    .populate("user")
    .populate('orderItems')
    .populate('orderItems.product')
    .populate('deliveryDetails').lean()
    .sort({cretedAt:-1});
    resolve(orders);
  })
 },

 changeShipingStatus:(id,body)=>{
  console.log(id,body,"mmmmmmmmmmmm main phir bhi thumko chaahoonga mai phir bi tumko chaahoonggaaaaaaaaaaaa")
  return new Promise((resolve,reject)=>{
  orderModel.findOneAndUpdate({_id:id},{deliveryStatus:body.shipping}).then((data)=>{
    resolve(data)
  }).catch((err)=>{
    reject(err)
  })
  })
  .catch((err) => {
    reject(err);
  });
 },

 
 getOneCategory:(id)=>{
  return new Promise(async(resolve,reject)=>{
    let categorys = await productModel.find({Category : id}).populate('Category').lean()
    resolve(categorys)
  })
  .catch((err) => {
    reject(err);
  });
},

getOrderCount: () => {
  return new Promise((resolve, reject) => {
    let response = {};
    orderModel.find({}).then((data) => {
      orderModel.find({ paymentDetails: "razorpay" }).then((data1) => {
        response.razorpay = data1.length;
        response.COD = data.length - data1.length;
        response.all = data.length;
        console.log(response);
        resolve(response);
      });
    });
  });
},



}