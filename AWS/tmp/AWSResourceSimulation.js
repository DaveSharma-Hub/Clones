class Queue {
    constructor(purgeTime){
        this.q = [];
        this.purgeTime = purgeTime;
        this.purge();
    }
    enqueue(item){
        this.q.push({
            addedTime: Date.now(),
            data: item
        });
    }
    dequeue(){
        const item = this.q.shift();
        return item?.data;
    }
    purge(){
        setInterval(()=>{
            const itemsToRemove = []; 
            for(let i=0;i<this.q.length;i++){
                const item = this.q[i];
                if(Date.now() - item.addedTime >= this.purgeTime){
                    itemsToRemove.push(i);
                }
            }
            if(itemsToRemove.length>0){
                this.q = this.q.filter((_,i)=>!itemsToRemove.includes(i));
            }
        },1000);
    }
}
class SQS {

constructor(){
    this.queues = {};
    this.streams = {};
}

addQueue(queueName, {purgeTime}){
    this.queues[queueName] = new Queue(purgeTime || 60000);
    this.streams[queueName] = [];
    
}

addItem(queueName, message) {
    if(queueName in this.queues){
        const fns = this.streams[queueName];
        if(fns.length>0){
            for(const fn of fns){
                fn(message);
            }
        }else{
            this.queues[queueName].enqueue(message);
        }
    }
}

removeItem(queueName){
    if(queueName in this.queues){
        return this.queues[queueName].dequeue();
    }
}

addReverseStreamInvokation(fn, queueName){
    this.streams[queueName].push(fn);
}
}


class DynamoDB {
constructor(){
    this.tables = {};
    this.schemas = {};
    this.streams = {};
}

addReverseStreamInvokation(fnToInvoke, tableName){
    this.streams[tableName].push(fnToInvoke);
}

addTable(tableName, schema) {
    this.tables[tableName] = {};
    this.streams[tableName] = [];
    if(!schema.hashKey){
        throw new Error("Need to provide a hash key");
    }
    this.schemas[tableName] = schema;
}

addItem(tableName, data){
    const schema = this.schemas[tableName];
    const {hashKey: hName, sortKey: sName} = schema;
    const hashKey = data[hName];
    let sortKey = null;
    if(sName){
       sortKey = data[sName];
    }
    
    if(!(tableName in this.tables)){
        throw new Error("Table doesnt exist");
    }
    
    if(sortKey){
        if(hashKey in this.tables[tableName]){
            this.tables[tableName][hashKey][sortKey] = data;
        }else{
            this.tables[tableName][hashKey] = {
               [sortKey]: data
            }
        }
    }else{
         this.tables[tableName][hashKey] = data;
    }
    
    if(tableName in this.streams){
        const fns = this.streams[tableName];
        fns.forEach((fn)=>fn(data));
    }
}

getItem(tableName, {hashKey, sortKey}){
    if(!(tableName in this.tables)){
        throw new Error("Table doesnt exist");
    }
    
    const {sortKey: sKey} = this.schemas[tableName];
    const hasSortKey = Boolean(sKey);
    if(hashKey in this.tables[tableName]){
        if(hasSortKey){
            if(sortKey){
                if(sortKey in this.tables[tableName][hashKey]){
                    return [this.tables[tableName][hashKey][sortKey]];
                }
            }else{
                return Object.values(this.tables[tableName][hashKey]);
                
            }
        }else{
            return [this.tables[tableName][hashKey]];
        }
    }
    
    return [];
}

}

class Lambda {
constructor(){
    this.functions = {};
}

addFunction(name, fn){
    this.functions[name] = fn;
}
async invokeFunction(name, values){
    if(name in this.functions){
        const fn = this.functions[name];
        return fn(values);
    }
}
}

class Stream {
constructor({
    lambda,
    dynamo,
    sqs
}){
    this.lambda = lambda;
    this.dynamo = dynamo;
    this.sqs = sqs;
}

toLambdaStreamMapper(source, target, type){
    const fnToInvoke = (data) => {
        this.lambda.invokeFunction(target, data);
    } 
    let invoker = null
    switch(type){
        case 'DYNAMO':
            invoker = this.dynamo;
            break;
        case 'SQS':
            invoker = this.sqs;
            break;
    }
    if(invoker){
        invoker.addReverseStreamInvokation(fnToInvoke, source);
    }
}
}


(async function(){
const db = new DynamoDB();
const lambda = new Lambda();
const q = new SQS();

const stream = new Stream({
    lambda: lambda,
    dynamo: db,
    sqs: q
});
db.addTable("users", {
    hashKey: "id",
    sortKey: "name",
});
const fn = (d) => {
    console.log(d);
}
const fn2 = (d) => {
    console.log('Second function',d);
}
const fn3 = (d) => {
    console.log('Last function',d);
}
lambda.addFunction("myFunction", fn);
lambda.addFunction("myFunction2", fn2);
lambda.addFunction("myFunction3", fn3);
q.addQueue('myQ', {purgeTime: 1000});
q.addQueue('q2', {purgeTime: 2000});
 
stream.toLambdaStreamMapper("users", "myFunction", "DYNAMO");
stream.toLambdaStreamMapper("users", "myFunction2", "DYNAMO");
stream.toLambdaStreamMapper("users", "myFunction3", "DYNAMO");

stream.toLambdaStreamMapper("myQ", "myFunction3", "SQS");


//// INITIALIZATION DONE

db.addItem("users",{
    id: '1' ,
    name: 'john'
});
db.addItem("users",{
    id: '1' ,
    name: 'bob'
});
db.addItem("users",{
    id: '3' ,
    name: 'kelly'
});

q.addItem('myQ', {
    type:"MY_MESSAGE"
});
q.addItem('q2', {
    type:"m2"
});
})();