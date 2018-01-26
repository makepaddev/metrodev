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
                 onCursorChange(node, path){
                    this.parentWidget.onSelectTemplate(node)
                },
                height:'180px',
                canRename:false,
                cursorPos:3,
                data:{
                    "name":"Templates",
                    "open":true,
                    "noSelect":true,
                    "folder":[
                        {"name":"New Folder", value:'', extension:'', isFolder:true, default:'newFolder'},
                        {"name":"Empty Javascript File (.js)", value:'', extension:'.js', default:'newJavaScript'},
                        {"name":"Copyrighted Javascript File (.js)", value:'/**\n * Copyright (C) 2017 Metrological\n**/\n', extension:'.js', default:'newCopyrighted'}
                    ]
                }
            })
        }
    }
    
    onSelectTemplate(node){
        var view = this.insideFrame().childViewByType('View')
        console.log(node.default)
        view.childWidgetByType('Input').setText(node.default)
    }

    onNewFile(template, name){
    }
    // alright lets insert a new file!
    onOk(){
        var view = this.insideFrame().childViewByType('View')
        var template = view.childWidgetByType('Tree').getSelection()
        var filename = view.childWidgetByType('Input').text
        this.onNewFile(template, filename)
    }

    buildInside(){
        return {
            type:'View',
            width:'100%',
            height:'100%',
            children:[
                {type:'Tree'},
                {type:'Input', text:'NewFile'}
            ]
        }
    }
}

module.exports = HtmlFileNewDialog