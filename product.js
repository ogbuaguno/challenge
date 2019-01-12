
const connection = require('./connection.js')
let cart = null;

let self = {
    /** 
     * function to retrieve products from the database. this function handles creating and releasing connections
     * @param all integer that specifies where to pull products with zero inventory count. 1 = true, 0 = false
     * @returns all products in database | all products in database with inventory count >= 1
    */
    retrieveProducts : async(all) => {
        console.log('in the retrieve purchase function now')
        try {
            let con = await connection.connect();
            let results = await connection.retrieveProducts(con, all);
            await connection.end(con);

            return self.sendResponse(results, 'No products found');
        } catch(err) {
            return {err};
        }
    },

    /** 
     * function to buy a product and add to cart if the product quantity requested is available
     * @param item object representing the requesting body. contains the id and quantity of the product for purchase
     * @returns cart | null
    */
    purchase : async(item) => {
        try {
            let con = await connection.connect();
            let result = await connection.retrieveProduct(con, item);
            await connection.end(con);

            if (result.data) {
                self.addToCart(result.data, item);
                return self.retrieveCart();
            }

            return self.sendResponse(result, 'Product quantity currently unavailable');
        } catch(err) {
            return {err};
        }
    },

    /** 
     * function to add product to cart. if no product in cart, cart is initialized
     * @param item object representing the requesting body. contains the id and quantity of the product for purchase
     * @param product object representing product retrieved from the database
     * @returns cart
    */
    addToCart : async(product, item) => {
        if (!cart) {
            cart = {
                products : [],
                total : 0
            }
        }

        item.title = product.title;
        cart.products.push(item);
        cart.total += product.price * item.quantity;
        cart.total = parseFloat((cart.total).toFixed(2));
    },

    /**
     * function to retrieve cart with products in it or empty
     * @return cart | null
     */
    retrieveCart : () => {
        let message;
        if (!cart) {
            message = 'No products have been added to your cart';
        }

        return self.sendResponse({data : cart}, message);
    },

    /**
     * function to complete the purchase process. updates inventory of the product less the quantity requested.
     * @returns cart
     */
    checkout : async() => {
        try {
            if (!cart) return self.sendResponse({}, 'Cart is empty');
            let con = await connection.connect();
            let result = await connection.checkout(con, cart);
            await connection.end(con);

            return self.sendResponse(result);
        } catch(err) {
            return {err};
        }
    },

    /**
     * function to abstract sending response to customer
     * @param results represents the object containing result data or error
     * @param message default message to be sent if the result object has no error or data(i.e no data retrieved)
     * @returns object representing status code and response body
     */
    sendResponse : (results, message) => {
        if (!results.err && !results.data) {
            return {status : 404, message : message};
        } else if (results.err) {
            return {status : 500, message : 'Error Occured', data : results.err};
        } else {
            return {status : 200, message : 'Data retrieved successfully', data : results.data};
        }
    }
}

module.exports = self;