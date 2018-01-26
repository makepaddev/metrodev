/**
 * Copyright (C) 2017 Metrological
 */

class HtmlFileRenameDialog extends require('./HtmlModalDialog') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.title = 'Rename or move:'
        this.annotations = {
        };
        this.dependencies = {
            Origin:{
                type:'Text',
                fontSize:'10px',
                marginBottom:'5px',
                float:'none'
            },
            Dest:{
                type:'Origin',
                float:'none'
            },
            Input:require('./HtmlInput').extend({
                height:'20px',
                backgroundColor:'black',
                Bg:{
                    width:'100%'
                },
                onChange(v){
                    this.parentWidget.onChangeInput(v)
                }
            }),
            Tree:require('./HtmlTree').extend({
                height:'145px',
                canFold:false,
                canRename:false,
                onCursorChange(){
                    this.parentWidget.onUpdateView()
                }
            }),
            OKButton:{
                text:'Rename'
            },
            CancelButton:{
                text:'Cancel'
            }            
        }
    }

    // alright lets insert a new file!
    onOk(){
        var view =  this.insideFrame().childViewByType('View')
        var path = view.childWidgetByType('Tree').getSelectionPath()
        path.push(this.fileName)
        this.onRenameFile(path)
    }

    onRenameFile(newPath){

    }

    onChangeInput(v){
        this.fileName = v;
        this.onUpdateView()
    }

    onUpdateView(){
        var view =  this.insideFrame().childViewByType('View')
        var path = view.childWidgetByType('Tree').getSelectionPath()
        var newName = this.Tree.pathArrayToString(path) 
        if(newName[newName.length - 1] !== '/') newName += '/'
        newName += this.fileName
        view.childViewByType('Dest').setText('New name: '+newName)
    }

    buildInside(){
        // make a copy of the data but only copy folders
        var path = this.pathToRename
        var treeCopy = {}
        var treeSel = 0, treePos = 0
        function cpyFolders(inp, out){
            out.name = inp.name
            var folder = inp.folder
            if(inp == path[path.length - 2]) treeSel = treePos;
            out.open = true
            out.folder = []
            for(var i = 0; i < folder.length; i++){
                if(folder[i].folder){
                    if(folder[i] == path[path.length - 1]) continue
                    treePos++
                    var newNode = {}
                    out.folder.push(newNode)
                    cpyFolders(folder[i], newNode)
                }
            }
        }
        cpyFolders(this.fileData, treeCopy)
        var pathString = this.Tree.pathArrayToString(path)
        this.fileName = path[path.length-1].name
        return {
            type:'View',
            width:'100%',
            height:'100%',
            children:[
                {type:'Origin', text:'Old name: '+pathString},
                {type:'Dest', text:'New name: '+pathString},
                {type:'Tree', cursorPos:treeSel, data:treeCopy},
                {type:'Input', text:this.fileName}
            ]
        }
    }
}

module.exports = HtmlFileRenameDialog