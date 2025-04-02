
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
        dynamo
    }){
        this.lambda = lambda;
        this.dynamo = dynamo;
    }
    
    streamMappers(tableName, functionName){
        const fnToInvoke = (dynamoData) => {
            this.lambda.invokeFunction(functionName, dynamoData);
        } 
        
        this.dynamo.addReverseStreamInvokation(fnToInvoke, tableName);
    }
}


(async function(){
    const db = new DynamoDB();
    const lambda = new Lambda();
    const stream = new Stream({
        lambda: lambda,
        dynamo: db
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
    lambda.addFunction("myFunction3", fn2);
    stream.streamMappers("users", "myFunction");
    stream.streamMappers("users", "myFunction2");
    stream.streamMappers("users", "myFunction3");
    
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
    

})();