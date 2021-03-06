/**
 * HTML Text view
 * Copyright (C) 2017 Metrological
 */

class HtmlText extends require('./HtmlView') {

    constructor(parent, props, noText) {
        super(parent, props)
        if(!parent) return
        if(!noText) this.setText(props.text !== undefined?props.text:this.text)
    }

    setText(text){
        this.domNode.innerHTML = text
    }

    properties() {
        this.css = {
            color: 'white',
            fontFamily: 'Helvetica',
            fontSize: '8px',
            fontStyle: 'normal',
            fontWeight: 'normal'
        }
        this.width = undefined
        this.height = undefined
    }
}

module.exports = HtmlText;