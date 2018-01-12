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

    onOpenEditor(file){
        var dock = this.childWidgetByType('Dock')
        // lets see if we already have this uid
        if(dock.hasUid('Edit' + file)){
            // make this thing the active tab somehow.
            return
        }
        dock.addTab(
            "editors",
            {type:'CodeEditor', uid:'Edit'+file, file:file, title:file.slice(file.lastIndexOf('/')+1)}
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
        this.openModal({
            type:'FileNewDialog'
        })
    }

    properties() {
        this.dependencies = {
            'FileNewDialog':require('../lib/HtmlFileNewDialog').extend({

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

                },

                onDeleteFile(){

                },

                onAddFile(){
                    this.app.onAddFile()
                },

                onSelect(node, path){
                    var str = ''
                    for(var i = 0; i < path.length; i++){
                        var seg = path[i].name
                        if(str.length && str[str.length - 1] !== '/') str += '/'
                        str += seg
                    }
                    // ok now we have to open a new editor for file str.
                    this.app.onOpenEditor(str)
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