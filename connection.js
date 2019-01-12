
//let mysql = require('promise-mysql')
const pool = require('./pool.js');
const errorhandler = require('./errorhandler.js')

module.exports = {
    /** 
     * function to establish a connection to the database
     * @returns connection
    */
    connect : async() => {
        try {
            return await pool.getConnection();
        } catch(err) {
            errorhandler.handle(err);
        }
    },

    /** 
     * function to end a connection to the database
     * @param connection represents which connection to end
     * @returns connection
    */
    end : async(connection) => {
        try {
            await pool.releaseConnection(connection);
        } catch(err) {
            errorhandler.handle(err);
        }
    },

    /** 
     * data access function to retrieve products from the database
     * @param all integer that specifies where to pull products with zero inventory count. 1 = true, 0 = false
     * @param connection connection object for running db query
     * @returns all products in database | all products in database with inventory count >= 1
    */
    retrieveProducts : async(connection, all) => {
        console.log('getting products');
        let productQuery = 'SELECT * FROM products';
        if (!all) {
            productQuery += ' WHERE inventory_count >= 1';
        }

        let results = {}
        try {
            results.data = await connection.query(productQuery);
            results.data = results.data && results.data.length >= 1 ? results.data : null;
            return results;
        } catch(err) {
            results.err = err;
            return results;
        }
    },

    /** 
     * data access function to retrieve a product from the database
     * @param item object containing the id and quantity of the product for purchase
     * @param connection connection object for running db query
     * @returns product | null
    */
    retrieveProduct : async(connection, item) => {
        let productQuery = `SELECT * FROM products WHERE id = ${item.id} AND inventory_count >= ${item.quantity}`
        let result = {};
        try {
            result.data = await connection.query(productQuery);
            result.data = result.data && result.data.length >= 1 ? result.data[0] : null;
            return result;
        } catch(err) {
            result.err = err;
            return result;
        }
    },

    /** 
     * data access function to update the inventory count of all products to be purchased
     * @param cart object containing the products to be purchased
     * @param connection connection object for running db query
     * @returns cart | null
    */
    checkout : async(connection, cart) => {
        let updateProductsQuery = '';
        let result = {};
        for (let product of cart.products) {
            updateProductsQuery += `UPDATE products SET inventory_count = inventory_count - ${product.quantity}, updated_at = NOW() WHERE id = ${product.id};`
        }

        try {
            result.data = await connection.query(updateProductsQuery);
            if(result.data) {
                cart.message = 'Checkout completed successfully!'
                result.data = cart;
            }
            return result;
        } catch(err) {
            result.err = err;
            return result;
        }
    }
}