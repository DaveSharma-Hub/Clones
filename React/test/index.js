import { ReactDOM } from "../src/ReactDOM/ReactDOM.js";
import { React } from "../src/React/React.js";
import { Component } from "../src/React/Component.js";

class SecondComponent extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            React.createElement(
                'p',
                null,
                "Hello World"
            )
        )
    }
}
class FirstComponent extends Component{
    constructor(props){
        super(props);
        console.log(props);
    }
    render(){
        return(
            React.createElement(
                'p',
                null,
                this.props.value
            )
        )
    }
}

let onClickFn = null;

class App extends Component{
    constructor(props){
        super(props);
        this.state = {
            count:0
        }
        onClickFn = () => this.setState({count:this.state.count+1});
    }

    render(){
        return (
            React.createElement(
                'div',
                null,
                React.createElement(
                    FirstComponent,
                    {
                        value: this.state.count
                    },
                    null
                ),
                SecondComponent,
                React.createElement(
                    'button',
                    {
                        onClick:onClickFn
                    },
                    "Button"
                )
            )
        )
    }
}


ReactDOM.render(App, "root");
// console.log(JSON.stringify(ReactDOM.virtualDOM));
// onClickFn()
// console.log(JSON.stringify(ReactDOM.virtualDOM));