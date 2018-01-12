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
                    paddingRight:'4px',
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
                {type:'Tree',data:this.data}
            ]
        }
    }
}

module.exports = HtmlFileTree