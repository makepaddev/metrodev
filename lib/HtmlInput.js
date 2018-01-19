/**
 * Input widget
 * Copyright (C) 2017 Metrological
 */

class HtmlInput extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.dependencies = {
            Bg:{
                cursor:'text',
                type:'View',
                width:undefined,
                height:undefined,
                borderRadius:'1px',
                borderWidth:'1px',
                paddingTop:'5px',
                paddingRight:'5px',
                paddingBottom:'5px',
                paddingLeft:'5px',
                borderColor:'#999',
                borderStyle:'solid',
            },
            Text:{
                fontSize:'10px'
            }
        }
        this.annotations = {
        };
        this.states = {
            default:{
                Bg:{
                    backgroundColor:'#777'
                }
            },
            over:{
                Bg:{
                    borderColor:'#aaa',
                    backgroundColor:'#444'
                }
            }
        }
    }
    
    onKeyDown(e,n){
    }

    onKeyUp(e, n){
    }

    onMouseOver(e, n){
        this.setState('over')
        this.in = true
    }

    onMouseOut(e, n){
        this.setState('')
        this.in = false
    }

    startEdit(){
        // lets go into edit mode
        var textNode = this.view.domNode
        var textPos = this.app._absPos(textNode)
        this.app._editText(textPos[0], textPos[1], textNode.offsetWidth-5, textNode.offsetHeight-5, this.text, v=>{
            // got text?
            if(v !== null){
                this.text = v
                this.childViewByType('Text').setText(v)
            }
        })

    }

    onMouseDown(e,n){
        this.setFocus()
        this.startEdit()
    }
    
    onKeyDown(e){
        e.preventDefault()
        if(e.key == 'Enter') this.startEdit()
    }

    onMouseUp(e,n){
    }

    onResize(){
    }

    onBuilt(){
    }
    
    onClick(){

    }

    build(){
        return {
            type:'Bg',
            children:[{type:'Text', text:this.text}]
         }
    }
}

module.exports = HtmlInput;