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
        this.alpha = hsl[3]!==undefined?hsl[3]:1.0
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
            Focus:{
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
                visibility:'hidden',
                width:'15px',
                height:'15px'
            },
            Label:{
                marginLeft:'10px',
                marginRight:'5px',
                type:'Text',
                color:'#777',
                float:'left'
            },
            ColorInput:{
                type:'Text'
            },
            SLFocus:{
                type:'Focus'
            },
            HFocus:{
                type:"Focus",
                width:'25px',
            },
            AFocus:{
                type:"Focus",
                width:'25px',
            },
            ColorSwatch:{
                type:"View",
                borderRadius:'7px',
                height:100,
                width:25,
                marginLeft:'10px'
            },
            SLRect:require('./HtmlCanvas').extend({
                width:100,
                height:100,
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
                width:25,
                borderRadius:'7px',
                height:100,
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
            }),
            ASlider:require('./HtmlCanvas').extend({
                marginLeft:'10px',
                width:25,
                borderRadius:'7px',
                height:100,
                updateSwatch(h){
                    var c = this.context
                    var wt = this.domNode.offsetWidth
                    var ht = this.domNode.offsetHeight
                    c.canvas.width = wt
                    c.canvas.height = ht
                    var size = 4
                    var i =0
                    var rgb = hslToRGB(h,1.0,0.5)
                    for(var y = 0; y < ht; y+=size){
                        for(var x = 0; x < wt; x+=size, i++){
                            c.fillStyle = i&1?'gray':'white'
                            c.fillRect(x,y,size,size)
                        }
                    }
                    for(var y = 0; y < ht; y++){
                        for(var x = 0; x < wt; x++){
                            var pc = 1.-(y/ht)
                            c.fillStyle = 'rgba('+parseInt(rgb[0]*255)+','+parseInt(rgb[1]*255)+','+parseInt(rgb[2]*255)+','+pc+')'
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
        if(n instanceof this.HSlider || n instanceof this.HFocus){
            this.mouseDrag = 'HSlider'
            this.onMouseMove(e,n)
        }
        if(n instanceof this.ASlider || n instanceof this.AFocus){
            this.mouseDrag = 'ASlider'
            this.onMouseMove(e,n)
        }
    }

    onMouseUp(e, n){
        this.mouseDrag = undefined
    }

    onColorChange(){

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
            var changed = this.sat !== sat || this.lgt !== lgt
            this.sat =sat
            this.lgt = lgt
            if(changed) this.onColorChange()
            this.updateColor()
        }
        if(this.mouseDrag === 'HSlider'){
            var hslider = this.childViewByType('HSlider')
            var hsliderNode = hslider.domNode
            var abs = this.app._absPos(hsliderNode)
            var y = e.pageY-abs[1]
            var hue = Math.min(1.,Math.max(0.,y / hsliderNode.offsetHeight)) * 359
            var changed = this.hue !== hue
            this.hue = hue
            if(changed) this.onColorChange()
            this.updateColor()
        }
        if(this.mouseDrag === 'ASlider'){
            var aslider = this.childViewByType('ASlider')
            var asliderNode = aslider.domNode
            var abs = this.app._absPos(asliderNode)
            var y = e.pageY-abs[1]
            var alpha = 1.0 - Math.min(1.,Math.max(0.,y / asliderNode.offsetHeight))
            var changed = this.alpha !== alpha
            this.alpha = alpha
            if(changed) this.onColorChange()
            this.updateColor()
        }
    }

    toCssColor(){
        var first = "("+parseInt(this.hue)+", "+parseInt(this.sat*100.)+"%, "+parseInt(this.lgt*100)+"%"
        if(this.alpha !== 1.0){
            return 'hsla'+first +', '+parseFloat(this.alpha).toFixed(2)+')'
        }
        return 'hsl'+first+")"
    }

    updateColor(){
        // lets fetch HSRect
        var slrect = this.childViewByType('SLRect')
        var hslider = this.childViewByType('HSlider')
        var aslider = this.childViewByType('ASlider')
        var slfocus = this.childViewByType('SLFocus')
        var hfocus = this.childViewByType('HFocus')
        var afocus = this.childViewByType('AFocus')
        var colorswatch = this.childViewByType('ColorSwatch')
        var slrectNode = slrect.domNode
        var hsliderNode = hslider.domNode
        var asliderNode = aslider.domNode
        var slfocusNode = slfocus.domNode
        var hfocusNode = hfocus.domNode
        var afocusNode = afocus.domNode
        
        slrect.updateSwatch(this.hue)
        aslider.updateSwatch(this.hue)

        var slstyle = slfocusNode.style
        var px = parseInt(this.sat * slrectNode.offsetWidth)
        var py = parseInt(this.lgt * slrectNode.offsetHeight)

        slstyle.left = (px+slrectNode.offsetLeft-(slfocusNode.offsetWidth>>1))+'px'        
        slstyle.top = (py+slrectNode.offsetTop-(slfocusNode.offsetHeight>>1))+'px'
        slstyle.visibility = 'visible'
       
        var hstyle = hfocusNode.style
        var hy = parseInt((this.hue/360)*hsliderNode.offsetHeight)
        hstyle.left = (hsliderNode.offsetLeft - (hfocusNode.offsetWidth>>1)+(hsliderNode.offsetWidth>>1))+'px'
        hstyle.top = (hy + hsliderNode.offsetTop - (hfocusNode.offsetHeight>>1))+'px'
        hstyle.visibility = 'visible'

        var astyle = afocusNode.style
        var ay = parseInt((1.-this.alpha)*asliderNode.offsetHeight)
        astyle.left = (asliderNode.offsetLeft - (afocusNode.offsetWidth>>1)+(asliderNode.offsetWidth>>1))+'px'
        astyle.top = (ay + asliderNode.offsetTop - (afocusNode.offsetHeight>>1))+'px'
        astyle.visibility = 'visible'

        colorswatch.domNode.style.backgroundColor = this.toCssColor()

        this.childViewById('HueEdit').domNode.innerHTML = parseInt(this.hue)
        this.childViewById('SatEdit').domNode.innerHTML = parseInt(this.sat*100)+'%'
        this.childViewById('LgtEdit').domNode.innerHTML = parseInt(this.lgt*100)+'%'
        this.childViewById('AlphaEdit').domNode.innerHTML = parseFloat(this.alpha).toFixed(2)
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
            },
            {
                type:'HSlider',
            },
            {
                type:'ASlider',
            },
            {
                type:'ColorSwatch',
            },
            {
                type:'Label',
                text:'Hue:'
            },
            {
                type:'ColorInput',
                text:'...',
                id:'HueEdit',
                float:'none'
            },
            {
                display:'inline-block',
                type:'Label',
                text:'Saturation:'
            },
            {
                type:'ColorInput',
                text:'...',
                id:'SatEdit',
                float:'none'
            },
            {
                display:'inline-block',
                type:'Label',
                text:'Lightness:'
            },
            {
                type:'ColorInput',
                text:'...',
                id:'LgtEdit',
                float:'none'
            },
            {
                display:'inline-block',
                type:'Label',
                text:'Alpha:'
            },
            {
                type:'ColorInput',
                id:'AlphaEdit',
                text:'...'
            },            
            {
                type:'SLFocus'
            },
            {
                type:'HFocus'
            },
            {
                type:'AFocus'
            }]
        }
    }
}

module.exports = HtmlColorPicker