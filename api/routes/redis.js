var express = require('express');
var router = express.Router();
const Redis = require('redis');

const REDIS_EXPIRATION = 15;

const redisClient = Redis.createClient({
    url: 'redis://cache:6379',
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect(); // connect to the redis client

router.get('/', async function async(req, res, next) {
    const photos = await redisClient.get('photos'); // attempt to fetch data from redis cache
    if (photos) {
        console.log('[++++] Cache hit');
        res.send(JSON.parse(photos)); // return cached data
    } else {
        console.log('[++++] Cache miss');
        const response = await fetch('https://jsonplaceholder.typicode.com/photos');
        const data = await response.json();
        await redisClient.setEx('photos', REDIS_EXPIRATION, JSON.stringify(data)); // write fetched data to cache
        res.send(data); // return fetched data
    }
});

module.exports = router;
