
const app = require('express')();
const product = require('./product.js');
const bodyParser = require('body-parser');
const port = 8090

app.use(bodyParser.json());

/**
 * endpoint to retrieve all products
 */
app.get('/products', async(req, res, next) => {
    try {
        let queryParam = req.query.all ? parseInt(req.query.all) : 1;
        let response = await product.retrieveProducts(queryParam);
        res.status(response.status).json({message : response.message, data : response.data});
    } catch(err) {
        return err;
    }
});

/**
 * endpoint to purchase a product
 */
app.post('/products/buy', async(req, res) => {
    try {
        let response = await product.purchase(req.body);
        res.status(response.status).json({message : response.message, data : response.data});
    } catch(err) {
        throw new Error(err);
    }
});

/**
 * endpoint to retrieve the current cart
 */
app.get('/cart', async(req, res) => {
    try{
        let response = await product.retrieveCart();
        res.status(response.status).json({message : response.message, data : response.data});
    } catch(err) {
        throw new Error(err);
    }
});

/**
 * endpoint to checkout the products in the cart
 */
app.put('/cart/checkout', async(req, res) => {
    try{
        let response = await product.checkout();
        res.status(response.status).json({message : response.message, data : response.data});
    } catch(err) {
        throw new Error(err);
    }
});

app.listen(port, () => console.log(`Listening on Port ${port}`));