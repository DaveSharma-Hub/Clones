import { Server } from "./modules/Server.js";
import express from 'express';
import cors from 'cors';

const PORT = 8100;

const app = express();
app.use(cors());
app.use(express.json());


(async function(){
    const dockerImage = 'docker image';
    const server = new Server({PORT: PORT, app: app, dockerImage});
    await server.start();
})();
