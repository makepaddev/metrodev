/**
 * Copyright (C) 2017 Metrological
 */

class SeekWalker extends require('../jsast/jswalk'){

    constructor(offset){
        super()
        this.offset = offset
    }

    Literal(node){
        if(node.start <= this.offset && node.end > this.offset){
            this.found = node
            this.foundStack = this.stack.slice(0)
            return true
        }
    }

    Identifier(node){
      
    }
}

class HtmContextEditor extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.annotations = {
        };
        this.dependencies = {
            Container:{
                type:'View',
                backgroundColor:'#222',
                paddingLeft:'5px',
                paddingTop:'5px'
            },
            Text:{
                color:'#777',
                fontSize:'12px'
            }
        }
    }
    
    onCursorChange(offset, ast){
        var walker = new SeekWalker(offset)
        walker.walk(ast)
        var node = walker.found
       
        if(node && node.kind === 'string'){
            this.onLiteral(walker.found, walker.foundStack)
        }
        else this.onNothing()
    }

    onNothing(){
        this.view.domNode.childNodes[0].innerHTML = 'No context'
    }

    onLiteral(node, stack){
        // lets see if we can parse a color

        this.view.domNode.childNodes[0].innerHTML = '<div style="width:100px;height:100px;background-color:'+node.value+'"></div>'
    }

    build(){
        return {
            type:'Container',
            width:this.width,
            height:this.height,
            children:[
                {type:'Text', text:'Application started '+Date()},
            ]
        }
    }
}

module.exports = HtmContextEditor
