export class React {
    static createElement(type, properties = {}, ...children){
        const recursivelySearchChildren = (children) => {
            return children.map((element) => {
                if(typeof element === 'function'){
                    const Comp = new element();
                    const r = Comp.render();
                    Comp.children = r.children;
                    return {
                        component: Comp,
                        ...r
                    }
                }else if(typeof element === 'object'){
                    if(typeof element.type === 'function'){
                        const Component = element.type;
                        const Comp = new Component(element.properties);
                        const rendered = Comp.render();
                        Comp.children = rendered.children;
                        return {
                            ...element,
                            component: Comp
                        }
                    }
                }
                else if(typeof element ==='string' || typeof element ==='number'){
                    return {
                        type:'div',
                        properties: {},
                        children: [element]
                    }
                }
                return element;
            });
        }
        switch(typeof type){
            case 'function':
                const Comp = new type(properties);
                const rendered = Comp.render();
                Comp.children = rendered.children;
                return {
                    ...rendered,
                    component: Comp
                }
            default:
                return {
                    type,
                    properties,
                    children: recursivelySearchChildren(children.filter((x)=>x!==null || x!==undefined))
                }   
        }
        
    }
}