const winston = require('winston');
const { combine, uncolorize, json, timestamp, colorize, printf } = winston.format;

const transports = [];

const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'production') {
    transports.push(new winston.transports.Console({
        format: combine(
            timestamp(),
            uncolorize(),
            json(),
        ),
    }));
}
else if (NODE_ENV === 'development') {
    transports.push(new winston.transports.Console({
        format: combine(
            timestamp(),
            uncolorize(),
            // printf( info => {
            //     console.log(JSON.stringify(info, null, 1));
            // }),
            json(),
        ),
    }));
}

const logger = winston.createLogger({
    level: 'info',
    transports,
    
    exitOnError: false, // decide explicitly to exit or not on error, winston should not handle it

    // uncaught exception and unhandled rejections are handled and logged explicitly,
    // no need to be autometically handled by winston. so turned off here
    handleExceptions: false,
    handleRejections: false,
});

module.exports = { logger };