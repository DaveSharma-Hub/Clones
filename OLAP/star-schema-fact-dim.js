class Table {
    constructor(tab){
        this.data = tab?.data || {};
        this.maxKey = tab?.maxKey || null;
        this.minKey = tab?.minKey || null;
    }
    
    minMaxKeyCheck(key){
        const strKey = JSON.stringify(key);
         if(this.maxKey === null || strKey>this.maxKey){
            this.maxKey = strKey;
        }
        if(this.minKey === null || strKey<this.minKey){
            this.minKey = strKey;
        }
    }
    
    add(key, entityInstance){
        this.data[key] = entityInstance;
        this.minMaxKeyCheck(key);
    }
    get(key, op){
        if(!op || op === 'eq'){
            return this.data[key];
        }
        const entries = Object.entries(this.data);
        const strKey = JSON.stringify(key);
        switch(op){
            case 'gt':
                const values = []
                for(const [k,v] of entries){
                    if(k>strKey){
                        values.push({
                            [k]:v
                        })
                    }
                }
                return values;
            case 'lt':
                const v2 = []
                    for(const [k,v] of entries){
                        if(k<strKey){
                            v2.push({
                                [k]:v
                            })
                        }
                    }
                return v2;
            default:
                return this.data[key];
        }
    }
}

class FactTable{
    constructor(){
        this.table = new Table();
    }
    
    addFacts(keys, dimensionTableReference){
        this.table.add(keys, dimensionTableReference);
    }
    
    get(keys){
        let finalData = {};
        for(const {key, keyValue, op} of keys){
            const entityInstance = this.table.get(key).get(keyValue,op);
            
            let transformedEntityInstance = [];
            if(!Array.isArray(entityInstance)){
                transformedEntityInstance = [Object.entries(entityInstance).reduce((acc, [k,v])=>{
                        acc[`${key}_${k}`] = v;
                        return acc;
                    },{})];
            }else{
                transformedEntityInstance = entityInstance;
            }
            finalData = {
                ...finalData,
                [key]: transformedEntityInstance
            }
        }
        return finalData;
    }
}

class DimensionTable extends Table{
    constructor(tab){
       super(tab);
    }
}

class DataWarehouse {
    constructor(tables){
        this.tables = tables;
    }

    transform(){
        this.factTable = new FactTable();
        for(const {tableName, table} of this.tables){
            const dimensionTable = new DimensionTable(table);
            this.factTable.addFacts(tableName, dimensionTable);
        }
    }
    
    getFactTable(){
        return this.factTable;
    }
}

function convertToFDTable(tables){
    for(const table of tables){
        const fTable = new FactTable();
    }
}

(function(){
    const products = new Table();
    const locations = new Table();
    products.add(1,{
        name:'Coat'
    });
    products.add(2,{
        name:'Jacket'
    });
    products.add(3,{
        name:'Pants'
    });
    locations.add(1,{
        name:'New York'
    });
    locations.add(2,{
        name:'Dubai'
    });
    locations.add(3,{
        name:'London'
    });
    // const factTable = new FactTable();
    // factTable.addFacts('products', products);
    // factTable.addFacts('locations', locations);
    
  
    
    // console.log(locations.get(1,'gt'))
    const dw = new DataWarehouse([
        {
            tableName: 'locations',
            table: locations
        },
        {
            tableName: 'products',
            table: products
        }
    ]);
    
    dw.transform();
    const ft = dw.getFactTable();
      console.log(ft.get([
        {
        key:'products',
        keyValue: 1,
        op: 'eq'
        },
        {
        key:'locations',
        keyValue: 1,
        op:'gt'
        },
    ]))
})();

