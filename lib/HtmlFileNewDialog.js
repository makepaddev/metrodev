/**
 * Copyright (C) 2017 Metrological
 */

class HtmlFileNewDialog extends require('./HtmlModalDialog') {

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
        return {
            type:'View',
            width:this.width,
            height:this.height,
            children:[
            ]
        }
    }
}

module.exports = HtmlFileNewDialog