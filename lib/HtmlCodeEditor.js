/**
 * HTML Editor wrapping Ace and a button bar
 * Copyright (C) 2017 Metrological
 */

var JSParser = require('../deps/jsast/jsparser')
var JSFormat = require('../deps/jsast/jsformat')

class HtmlCodeEditor extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        
    }

    properties() {
        this.annotations = {
        };
        this.dependencies = {
            Ace:require('./HtmlAce').extend({
                onCleanChange(clean){
                    this.parentWidget.parentWidget.onCleanChange(clean)
                },
                onFileChange(contents){
                    this.parentWidget.parentWidget.onFileChange(contents)
                },
                onCursorChange(row, col, contents){
                    this.parentWidget.parentWidget.onCursorChange(row, col, contents)
                },
                onSave(text){
                    this.parentWidget.parentWidget.onSave(text)
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
            Splitter:require('./HtmlSplitter').extend({
                vertical:false,
                pos:0.75
            }),
            ContextEditor:require('./HtmlContextEditor').extend({
                onCodeChange(){
                    this.parentWidget.parentWidget.onCodeChange()
                }
            }),
            EditContainer:{
                type:'View',
                height:'calc(100% - 1.9em)',
            },
            FormatButton:require('./HtmlButton').extend({
                icon:'align-left',
                Bg:{
                    marginLeft:'5px',
                    float:'left'
                },
                onClick(){
                    this.parentWidget.onFormatText()
                }
            }),
            CloseButton:require('./HtmlButton').extend({
                icon:'close',
                Bg:{
                    float:'right'
                }
            }),
            PlayButton:require('./HtmlButton').extend({
                icon:'play',
                onClick(){
                    
                },
                Bg:{
                    paddingLeft:'5px',
                    paddingRight:'4px',
                    float:'left'
                }
            })
        }
    }

    onCodeChange(){
        var codeEditor = this.childViewByType('EditContainer').childWidgetByType('Splitter').getSplitted()[0]
        var fmt =  new JSFormat()
        fmt.format(this.ast)
        codeEditor.swapValue(fmt.text)
    }

    // lets always keep a parsed set.
    onFormatText(){
        var codeEditor = this.childViewByType('EditContainer').childWidgetByType('Splitter').getSplitted()[0]

        var contents = codeEditor.getValue()
        var ast = JSParser.parse(contents, {storeComments:[],allowReturnOutsideFunction:true})
        var fmt =  new JSFormat()
        fmt.format(ast)

        codeEditor.setValue(fmt.text)
    }

    onCursorChange(row, col, data){
        if(this.lastData !== data){
            try{
                this.ast = JSParser.parse(data, {storeComments:[],allowReturnOutsideFunction:true})
                this.lastData = data
            }
            catch(e){
                this.ast = undefined
                return
            }
        }

        var data = this.lastData
        var seekRow = 0
        var offset
        for(var i = 0; i < data.length; i++){
            if(data.charCodeAt(i) === 10){
                if(row <= seekRow){
                    offset = col + 1
                    break
                }
                if(++seekRow == row){
                    offset = i + col + 1
                    break
                }
            }
        }
        if(offset === undefined) return
        var contextEditor = this.childViewByType('EditContainer').childWidgetByType('Splitter').getSplitted()[1]
        contextEditor.onCursorChange(offset, this.ast)

    }


    onCleanChange(clean){
    }

    onFileChange(contents){

    }

    onTabFocus(){
        var codeEditor = this.childViewByType('EditContainer').childWidgetByType('Splitter').getSplitted()[0]
        codeEditor.onTabFocus()
    }

    build(){
        return {
            type:'View',
            width:this.width,
            height:this.height,
            children:[
                {type:'EditBar', children:[
                    {type:'CloseButton'},
                    {type:'PlayButton'},
                    {type:'FormatButton'}                    
                ]},
                {type:'EditContainer',children:[{
                    type:'Splitter',
                    foldable:true,
                    pos:-125,
                    pane1:{
                        file:this.file,
                        type:'Ace'
                    },
                    pane2:{
                        type:'ContextEditor',
                        color:'red'
                    }
                }]}
            ]
        }
    }
}

module.exports = HtmlCodeEditor
;