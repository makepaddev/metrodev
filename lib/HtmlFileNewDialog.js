/**
 * Copyright (C) 2017 Metrological
 */

class HtmlFileNewDialog extends require('./HtmlModalDialog') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.title = 'File New'
        this.annotations = {
        };
        this.dependencies = {
            Input:require('./HtmlInput').extend({
                height:'20px',
                backgroundColor:'black',
                Bg:{
                    width:'100%'
                }
            }),
            Tree:require('./HtmlTree').extend({
                height:'180px',
                canRename:false,
                cursorPos:1,
                data:{
                    "name":"File Templates",
                    "open":true,
                    "noSelect":true,
                    "folder":[
                        {"name":"Empty Javascript File (.js)"},
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
                {type:'Tree'},
                {type:'Input', text:'NewFile.js'}
            ]
        }
    }
}

module.exports = HtmlFileNewDialog