const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");


/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  let cart = await Cart.findOne({email:user.email});
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }
  return cart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 * 
 */

//  let cart = await Cart.findOne({ email: user.email });

//  //If the item is not in cart, create new Item
//  if (!cart) {
//    try {
//      cart = await Cart.create({
//        email: user.email,
//        cartItems: [],
//        paymentOption: config.default_payment_option,
//      });
 
//    } catch (error) {
//      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed");
//    }
//  }
//  //Additional check
//  if (cart == null)
//    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed");

//  //If the added Item already exists in the cart
//  //we are using == because the item.product._id is an object whereas productId is a string

//  if (cart.cartItems.some((item) => item.product._id == productId))
//    throw new ApiError(
//      httpStatus.BAD_REQUEST,
//      "Product already in cart. Use the cart sidebar to update or remove product from cart"
//    );

//  const product = await Product.findOne({ _id: productId });
 
//  if (!product)
//    throw new ApiError(
//      httpStatus.BAD_REQUEST,
//      "Product doesn't exist in database"
//    );


//  cart.cartItems.push({ product, quantity });
//  await cart.save(); //save in mongodb

//  return cart;

const addProductToCart = async (user, productId, quantity) => {
    let { email } = user;
    
    const cart = await Cart.findOne({ email: email });
   
    let product = await Product.findById(productId);
      if (!product) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Product doesn't exist in database"
        );
      }
    if(!cart){
       
      let newItem =  new Cart({
        email: user.email,
        cartItems: [
          {
            product: product,
            quantity: quantity,
          },
        ],
      });
      let result = await newItem.save();
      return result;
    }
    
       
    cart.cartItems.forEach(element=>{
      if(element.product._id.toString()==productId){
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Product already in cart. Use the cart sidebar to update or remove product from cart"
        );
      }
    })
      cart.cartItems.push({product:product,quantity:quantity});
      let result=await cart.save();
      return result;
  
  
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const userCart=await Cart.findOne({email:user.email});
  let count=0;
  userCart.cartItems.forEach(element=>{
    if(element.product._id.toString()==productId){
       count++;
    }
  })
  if(count==0){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart");
  }
  const product=await Product.findById(productId);
  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database");
  }
  if(!userCart){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart. Use POST to create cart and add a products");
  } 
  if(userCart){
    userCart.cartItems.forEach(element => {
      if(element.product._id.toString()==productId ){
        element.quantity=quantity;
      }
    });
    const result=await userCart.save();
    return result;
  }
  if (userCart == null){
  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed");
  }
 
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  let userCart=await Cart.findOne({email:user.email});
  let count=0;
  console.log(userCart);
  if(!userCart){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart");
  }
  userCart.cartItems.forEach((element,index)=>{
    if(element.product._id.toString()==productId ){
      userCart.cartItems.splice(index,1);
      count++;
    }
  })
  if(count==0){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart");
  }
  const result=await userCart.save();
  // console.log(result);
  return result;
};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
   let cart=await Cart.findOne({email:user.email});
   if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart");
   }
  
   if(cart.cartItems.length==0){
    throw new ApiError(httpStatus.BAD_REQUEST,"No product in user cart");
   }
   let check=await user.hasSetNonDefaultAddress()
   if(!check){
   throw new ApiError(httpStatus.BAD_REQUEST,"Address not set");
   }

   let totalWalletPrice=0;
   cart.cartItems.forEach(element=>{
    totalWalletPrice+=(element.product.cost*element.quantity);
   });
    
   if(user.walletMoney<totalWalletPrice){
   throw new ApiError(httpStatus.BAD_REQUEST,"wallet balance is insufficient");
   }

   cart.cartItems=[];
   user.walletMoney=user.walletMoney-totalWalletPrice;
  
   await cart.save();
   await user.save();
   return 
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
