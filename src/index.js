const { server } = require('./server');
const { sequelize } = require('./models');
const { cacheClient } = require('./services/CacheService');

// connect and start listening

process.on('SIGINT', async () => {
    await cacheClient.quit();
    console.log('redis diconnected');

    await sequelize.close();
    console.log('db disconnected');

    process.exit(1);
});

// connect and start server

new Promise( async (resolve, reject) => {
    try {
        await cacheClient.connect();
        console.log('redis connected successfully');
        
        await sequelize.authenticate();
        console.log('db connected successfully');

        resolve();
    }
    catch(err) {
        reject(err);
    }
})
.then(() => {
    server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => 
        console.log(`server started http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`));
})
.catch(err => {
    console.log('connection error ', err)
})