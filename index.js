const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');


app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(express.json());


//Routes

const homeBannerSchema = require('./routes/homeBanner.js');
const categoryRoutes = require('./routes/categories');
const imageUploadRoutes = require('./helper/imageUpload.js');
const productRoutes = require('./routes/products.js');
const productWeightRoutes = require('./routes/productWeight.js');
const productRAMSRoutes = require('./routes/productRams.js');
const productSIZESRoutes = require('./routes/productSize.js');
const productReviews = require('./routes/productReviews.js');
const userRoutes = require('./routes/user.js');

app.use(`/api/homeBanner`, homeBannerSchema);
app.use("/uploads",express.static("uploads"));
app.use(`/api/category`, categoryRoutes);
app.use(`/api/imageUpload`, imageUploadRoutes);
app.use(`/api/products`, productRoutes);
app.use(`/api/productRAMS`, productRAMSRoutes);
app.use(`/api/productWeight`, productWeightRoutes);
app.use(`/api/productSIZE`, productSIZESRoutes);
app.use(`/api/productReviews`, productReviews);
app.use("/api/user",userRoutes);




//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Database Connection is ready...');
        //Server
        app.listen(process.env.PORT, () => {
            console.log(`server is running at http://localhost:${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })
