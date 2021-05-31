import http from 'http';
import express, { Application } from 'express';
import helmet from 'helmet';
import config from './config/config';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import router from './routes';
import apiV1Router from './routes/api.v1';

const app: Application = express();
const NAMESPACE = 'Server';

/** logging
 * consider also taking a look at log rotation using https://www.npmjs.com/package/rotating-file-stream
 *
 */
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, '../logs/access.log'),
    { flags: 'a' }
);
const errorLogStream = fs.createWriteStream(
    path.join(__dirname, '../logs/error.log'),
    { flags: 'a' }
);

// log only 4xx and 5xx responses to console
app.use(
    morgan(
        ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :response-time ms - :res[content-length]',
        {
            skip: function (req, res) {
                return res.statusCode < 400;
            }
        }
    )
);
app.use(
    morgan(
        ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :response-time ms - :res[content-length]',
        {
            stream: errorLogStream,
            skip: function (req, res) {
                return res.statusCode < 400;
            }
        }
    )
);

// log everything
app.use(
    morgan(
        ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :response-time ms - :res[content-length]',
        { stream: accessLogStream }
    )
);

app.use(helmet());

/** Parse the incoming request */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/** API Rules  */
app.use(cors());

/** Routes */
app.use(express.static('public'));
app.use(router);
app.use('/api/v1', apiV1Router);
app.get('*', function (req, res) {
    res.status(404).json({ message: 'Not Found' }); // <== YOUR JSON DATA HERE
});

/** Error Handling */

/** Create the server */
const httpServer = http.createServer(app);
httpServer.listen(config.server.port, () => {
    console.log(
        `Server is running on ${config.server.hostname}:${config.server.port}`
    );
});
