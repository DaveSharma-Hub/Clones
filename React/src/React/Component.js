import { ReactDOM } from "../ReactDOM/ReactDOM.js";

export class Component {
    constructor(props){
        this.props = props;
        this.state = {};
    }   

    setState(state){
        console.log('state',state)
        if(typeof state === 'function'){
            this.state = state(this.state);
        }else if(typeof state === 'object'){
            this.state = state;
        }else{
            throw Error("Invalid state value passed in");
        }
        console.log(this.children);
        this.children?.forEach((child)=>{
            if(child instanceof Component){
                child.render();
                ReactDOM.rerender();
            }
        });
    }

    render(){}
};