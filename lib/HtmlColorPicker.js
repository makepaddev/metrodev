/**
 * Copyright (C) 2017 Metrological
 */
var colorparser = require('../deps/css-color-parser-js/csscolorparser')
function hsvToRGB(h, s, v){
    var hi = parseInt(h/60)
    var f = h/60 - hi
    var p = v*(1-s)
    var q = v*(1-f*s)
    var t = v*(1-(1-f)*s)
    if(hi == 0) return [v,t,p]
    if(hi == 1) return [q,v,p]
    if(hi == 2) return [p,v,t]
    if(hi == 3) return [p,q,v]
    if(hi == 4) return [t,p,v]
    if(hi == 5) return [v,p,q]
    return [0,0,0]
}

class HtmlColorPicker extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props)
        console.log(this.color)
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
            Canvas:require('./HtmlCanvas').extend({
                onDraw(){
                    var c = this.context
                    for(var y = 0, ht = 100; y < ht; y++){
                        for(var x = 0, wt = 100; x < wt; x++){
                            var h = (x/wt)*360
                            var s = 1-(y/ht)
                            var v = 1.
                            var rgb = hsvToRGB(h,s,v)
                            c.fillStyle = 'rgb('+parseInt(rgb[0]*255)+','+parseInt(rgb[1]*255)+','+parseInt(rgb[2]*255)+')'
                            c.fillRect(x,y,1,1)
                        }
                    }
                    var color = colorparser.parseCSSColor(this.parentWidget.color)
                    c.fillStyle = 'rgb('+color[0]+','+color[1]+','+color[2]+')'
                    c.fillRect(100,0,100,100)
                }
            })
        }
    }
    
    build(){
        return {
            type:'Canvas',
            width:this.width,
            height:this.height
        }
    }
}

module.exports = HtmlColorPicker