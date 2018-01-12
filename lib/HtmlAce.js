/**
 * ACe wrapper widget 
 * Copyright (C) 2017 Metrological
 */

var ace = require('../deps/ace/lib/ace/ace.js')

// preload these so it doesnt flicker
require('../deps/ace/lib/ace/mode/javascript.js')
require('../deps/ace/lib/ace/theme/twilight.js')
require('text!../deps/ace/lib/ace/theme/twilight.css')

class HtmlAce extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props)
    }

    onBuilt(){
        var editor = this.editor = ace.edit(this.view.domNode)
        editor.setTheme("ace/theme/twilight")
        editor.session.setMode("ace/mode/javascript")
        editor.session.$worker.call("changeOptions", [{asi: true}]) 
        editor.$blockScrolling = Infinity

        var commands = editor.commands;
        commands.addCommand({
            name: "save",
            bindKey: {win: "Ctrl-S", mac: "Command-S"},
            exec: arg => {
                this.onSave(editor.getValue())
                // lets update the undo 
                editor.getSession().getUndoManager().markClean()
                window.localStorage.removeItem(this.file)
                this.clean = true
                this.onCleanChange(this.clean)
            }
        });
        /*
        commands.addCommand({
            name: "load",
            bindKey: {win: "Ctrl-O", mac: "Command-O"},
            exec: function(arg) {
                var session = env.editor.session;
                var name = session.name.match(/[^\/]+$/);
                var value = localStorage.getItem("saved_file:" + name);
                if (typeof value == "string") {
                    session.setValue(value);
                    env.editor.cmdLine.setValue("loaded "+ name);
                } else {
                    env.editor.cmdLine.setValue("no previuos value saved for "+ name);
                }
            }
        });*/
        // i only want the event when you use the mouse
        // or the arrow keys
        var contentChange
        editor.on('changeSelection', e=>{
            if(this.blockEvents) return
            var value = editor.getValue()
            if(contentChange !== value){
                contentChange = value
                return
            }
            var pos = this.editor.selection.getRange().end
            this.onCursorChange(pos.row, pos.column, value)
        })

        editor.on('input', e=>{
            if(this.blockEvents) return
            this.onFileChange(editor.getValue())
            // store it in local storage
            if(editor.getSession().getUndoManager().isClean()){
                window.localStorage.removeItem(this.file)
                if(!this.clean){
                    this.clean = true
                    this.onCleanChange(this.clean)
                }
            }
            else{
                window.localStorage.setItem(this.file, editor.getValue())
                if(this.clean){
                    this.clean = false
                    this.onCleanChange(this.clean)
                }
            }
        });

        if(this.file){
            var value = window.localStorage.getItem(this.file)
            require(['text!'+this.file], result=>{
                this.clean = true
                this.editor.session.setValue(result)
                this.editor.selection.setRange({start:{row:0,col:0},end:{row:0,col:0}})
                //this.editor.getUndoManager().$undoStack.length = 0
                if(typeof value === 'string'){
                    this.editor.setValue(value)
                    this.editor.selection.setRange({start:{row:0,col:0},end:{row:0,col:0}})
                }
            })
        }
    }  

    onResize(){
        this.editor.resize()
    }

    onCleanChange(clean){

    }

    onCursorChange(row, column, data){
        console.log('here')
    }

    onSave(text){

    }

    onTabFocus(){
        this.editor.focus()
    }

    getValue(){
        return this.editor.getValue()
    }

    // swap in a new value
    swapValue(newValue, mergeUndo){

        var oldValue = this.editor.getValue()
        var oldSelect =  this.editor.selection.getRange()

        for(var start = 0; start <oldValue.length; start++){
            if(newValue.charCodeAt(start) != oldValue.charCodeAt(start)){
                break;
            }
        }

        for(var oldEnd = oldValue.length - 1, newEnd = newValue.length - 1; oldEnd > start && newEnd > start; oldEnd--, newEnd--){
            if(newValue.charCodeAt(newEnd) != oldValue.charCodeAt(oldEnd)){
                newEnd++, oldEnd++;
                break;
            }
        }

        var startRange, endRange
        var row = 0, col = 0
        for(var i = 0; i < oldValue.length; i++){
            if(oldValue.charCodeAt(i) == 10) row++, col = -1
            if(i == start) startRange = {row:row,column:col}
            if(i == oldEnd) endRange = {row:row,column:col}
            col++
        }
        if(oldEnd < start) return

        this.blockEvents = true
        this.editor.session.mergeUndoDeltas = mergeUndo
        this.editor.session.replace({start:startRange, end:endRange}, newValue.slice(start, newEnd));
        this.editor.selection.setRange(oldSelect)
        
        this.blockEvents = false
    }

    setValue(value){
        this.editor.setValue(value)
        this.editor.selection.setRange({start:{row:0,col:0},end:{row:0,col:0}})
    }

    properties() {
        var editor = ace.edit(undefined);

        this.annotations = {
        };
        this.dependencies = {
        }
    }

    build(){
        return {
            width:this.width,
            height:this.height,
            type:'View',
        }
    }
}

module.exports = HtmlAce;