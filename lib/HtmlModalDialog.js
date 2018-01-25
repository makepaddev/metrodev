/**
 * Copyright (C) 2017 Metrological
 */

class HtmlModalDialog extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        this.width = 300
        this.height = 300
    }

    properties() {
        this.annotations = {
        };
        this.dependencies = {
             Title:{
                type:'Text',
                fontSize:'20px',
                marginBottom:'5px'
            },
            FullscreenBlocker:{
                type:'View',
                left:'0px',
                top:'0px',
                width:'100%',
                height:'100%',
                backgroundColor:'hsla(0,0%,23%,0.59)',
                position:'absolute',
                zIndex:10000,
            },
            Window:{
                type:'View',
                backgroundColor:'#333',
                borderColor:'#999',
                borderStyle:'solid',
                borderWidth:'1px',
                width:300,
                height:300,
                position:'absolute',
                zIndex:10001,
                paddingTop:'15px',
                paddingLeft:'15px',
                paddingRight:'15px',
                paddingBottom:'15px',
                borderRadius:'15px'
            },
            InsideFrame:{
                type:'View',
                height:'210px'
            },
            Button:require('./HtmlButton').extend({
                Text:{
                    fontSize:'20px'
                }
            }),
            OKButton:{
                type:'Button',
                text:'OK',
                Bg:{
                    float:'right'
                },
                onClick(){
                    this.parentWidget.modalConfirm()
                }
            },
            CancelButton:{
                type:'Button',
                text:'Cancel',
                onClick(){
                    this.parentWidget.modalCancel()
                }
            },
        }
    }

    buildInside(){
        return []
    }

    onMouseDown(e, n){
        if(n.type == 'FullscreenBlocker'){
            this.modalCancel()
        }
    }

    modalCancel(){
        if(!this.onCancel()){
            this.view.domNode.parentNode.removeChild(this.view.domNode);
        }
    }

    modalConfirm(){
        if(!this.onOk()){
            this.view.domNode.parentNode.removeChild(this.view.domNode);
        }
    }

    onCancel(){

    }

    onOk(){

    }

    updatePos(){
        // position the window in the center
        var bg = this.view.domNode
        var window = bg.children[0];
        window.style.left = (bg.offsetWidth - window.offsetWidth>>1)+'px'
        window.style.top = (bg.offsetHeight - window.offsetHeight>>1)+'px'
    }

    onResize(){
        this.updatePos()
    }

    onBuilt(){
        this.updatePos()
    }

    insideFrame(){
        return this.childViewByType('Window').childViewByType('InsideFrame')
    }

    build(){
        return {
            type:'FullscreenBlocker',
            children:[{
                type:'Window',
                children:[{
                    type:'Title', text:this.title},
                    {type:'InsideFrame',children:[this.buildInside()]},
                    {type:'CancelButton'},
                    {type:'OKButton'}
                ]
            }]
        }
    }
}

module.exports = HtmlModalDialog