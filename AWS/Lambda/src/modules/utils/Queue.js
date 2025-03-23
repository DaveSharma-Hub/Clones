export class Queue {
    constructor({maxCount = 1000}){
        this.array = [];
        this.maxCount = maxCount;
    }

    enqueue(item){
        if(this.array.length < this.maxCount){
            this.array.push(item);
        }
        throw new Error("Max count reached. Try again later");
    }

    dequeue(){
        return this.array.shift();
    }

    size(){
        return this.array.length;
    }
}