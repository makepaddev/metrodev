/**
 * HTML Editor wrapping Ace and a button bar
 * Copyright (C) 2017 Metrological
 */

var JSParser = require('../deps/jsast/jsparser')
var JSFormat = require('../deps/jsast/jsformat')

class HtmlFileTree extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);

    }

    properties() {
        this.cursorPos = 0;
        this.annotations = {
        };
        this.dependencies = {
           Tree:require('./HtmlTree').extend({
                onSelect(node, path){
                    this.parentWidget.onSelect(node, path)
                }
            }),
            EditBar:{
                backgroundColor:'#222',
                type:'View',
                paddingTop:'5px',
                paddingLeft:'5px',
                paddingRight:'5px',
                height:'1.9em'
            },
            RenameButton:require('./HtmlButton').extend({
                icon:'i-cursor',
                Bg:{
                    marginLeft:'5px',
                    float:'left'
                },
                onClick(){
                    this.parentWidget.onRenameFile()
                }
            }),
            DeleteButton:require('./HtmlButton').extend({
                icon:'trash',
                Bg:{
                    marginLeft:'5px',
                    float:'left'
                },
                onClick(){
                    this.parentWidget.onDeleteFile()
                }
            }),
            NewButton:require('./HtmlButton').extend({
                icon:'plus-circle',
                onClick(){
                    this.parentWidget.onAddFile()
                },
                Bg:{
                    paddingLeft:'5px',
                    paddingRight:'5px',
                    float:'left'
                }
            }),
        }
    }

    onRenameFile(){

    }

    onDeleteFile(){

    }

    onAddFile(){

    }

    findPath(node){
        var path = []
        var tree = this.childWidgetByType('Tree')
        tree.findPath(tree.data, node, path)
        return path
    }

    addUniqueAtSelection(newNode){
        var tree = this.childWidgetByType('Tree')
        var sel = tree.getSelection()
        var path = []
        if(!tree.findPath(tree.data, sel, path)){
            path = [tree.data]
        }
        for(var i = 0; i < path.length && path[i].folder; i++);
        var parentFolder = path[i-1] || tree.data;
        parentFolder.open = true
        var folder = parentFolder.folder
        for(var i = 0; i < folder.length; i++){
            if(folder[i].name == newNode.name){
                this.cursorPos = tree.getNodePos(folder[i]);
                tree.rebuild()
                return folder[i]
            }
        }
        parentFolder.folder.push(newNode)
        tree.cursorPos = tree.getNodePos(newNode)
        tree.rebuild()
        return newNode
    }

    build(){
        return {
            type:'View',
            width:this.width,
            height:this.height,
            children:[
                {type:'EditBar', children:[
                    {type:'NewButton'},
                    {type:'RenameButton'},
                    {type:'DeleteButton'}
                ]},
                {type:'Tree',cursorPos:this.cursorPos,data:this.data}
            ]
        }
    }
}

module.exports = HtmlFileTree