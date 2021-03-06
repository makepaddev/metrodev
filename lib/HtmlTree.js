/**
 * Tree widget
 * Copyright (C) 2017 Metrological
 */

class HtmlTree extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
        //this.cursorPos = 0
    }

    static pathArrayToString(path){
        var str = ''
        for(var i = 0; i < path.length; i++){
            var seg = path[i].name
            if(str.length && str[str.length - 1] !== '/') str += '/'
            str += seg
        }
        return str
    }

    properties() {
        this.canRename = true;
        this.canFold = true;
        this.cursorPos = 0
        this.data = {
            name:'TestA',
            open:true,
            children:[
                {name:'TestAA'},
                {name:'TestAB'},
                {name:'TestAC', children:[
                    {name:'TestACA'},
                    {name:'TestACB'}
                ]},
                {name:'TestAD'}
            ]
        }
        this.dependencies = {
            TreeContainer:{
                type:'View',
                paddingLeft:'0.15em',
                paddingTop:'0.2em',
                overflow:'auto',
                backgroundColor:'#111'
            },
            Wrap:{
                type:'View',
                float:'none',
                paddingLeft:'0.2em',
                height:undefined,
                width:undefined,
            },
            Selected:{
                type:'Wrap',
                backgroundColor:'gray'
            },
            Focussed:{
                type:'Selected',
                backgroundColor:'#a7a'
            },
            Icon:{
                fontSize:'0.95em',
                cursor:'default',
                width:'1em', 
                color:'#bbb',
                marginTop:'0.1em',
                marginLeft:'0.2em',
                marginRight:'0.2em'
            },
            Text:{
                color:'#ccc',
                overflow:'none',
                cursor:'default',
                display:'inline-block',
                marginTop:'0.2em',
                verticalAlign:'top',
                float:'none',
                fontSize:'0.7em'
            }
        }
        this.annotations = {
        };
    }
    
    onKeyDown(e,n){
        var cursorPos = this.cursorPos
        if(e.key === 'ArrowUp'){
            var node = this.nodes[this.cursorPos-1]
            if(node && node.noSelect) return
            this.cursorPos--
            if(this.cursorPos < 0) this.cursorPos = 0
            this.rebuild()
        }
        else if(e.key === 'ArrowDown'){
            var node = this.nodes[this.cursorPos+1]
            if(node && node.noSelect) return
            this.cursorPos++
            if(this.cursorPos >= this.nodes.length) this.cursorPos = this.nodes.length - 1
            this.rebuild()
        }
        else if(e.key === 'ArrowLeft' && this.canFold){
             var node = this.nodes[this.cursorPos]
            if(!node || !node.folder) return
            node.open = false
            this.rebuild()
        }
        else if(e.key === 'ArrowRight'){
             var node = this.nodes[this.cursorPos]
            if(!node || !node.folder) return
            node.open = true
            this.rebuild()
        }
        else if(e.key === 'Enter'){

        }
        if(cursorPos !== this.cursorPos){
            var node = this.nodes[this.cursorPos]
            var path = []
            this.findPath(this.data, node, path)
            this.onCursorChange(node, path);
        }
            
    }

    getSelection(){
        return this.nodes[this.cursorPos]
    }

    getSelectionPath(){
        var sel = this.getSelection()
        var path = []
        if(!this.findPath(this.data, sel, path)){
            path = [this.data]
        }
        return path
    }

    onKeyUp(e, n){

    }
    
    findPath(data, node, path){
        if(data === node){
            path.unshift(data)
            return true
        }
        var folder = data.folder
        if(folder){
            for(var i = 0; i < folder.length; i++){
                var file = folder[i]
                if(this.findPath(file, node, path)){
                    path.unshift(data)
                    return true
                }
            }
        }
    }

    getNodePos(node){
        var pos = 0
        function scan(data){
            if(data === node) return true
            var folder = data.folder
            if(folder){
                for(var i = 0; i < folder.length; i++){
                    pos++
                    var file = folder[i]
                    if(scan(file))return true
                }
            }
        }
        scan(this.data)
        return pos
    }

    onCursorChange(node, path){

    }

    onMouseDown(e,n){
        if(!this.hasFocus()) this.setFocus()

        if(n.id == undefined) return
        var changed = this.cursorPos !== n.id
        var node = this.nodes[n.id]

        if(node && node.noSelect) return
        this.cursorPos = n.id

        var path = []
        this.findPath(this.data, node, path)

        if(changed) this.onCursorChange(node, path)

        if(node && !node.folder && e.clickCount > 1 && this.onSelect && this.onSelect(node, path)) return this.rebuild()

        if(n.type === 'Text'){
            if(e.clickCount === 1 && this.canRename){
                this.app.delayClick(_=>{
                    // ok so the problem is the n may be gone.
                    // lets find our selection
                    var node = this.view.domNode.children[this.cursorPos];
                    var bgNode = node;
                    var textNode = bgNode.children[0]
                    var textPos = this.app._absPos(textNode)
                    var bgPos = this.app._absPos(bgNode)
                    var w = bgNode.offsetWidth - (textPos[0] - bgPos[0]) - 5
                    var h = bgNode.offsetHeight - (textPos[1] - bgPos[1])
                    console.log(textPos[0], bgPos[1], w, h);
                    var editId = n.id
                    this.app._editText(textPos[0], bgPos[1], w, h, this.nodes[n.id].name, v=>{
                        if(v !== null){
                            this.nodes[editId].name = v
                            this.rebuild()
                        }
                    })
                })
            }
        }
        else{        
           
            if(!node) return
            if(node.folder){
                if(this.canFold){
                    node.open = !node.open
                    changed = true
                }
            }
        }
        if(changed) this.rebuild()
    }

    onFocus(){
        this.rebuild()
    }

    onBlur(){
        this.rebuild()
    }

    buildTree(node, out, nodes, depth){
        var id = out.length
        var sel = id ===  this.cursorPos?this.hasFocus()?'Focussed':'Selected':'Wrap'
      
        nodes.push(node)
        if(node.folder){
            var children = node.folder
            var open = node.open
            out.push(
                {type:sel,id:id,children:[
                    {type:'Icon',id:id,marginLeft:depth+'em', icon:open?'folder-open':'folder'},
                    {type:'Text',id:id,text:node.name}
                ]}
            )
            if(open){
                for(var i = 0; i < children.length ; i++){
                    this.buildTree(children[i], out, nodes, depth + 1)
                }
            }
        }
        else{
            out.push(
                {type:sel,id:id,children:[
                    {type:'Icon',id:id,marginLeft:depth+'em', icon:'file'},
                    {type:'Text',id:id,text:node.name},
                ]}
            )
        }
    }

    build(){
        var out =  []
        this.nodes = []
        this.buildTree(this.data, out, this.nodes, 0)
        return {
            width:this.width,
            height:this.height,
            type:'TreeContainer',
            children:out
         }
    }
}

module.exports = HtmlTree;