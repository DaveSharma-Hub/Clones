export class MetaData{
    constructor({
        dockerImage,
        max_concurrent = 2, 
        max_cpu = 1, 
        max_memory = 1000 // as MB 
    }){
        this.data = {
            dockerImage: dockerImage,
            max_concurrent:max_concurrent,
            current_concurrent:0,
            max_cpu: max_cpu,
            max_memory: max_memory
        }
        this.dockerIds = [];
    }
    
    canExecuteConcurrent(){
        return this.data.current_concurrent + 1 <= this.data.max_concurrent;
    }
    
    updateConcurrent(){
        this.data.current_concurrent++;
    }
    
    getSpecifications(){
        return {
            max_cpu: this.data.max_cpu,
            max_memory: this.data.max_memory
        }
    }
    
    getDockerImage(){
        return this.data.dockerImage;
    }

    getPort(){
        return this.data.port;
    }

    getTag(){
        return this.data.tag;
    }
    
    setDockerImage(dockerImage){
        this.data.dockerImage = dockerImage;
    }

    setTag(tag){
        this.data.tag = tag
    }

    setPort(port){
        this.data.port = port;
    }

    addDockerInstances(dockerId){
        this.dockerIds.push(dockerId);
    }

    checkRunningDockerInstances(){
        const removedIds = [];
        if(this.data.current_concurrent === this.data.max_concurrent){
            this.dockerIds = this.dockerIds.filter((id)=>!removedIds.includes(id));
            this.data.current_concurrent = this.data.current_concurrent - removedIds.length;
        }
    }
}
