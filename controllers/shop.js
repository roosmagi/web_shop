const Product = require('../models/product')
const Cart = require('../models/cart')
const { where } = require('sequelize')
const Order = require('../models/order')
const OrderItems = require('../models/order-items')

class shopController {
    async getallProducts(req, res) {
        const products = await Product.findAll()
        console.log(products)
        res.status(201).json({
            products: products
        })
    } 

    async getCart(req, res) {
        const userCart = await req.user.getCart()
        console.log(userCart)
        const cartProducts = await userCart.getProducts()
        res.status(201).json({
            products: cartProducts
        })
    } 
    async addToCart(req, res) {
        try {
            const { productId, quantity } = req.body;
            
            if (!productId || !quantity) {
                return res.status(400).json({ error: "No ID or quantity provided" });
            }
    
            const userCart = await req.user.getCart();
            const cartProducts = await userCart.getProducts({ where: { id: productId } });
    
            if (cartProducts.length > 0) {
                let existingProduct = cartProducts[0];
                let newQuantity = existingProduct.cartItem.quantity + quantity; 
    
                await existingProduct.cartItem.update({ quantity: newQuantity });
    
                return res.status(200).json({ message: "Cart updated successfully" });
            } else {
                const product = await Product.findByPk(productId);
                if (!product) {
                    return res.status(404).json({ error: "Product not found" });
                }
    
                await userCart.addProduct(product, {
                    through: { quantity: quantity },
                });
    
                return res.status(201).json({ message: "Product added to cart" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    async removeFromCart(req, res) {
        const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
    }

    const userCart = await req.user.getCart();
    const cartProducts = await userCart.getProducts({ where: { id: productId } });

    if (cartProducts.length === 0) {
        return res.status(404).json({ error: "Product not found in cart" });
    }

    await userCart.removeProduct(cartProducts[0]);

    res.status(200).json({ message: "Product removed from cart" });
    }

    async OrderItems(req, res) {
        const userId = req.user.id;
        const userCart = await req.user.getCart();
        const cartItem = await userCart.getProducts({
            attributes: ['id'],
            through: { attributes: ['quantity'] }  
        });

        if (cartItem.length === 0) {
            return res.status(400).json({error: 'Cart is empty!'});
        } 

        const orderItems = cartItem.map((cartItem) => {
            return {
                productId: cartItem.id,
                quantity: cartItem.cartItem ? cartItem.cartItem.quantity : 0
            } 
        });

        const newOrder = await Order.create({ userId });

        for (const item of orderItems) {
            await OrderItems.create({ orderId: newOrder.id, ...item });       
          }

          return res.status(201).json({ message: "Order created!", newOrder });
    } 

    async viewOrderedItems(req, res) {
        const userId = req.user.id;   
        const orderedItems = await Order.findAll({
          where: { userId },
          include: [
            {
              model: OrderItems,
              as: "orderItems",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "title"],       
                },         
              ],       
            },         
          ],   
        });

        res.status(201).json({ orders: orderedItems });
    }
} 

module.exports = new shopController()