/**
 * HTML Text view
 * Copyright (C) 2017 Metrological
 */

class HtmlCanvas extends require('./HtmlView') {

    constructor(parent, props) {
        super(parent, props)
        if(!parent) return
        this.context = this.domNode.getContext('2d')
        setTimeout(this.onDraw.bind(this),0)
    }

    onDraw(){
        
    }

    properties() {
        this.elementName = 'canvas'
        this.width = undefined
        this.height = undefined
    }
}

module.exports = HtmlCanvas