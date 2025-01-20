export class VirtualDOM {
    previousState = {};
    currentState = {};

    constructor(initialState){
        this.previousState = {};
        this.currentState = initialState;
    }

    compareRoot(newState){
        const difference = findDiff(newState?.root || {}, this.currentState?.root || {});
        this.previousState = this.currentState;
        this.currentState = newState;
        return difference;
    }
    comparePartial(newState, oldState){
        
    }
}