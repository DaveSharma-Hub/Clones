import { Component } from "../React/Component.js";
import { VirtualDOM } from "../VirtualDOM/VirtualDOM.js";

export class ReactDOM {
    virtualDOM = null;

    static hydrateDOM(rootId){
        const createDOMElement = (parent, {type, properties, children}) => {
            console.log(type, properties, children)
            if(typeof type === 'function'){
                return;
            }
            const newEl = document.createElement(type);
            if(['div','p'].includes(type) && properties?.value){
                newEl.innerHTML = properties.value
            }else if(type === 'button' && properties.onClick){
                newEl.onclick = properties.onClick;
            }
            
            if(children?.length>0){
                children.forEach(child => {
                    if(typeof child === 'string' || typeof child === 'number'){
                        const childEl = document.createElement('div');
                        if(type === 'button'){
                            newEl.textContent = child;
                        }else{
                            childEl.innerHTML = child;
                        }
                        newEl.appendChild(childEl);
                    }else {
                        createDOMElement(newEl, child);
                    }
                });
            }

            parent.appendChild(newEl);
        }

        const initialParent = document.getElementById(rootId);
        const root = this.virtualDOM.currentState.root;
        createDOMElement(initialParent, root);
    }


    static render(el, rootId){
        const Comp = new el();
        if(Comp instanceof(Component)){
            const root = Comp.render();
            const vDOM = {
                root: {
                    ...root,
                    component: Comp
                }
            };
            this.virtualDOM = new VirtualDOM(vDOM);
        }else{
            throw Error("Initial class needs to be a Component type");
        }
        this.hydrateDOM(rootId);
    }

    static rerender(){

    }
}