/**
 * Copyright (C) 2017 Metrological
 */

class HtmlSplitter extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.min = 0.1
        this.max = 0.9
        this.pos = 0.5
        this.foldPos = 8
        this.foldable = false
        this.folded = false
        this.split = 3
        this.vertical = true
        this.annotations = {
        };
        this.dependencies = {
            FoldButton:require('./HtmlButton').extend({
                Bg:{
                    position:'absolute',
                    left:'0px',
                    top:'0px',
                    zIndex:10000,
                    backgroundColor:'#333',
                    borderColor:'#333',
                },
                Icon:{
                    color:'#999'
                },
                onClick(){
                    // flip it
                    this.parentWidget.onFold()
                }
            }),
            HorizontalFoldButton:{
                type:'FoldButton',
                Bg:{
                    paddingTop:'2px',
                    paddingRight:'10px',
                    paddingBottom:'2px',
                    paddingLeft:'10px',
                },
                icon:'caret-square-o-down',
            },
            VerticalFoldButton:{
                type:'FoldButton',
                Bg:{
                    paddingTop:'10px',
                    paddingRight:'2px',
                    paddingBottom:'10px',
                    paddingLeft:'2px',
                },
                icon:'caret-square-o-left',
            },
            SplitContainer:{
                type:'View',
                backgroundColor:'#333'
            },
            SplitWrapper:{
                type:'View',
                overflow:'hidden'
            },
            SplitBar:{
                type:'View',
                backgroundColor:'#333',
                borderWidth:'1px'
            }
        }
    }
    
    setFold(folded){
        this.folded = folded;
        this.updatePos();
    }

    onFold(){
        this.folded = !this.folded
        this.updatePos()
    }

    getSplitted(){
        var views = this.view.childViews()
        var out = [
            views[0].childWidgets()[0],
            views[2].childWidgets()[0]
        ]
        // filter out dummy views
        if(out[0] === this) out[0] = undefined
        if(out[1] === this) out[1] = undefined
        return out
    }

    onMouseDown(e,n){
        if(n.id !== 'split') return       
    }
    
    onMouseMove(e, n){
        if(n.id !== 'split') return
        this.folded = false

        var node = this.view.domNode
        var vx = e.pageX - node.offsetLeft 
        var vy = e.pageY - node.offsetTop
        var vw = node.offsetWidth - 1
        var vh = node.offsetHeight
        vx = Math.min(Math.max(vx, this.foldPos), vw-this.foldPos)
        vy = Math.min(Math.max(vy, this.foldPos), vh-this.foldPos)
        if(this.pos<0){
            if(this.vertical){
                this.pos = -(vw-vx)
            }
            else{
                this.pos = -(vh-vy)
            }
        }
        else if(this.pos>1){
            if(this.vertical){
                this.pos = vx
            }
            else{
                this.pos = vy
            }
        }
        else{
            if(this.vertical){
                vx += 0.5*this.split
                this.pos = vx/node.offsetWidth
            }
            else{
                vy += 0.5*this.split
                this.pos = vy/node.offsetHeight
            }
            if(this.pos < this.min) this.pos = this.min
            if(this.pos > this.max) this.pos = this.max
        }
        this.updatePos()
    }
    
    onMouseUp(e, n){
        if(n.id !== 'split') return
    }

    updatePos(){
        var node = this.view.domNode
        var pane1 = node.children[0]
        var split = node.children[1]
        var pane2 = node.children[2]
        var fold = node.children[3]
        if(this.vertical){
            var size = node.offsetWidth - 1
            var a = 'width'
            var b = 'height'
        }
        else{
            var size = node.offsetHeight
            var a = 'height'
            var b = 'width'
        }
        
        var p1, p2, p3
        if(this.folded){
            var start = this.foldPos
            if(this.pos < 0) start = size - this.foldPos
            p1 = (Math.floor(start)- this.split*.5)
            p2 = this.split
            p3 = (Math.floor((size-start) )- this.split*.5)
        }
        else if(this.pos>=1){
            p1 = (Math.floor(this.pos)- this.split*.5)
            p2 = this.split
            p3 = (Math.floor((size-this.pos))- this.split*.5)
        }
        else if(this.pos<0){
            p1 = (Math.floor(size+this.pos)- this.split*.5)
            p2 = this.split
            p3 = (Math.floor((-this.pos))- this.split*.5)
        }
        else {
            p1 = (Math.floor(this.pos * size )- this.split*.5)
            p2 = this.split
            p3 = (Math.floor((1-this.pos) * size )- this.split*.5)
        }

        pane1.style[a] = p1+'px'
        pane1.style[b] = '100%'
        split.style[a] = p2+'px'
        split.style[b] = '100%'
        pane2.style[a] = p3+'px'
        pane2.style[b] = '100%'
        if(this.foldable){
            var button = fold.$vnode.parentWidget
            if(this.vertical){
                if(this.folded){
                    button.setIcon('caret-square-o-right')
                    pane1.style.display = 'none'
                    split.style.marginLeft = (this.foldPos-(this.split>>1))+'px'
                }
                else{
                    button.setIcon('caret-square-o-left')
                    pane1.style.display = 'block'
                    split.style.marginLeft = '0px'
                }
                var pos = this.app._absPos(split)
                fold.style.left = (pos[0]-(fold.offsetWidth>>1)+(this.split>>1))+'px'
                fold.style.top = (pos[1]-(fold.offsetHeight>>1)+(split.offsetHeight>>1))+'px'
            }
            else{
                if(this.folded){
                    button.setIcon('caret-square-o-up')
                    pane2.style.display = 'none'
                }
                else{
                    button.setIcon('caret-square-o-down')
                    pane2.style.display = 'block'
                }
                var pos = this.app._absPos(split)
                fold.style.left = (pos[0]-(fold.offsetWidth>>1)+(split.offsetWidth>>1))+'px'
                fold.style.top = (pos[1]-(fold.offsetHeight>>1)+(this.split>>1))+'px'
            }
        }
    }

    onResize(){
        this.updatePos()
    }

    onBuilt(){
        this.updatePos()
    }

    build(){
        return {
            width:this.width,
            height:this.height,
            type:'SplitContainer',
            children:[
                {type:'SplitWrapper',children:[this.pane1]},
                {type:'SplitBar',id:'split',cursor:this.vertical?'ew-resize':'ns-resize'},
                {type:'SplitWrapper',children:[this.pane2]},
                this.foldable && {
                    type:this.vertical?'VerticalFoldButton':'HorizontalFoldButton'
                }
            ]
        }
    }
}

module.exports = HtmlSplitter;
