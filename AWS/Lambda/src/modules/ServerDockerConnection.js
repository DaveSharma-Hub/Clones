import fs from 'fs';
import { execute_command } from './utils/commandExecutor.js';
import { v4 as uuid } from 'uuid';
import { convertMemory } from './utils/utils.js';

export class ServerDockerConnection{

    static #createImage(dockerImage){
        const newDockerLayer = `
            FROM node:20
            FROM ${dockerImage}

            WORKDIR /app

            COPY package*.json ./

            RUN npm ci --only=production
            COPY . .

            # Expose the port the app runs on
            EXPOSE 8200

            # Command to run the application
            CMD ["npm", "start"]
        `;
        return newDockerLayer;
    }
    

    static #buildBuildTimeCommand(filepath, tag){
        return `docker build -t ${tag} -f ${filepath}`
    }

    static #buildRuntimeCommand({tag, port, cpu, memory}){
        return `docker run ${port ? `-p ${port}:${port} ` : ''}--memory=${memory} --cpus=${cpu} -d ${tag}`;
    }

    static async #buildImage(image){
        const filepath = './static/Dockerfile';
        const tag = `Lambda${uuid()}`;
        fs.writeFileSync(filepath,image);
        const command = this.#buildBuildTimeCommand(filepath, tag);
        console.log(typeof command);
        // await execute_command(command)
        return {
            filepath,
            tag
        };
    }

    static async #executeDockerImage(dockerImage){
        const image = this.#createImage(dockerImage);
        return await this.#buildImage(image);
    }
    
    static async #executeRuntimeDocker(serverMetaData){
        const {max_cpu, max_memory} = serverMetaData.getSpecifications();
        const port = serverMetaData.getPort();
        const tag = serverMetaData.getTag();

        const command = this.#buildRuntimeCommand({
            tag: tag,
            port: port,
            cpu: max_cpu,
            memory: convertMemory(max_memory)
        });
        await execute_command(command);
    }

    static async executeNewExecution(serverMetaData){
        console.log(serverMetaData.getDockerImage());

        const exec = async () => {
            if(serverMetaData.canExecuteConcurrent()){
                serverMetaData.updateConcurrent();
                // const result = await this.#executeRuntimeDocker(serverMetaData);
                const result = await execute_command('docker run -p 22:22 -d ssh');
                serverMetaData.addDockerInstances(result);
                return true;
            }
            return false;
        }
        if(!serverMetaData.getDockerImage()){
            throw Error("Docker image not set");
        }

        const check = await exec();
        if(!check){
            await serverMetaData.checkRunningDockerInstances();
            await exec();
        }
    }

    static async executeStartup(port, serverMetaData){
        const { tag } = await this.#executeDockerImage(serverMetaData.getDockerImage());
        serverMetaData.setTag(tag);
        serverMetaData.setPort(port);
    }
}