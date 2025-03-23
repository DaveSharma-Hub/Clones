import { Server } from "./modules/Server.js";
import express from 'express';
import cors from 'cors';

const PORT = 8100;

const app = express();
app.use(cors());
app.use(express.json());


(async function(){
    const server = new Server({PORT: PORT, app: app, dockerImage: null});
    await server.start();
})();
