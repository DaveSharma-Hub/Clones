import { MetaData } from "./MetaData.js";
import { ServerDockerConnection } from "./ServerDockerConnection.js";
import { Queue } from "./utils/Queue.js";

export class Server{
    constructor({PORT, app, dockerImage}){
        this.metaData = new MetaData({dockerImage});
        this.port = PORT;
        this.serverApplication = app;
        this.queue = new Queue({maxCount:10000});
        return this;
    }
    
    addDockerImage(dockerImage){
        this.metaData.setDockerImage(dockerImage);
    }

    async #checkQueue(){
        if(this.queue.size() > 0) {
            const item = this.queue.dequeue();
            const fn = async() => {
                await item();
                this.#checkQueue();
            }

            await fn();
        }
    }
    
    #attachListener(){
        this.serverApplication.post('/executeLambda', async(req, res)=>{
            try{
                console.log(this.metaData.getDockerImage());

                if(this.metaData.getDockerImage()){
                    this.queue.enqueue(ServerDockerConnection.executeNewExecution(this.metaData));
                    await this.#checkQueue();
                }
                res.sendStatus(200);
            }catch(e){
                console.log(e);
                res.sendStatus(500);
            }
        });

        this.serverApplication.post('/buildLambda', async(req, res)=>{
            try{
                const { dockerImage } = req.body;
                console.log(dockerImage);
                this.addDockerImage(dockerImage);
                res.sendStatus(200);
            }catch(e){
                console.log(e);
                res.sendStatus(500);
            }
        })
    }

    async #startServer(){
        await ServerDockerConnection.executeStartup(null, this.metaData);
        this.#attachListener();
    }
    
    async start(){
        await this.#startServer();
        this.serverApplication.listen(this.port, ()=>{console.log(`Listening on port ${this.port}`)});
        return this;
    }
}