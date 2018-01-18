/**
 * Copyright (C) 2017 Metrological
 */

class HtmlFileNewDialog extends require('./HtmlModalDialog') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.title = 'File New'
        this.buttons = ['OK', 'CANCEL']
        this.annotations = {
        };
        this.dependencies = {
           
            Tree:require('./HtmlTree').extend({
                data:{
                    "name":"File types",
                    "open":true,
                    "folder":[
                        {"name":"Javascript File"},
                    ]
                }
            })
        }
    }

    buildInside(){
        return {
            type:'View',
            width:'100%',
            height:'100%',

            children:[
                {type:'Tree', height:'200px'},
                {type:'OKButton'},
                {type:'CancelButton'}
            ]
        }
    }
}

module.exports = HtmlFileNewDialog