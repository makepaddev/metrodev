/**
 * Copyright (C) 2017 Metrological
 */

class SeekWalker extends require('../deps/jsast/jswalk'){

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

class HtmlContextEditor extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.annotations = {
        };
        this.dependencies = {
            ColorPicker:require('./HtmlColorPicker').extend({
                onColorChange(){
                    // lets replace our color with HSL css color
                    this.parentWidget.onColorChange(this.hue, this.sat, this.lgt)
                }
            }),
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
    
    onColorChange(hue, sat, lgt){
        this.node.raw = "'hsl("+parseInt(hue)+","+parseInt(sat*100.)+"%,"+parseInt(lgt*100)+"%)'"
        this.onCodeChange()
    }

    onCodeChange(){

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
        this.mode = undefined
        this.rebuild()
    }

    onLiteral(node, stack){
        // lets see if we can parse a color
        this.mode = 'color'
        this.colorValue = node.value
        this.node = node
        this.rebuild()
        //this.view.domNode.childNodes[0].innerHTML = '<div style="width:100px;height:100px;background-color:'+node.value+'"></div>'
    }

    build(){
        if(this.mode === 'color'){
            return {
                type:'Container',
                width:this.width,
                height:this.height,
                children:[
                    {type:'ColorPicker', width:'100%',height:'100%', color:this.colorValue}
                ]
            }
        }
        else return {
            type:'Container',
            width:this.width,
            height:this.height,
            children:[
                {type:'Text', text:'Application started '+Date()},
            ]
        }
    }
}

module.exports = HtmlContextEditor
