const checkByValueAndType = (newV, oldV) => {
    if(typeof newV !== typeof oldV){
        return false;
    }
    if(typeof newV === 'object'){
        return objectHasProperties(newV, oldV);   
    }
    return newV === oldV;
}

const objectHasProperties = (newObj, oldObj) => {
    const entries = Object.entries(oldObj);
    return entries.reduce((acc,[key, oldValue])=>{
        if(key in newObj){
            return acc || checkByValueAndType(newObj[key], oldValue)
        }
    },false);
}


const diffingAlgorithm  = (newStateObj, oldStateObj) => {

}

export const findDiff = (newState, oldState) => {
    return diffingAlgorithm(newState, oldState);
}