import { MetaData } from "./MetaData.js";
import { ServerDockerConnection } from "./ServerDockerConnection.js";

export class Server{
    constructor({PORT, app, dockerImage}){
        this.metaData = new MetaData({dockerImage});
        this.port = PORT;
        this.serverApplication = app;
        return this;
    }
    
    addDockerImage(dockerImage){
        this.metaData.setDockerImage(dockerImage);
    }
    
    #attachListener(){
        this.serverApplication.post('/executeLambda', async(req, res)=>{
            try{
                await ServerDockerConnection.executeNewExecution(this.metaData);
                res.sendStatus(200);
            }catch(e){
                console.log(e);
                res.sendStatus(500);
            }
        });
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