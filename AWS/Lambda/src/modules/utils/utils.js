export const convertMemory = (mem) => {
    if(mem/1000 >= 1){
        return `${Number.parseInt(mem/1000,10)}g`
    }
    return `${mem}m`
}