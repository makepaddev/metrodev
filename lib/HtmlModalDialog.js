/**
 * Copyright (C) 2017 Metrological
 */

class HtmlModalDialog extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.annotations = {
        };
        this.dependencies = {
        }
    }

    buildInside(){
        return []
    }

    build(){
        return {
            type:'View',
            width:this.width,
            height:this.height,
            children:this.buildInside()
        }
    }
}

module.exports = HtmlModalDialog