// Copyright (C) 2017 Metrological
 class MetroDev extends require('../lib/HtmlApp') {   
    
    constructor(domNode) {
        super(domNode);
        // alright lets create a HtmlDock
        // load the project.
        require(['text!/project/project.json'], result=>{
            var layout = JSON.parse(result)
            // rebuild the dock from project
            var dock = this.childWidgetByType('Dock')
            dock.data = layout
            dock.rebuild()
        })
    }

    onOpenEditor(path, template){
        var file = this.FileTree.prototype.Tree.pathArrayToString(path)


        var dock = this.childWidgetByType('Dock')
        // lets see if we already have this uid
        if(dock.hasUid('Edit' + file)){
            // make this thing the active tab somehow.
            return
        }
        dock.addTab(
            "editors",
            {type:'CodeEditor', uid:'Edit'+file, template:template, file:file, title:file.slice(file.lastIndexOf('/')+1)}
        )
        //console.log("OPEN FILE", file)
    }

    onOpenPreview(file){
        var dock = this.childWidgetByType('Dock')
        // lets see if we already have this uid
        if(dock.hasUid('Preview' + file)){
            // make this thing the active tab somehow.
            return
        }
        dock.addTab(
            "previews",
            {type:'Preview', uid:'Preview'+file, file:file, title:file.slice(file.lastIndexOf('/')+1)}
        )

    }

    onFileChange(path, contents){
        //update the require module tree
        require.updateJS(path, contents)

        var dock = this.childWidgetByType('Dock')
        // ok so. what if we want to hotreload all previews
        var previews = dock.findWidgetsByUid(/Preview\/.*/)
        for(var i = 0; i < previews.length; i++){
            previews[i].hotReload(path, contents)
        }
    }

    onAddFile(){
        // ok so how do we do this
        var fileNewDialog = new this.FileNewDialog()
        fileNewDialog.onNewFile = (template, name)=>{
            // current filetree thing
            var fileTree =  this.childWidgetByType('Dock').findWidgetsByUid('filetree')[0]
            var newNode = {
                name:name + template.extension
            }
            if(template.isFolder) newNode.folder = []
            var refNode = fileTree.addUniqueAtSelection(newNode)
            var path = fileTree.findPath(refNode)
            // lets open the file but from template and trigger save
            if(!template.isFolder) this.onOpenEditor(path, refNode == newNode?template.value:undefined)
        }
        this.openModal(fileNewDialog)
    }

    onRenameFile(){
        // ok so how do we do this
        var fileTree =  this.childWidgetByType('Dock').findWidgetsByUid('filetree')[0]
        var pathToRename = fileTree.getSelectionPath()
        if(pathToRename.length == 1) return
        var fileRenameDialog = new this.FileRenameDialog(null, {
            fileData:fileTree.data,
            pathToRename:pathToRename
        })
        fileRenameDialog.onRenameFile = newPath=>{
            console.log("TODO implement on backend")
        }
        this.openModal(fileRenameDialog)
    }

    onDeleteFile(){
        var fileTree =  this.childWidgetByType('Dock').findWidgetsByUid('filetree')[0]
        var pathToDelete = fileTree.getSelectionPath()
        if(pathToDelete.length == 1) return
        var filePathString = this.FileTree.prototype.Tree.pathArrayToString(pathToDelete)
        var alertDialog = new this.AlertDialog(null, {
            body:filePathString,
        })
        alertDialog.onOk = _=>{
            // update filetree, and close any editors with the file.
            console.log("TODO implement on backend")
        }
        this.openModal(alertDialog)
    }

    properties() {
        this.dependencies = {
            'FileNewDialog':require('../lib/HtmlFileNewDialog').extend({
            }),
            'FileRenameDialog':require('../lib/HtmlFileRenameDialog').extend({
            }),
            'AlertDialog':require('../lib/HtmlAlertDialog').extend({
                title:'Do you want to delete',
            }),
            'Dock': require('../lib/HtmlDock').extend({
            }),
            'Preview':require('../lib/HtmlPreview').extend({
                CloseButton:{
                    onClick(){
                        var dock = this.parentWidgetByType('Dock')
                        dock.closeTabByUID(this.parentWidget.uid)
                    }
                }
            }),
            'CodeEditor': require('../lib/HtmlCodeEditor').extend({
                CloseButton:{
                    onClick(){ 
                        var dock = this.parentWidgetByType('Dock')
                        dock.closeTabByUID(this.parentWidget.uid)
                    },
                },
                PlayButton:{
                    onClick(){
                        this.app.onOpenPreview(this.parentWidget.file)
                    }
                },
                onRebuilt(){
                    this.onCleanChange(!this.dirty)
                },
                onFileChange(content){
                    this.app.onFileChange(this.file, content)
                },
                onCleanChange(clean){
                    this.dirty = !clean
                    var tabs = this.parentWidgetByType('Tabs')
                    var tab = tabs.tabByContents(this.parentWidgetByType('CodeEditor'))
                    var text = tab.text
                    if(clean && text.charAt(0) === '*') text = text.slice(1)
                    else if(!clean && text.charAt(0) !== '*') text = '*' + text
                    tab.setText(text)
                    // lets find all running processes with the same name
                },
                onSave(text){
                    var req = new XMLHttpRequest()
                    // compare todo against domains
                    req.addEventListener("error", _=>{
                        // error saving, handle it
                    })
                    //req.responseType = 'text'
                    req.addEventListener("load", _=>{
                        if(req.status !== 200){
                            // error saving
                        }
                        // no error saving
                    })
                    //!TODO add domain checks to url
                    req.open("POST", location.origin+this.file, true)
                    req.send(text)
                }
            }),
            'Log': require('../lib/HtmlLog').extend({
                
            }),
            'FileTree': require('../lib/HtmlFileTree').extend({
                onRenameFile(){
                    this.app.onRenameFile()
                },

                onDeleteFile(){
                    this.app.onDeleteFile()
                },

                onAddFile(){
                    this.app.onAddFile()
                },

                onSelect(node, path){

                    // ok now we have to open a new editor for file str.
                    this.app.onOpenEditor(path)
                    return true
                }
            })
        }
    }

    build(){
        return {
            type:'Dock'
        }
    }
}
module.exports = MetroDev;