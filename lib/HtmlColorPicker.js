/**
 * Copyright (C) 2017 Metrological
 */
var colorparser = require('../deps/css-color-parser-js/csscolorparser')

function hslToRGB(h, s, l){
    var hi = parseInt(h/60)
    var f = ((h/60)-hi)*2.-1
    var span = l>=.5?s*(1-l):s*l
    var p = l+span
    var q = l+f*span
    var t = l-span
    var u = l-f*span
    if(hi == 0) return [p,q,t]
    if(hi == 1) return [u,p,t]
    if(hi == 2) return [t,p,q]
    if(hi == 3) return [t,u,p]
    if(hi == 4) return [q,t,p]
    if(hi == 5) return [p,t,u]
    return [0,0,0]
}

function rgbToHSL(r,g,b){
    var min = Math.min(r,g,b)
    var max = Math.max(r,g,b)
    var h
    if(r == max) h = (0+(g-b)/(max-min))*60
    else if(g == max) h = (2+(b-r)/(max-min))*60
    else h = (4+(r-g)/(max-min))*60
    var l = (max+min)/2
    var s = l<0.5?(max-min)/(max+min):(max-min)/(2-(max+min))
    console.log(h,s,l)
    return [h,s,l]
}

class HtmlColorPicker extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props)
        var color = colorparser.parseCSSColor(this.color)
        var hsl = rgbToHSL(color[0]/255,color[1]/255,color[2]/255)
        this.hue = hsl[0]
        this.sat = hsl[1]
        this.lgt = hsl[2]
    }

    properties() {
        this.annotations = {
        };
        this.dependencies = {
            Container:{
                type:'View',
                position:'relative',
                backgroundColor:'#222',
                paddingLeft:'5px',
                paddingTop:'5px'
            },
            SLFocus:{
                type:"View",
                borderRadius:'7px',
                borderWidth:'2px',
                borderColor:'#999',
                position:'absolute',
                boxShadow:'0 0 0 1px black inset',
                display:'block',
                borderStyle:'solid',
                left:'100px',
                top:'100px',
                width:'15px',
                height:'15px'
            },
            HFocus:{
                type:"View",
                borderRadius:'7px',
                borderWidth:'2px',
                borderColor:'#999',
                position:'absolute',
                boxShadow:'0 0 0 1px black inset',
                display:'block',
                borderStyle:'solid',
                left:'100px',
                top:'100px',
                width:'25px',
                height:'15px'
            },
            SLRect:require('./HtmlCanvas').extend({
                updateSwatch(h){
                    var c = this.context
                    var wt = this.domNode.offsetWidth
                    var ht = this.domNode.offsetHeight
                    c.canvas.width = wt
                    c.canvas.height = ht
                    for(var y = 0; y < ht; y++){
                        for(var x = 0; x < wt; x++){
                            var s = (x/wt)
                            var l = (y/ht)
                            var rgb = hslToRGB(h,s,l)
                            c.fillStyle = 'rgb('+parseInt(rgb[0]*255)+','+parseInt(rgb[1]*255)+','+parseInt(rgb[2]*255)+')'
                            c.fillRect(x,y,1,1)
                        }
                    }
                }
            }),
            HSlider:require('./HtmlCanvas').extend({
                marginLeft:'10px',
                onDraw(){
                    var c = this.context
                    var wt = this.domNode.offsetWidth
                    var ht = this.domNode.offsetHeight
                    c.canvas.width = wt
                    c.canvas.height = ht
                    for(var y = 0; y < ht; y++){
                        for(var x = 0; x < wt; x++){
                            var h = (y / ht)*360
                            var s = 1.0
                            var l = 0.5
                            var rgb = hslToRGB(h,s,l)
                            c.fillStyle = 'rgb('+parseInt(rgb[0]*255)+','+parseInt(rgb[1]*255)+','+parseInt(rgb[2]*255)+')'
                            c.fillRect(x,y,1,1)
                        }
                    }
                }
            })
        }
    }
    
    onMouseDown(e, n){
        if(n instanceof this.SLRect || n instanceof this.SLFocus){
            this.mouseDrag = 'SLRect'
            this.onMouseMove(e,n)
        }
    }

    onMouseUp(e, n){
        this.mouseDrag = undefined
    }

    onMouseMove(e, n){
        if(this.mouseDrag === 'SLRect'){
            var slrect = this.childViewByType('SLRect')
            var slrectNode = slrect.domNode
            var abs = this.app._absPos(slrectNode)
            var x = e.pageX-abs[0]
            var y = e.pageY-abs[1]
            var sat = Math.min(1.,Math.max(0.,x / slrectNode.offsetWidth))
            var lgt =  Math.min(1.,Math.max(0.,y / slrectNode.offsetHeight))
            this.sat =sat
            this.lgt = lgt
            this.updateColor()
        }
    }

    updateColor(){
        // lets fetch HSRect
        var slrect = this.childViewByType('SLRect')
        var slfocus = this.childViewByType('SLFocus')
        var hslider = this.childViewByType('HSlider')
        var hfocus = this.childViewByType('HFocus')
        var slrectNode = slrect.domNode
        var slfocusNode = slfocus.domNode
        var hsliderNode = hslider.domNode
        var hfocusNode = hfocus.domNode
        
        slrect.updateSwatch(this.hue)
        
        var slstyle = slfocusNode.style
        var px = parseInt(this.sat * slrectNode.offsetWidth)
        var py = parseInt(this.lgt * slrectNode.offsetHeight)

        slstyle.left = (px+slrectNode.offsetLeft-(slfocusNode.offsetWidth>>1))+'px'        
        slstyle.top = (py+slrectNode.offsetTop-(slfocusNode.offsetHeight>>1))+'px'

        var hstyle = hfocusNode.style
        var hy = parseInt((this.hue/360)*hsliderNode.offsetHeight)
        hstyle.left = (hsliderNode.offsetLeft - (hfocusNode.offsetWidth>>1)+(hsliderNode.offsetWidth>>1))+'px'
        hstyle.top = (hy + hsliderNode.offsetTop - (hfocusNode.offsetHeight>>1))+'px'
    }

    // lets update/draw all the things
    onBuilt(){
        setTimeout(_=>{
            this.updateColor()           
        })
    }

    build(){
        return {
            type:'Container',
            width:this.width,
            height:this.height,
            children:[{
                type:'SLRect',
                width:100,
                height:100
            },
            {
            type:'HSlider',
                width:25,
                height:100,
            },
            {
                type:'SLFocus'
            },
            {
                type:'HFocus'
            }]
        }
    }
}

module.exports = HtmlColorPicker