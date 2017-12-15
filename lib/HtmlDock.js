/**
 * HTML Dock widget managing the entire docksystem
 * Copyright (C) 2017 Metrological
 */

class HtmlDock extends require('./HtmlWidget') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.dependencies = {
            'DropVis':{
                type:'View',
                backgroundColor:'rgba(128,128,255,0.5)',
                position:'absolute',
                zIndex:500000
            },
            'DockContainer':{
                type:'View'
            },
            'Splitter': require('./HtmlSplitter').extend({
            }),
            'Tabs': require('./HtmlTabs').extend({
                onTabTear(e, n, empty){
                    this.parentWidgetByType('Dock').onTabTear(e, n, empty)
                },
                onTabTearMove(e, n){
                   this.parentWidgetByType('Dock').onTabTearMove(e,n)
                },
                onTabTearDrop(e, n){
                   this.parentWidgetByType('Dock').onTabTearDrop(e,n)
               }
            })
        }
    }

    onTabTear(e, n, empty){
        var dv = this.dropView = new this.DropVis(document.body, {})
        this.dropWidget = n.contentWidget
        this.onTabTearMove(e, n)
        if(empty){
            this.data = this.serialize()
            this.rebuild()
        }
    }

    onTabTearMove(e, n){
        var tabs = []
        this.serialize(tabs)
        function abs(node){
            var x = 0, y = 0
            while(node){
                x += node.offsetLeft
                y += node.offsetTop
                node = node.offsetParent
            }
            return [x,y]
        }
        var style = this.dropView.domNode.style
        var x = e.pageX, y = e.pageY
        for(var i = 0; i < tabs.length; i++){
            var path = tabs[i].path
            var tab = tabs[i].tab
            var node = tab.view.domNode
            var pos = abs(node)
            var vx = pos[0], vy = pos[1], vw = node.offsetWidth, vh = node.offsetHeight
            var headSize = tab.view.domNode.childNodes[0].offsetHeight

            // check if we are outside of the view
            if(x < vx || x > vx + vw || y < vy || y >vy + vh) continue
            
            // compute normalised distance to the edges
            var top = (y - vy) / vh
            var left = (x - vx) / vw
            var bottom = 1 - (y - vy) / vh 
            var right = 1 - (x - vx) / vw 

            // get the smallest distance
            var closest = Math.min(left, right, top, bottom)
            
            this.dropPath = path
            this.dropZone = i
            this.dropPart = -1
            if(closest === left){
                this.dropPart = 1
                style.left = vx+'px'
                style.top = vy+'px'
                style.width = Math.floor(vw*0.5) + 'px'
                style.height = vh + 'px'
            }
            else if(closest === right){
                this.dropPart =2
                style.left = (vx + Math.floor(vw*0.5))+'px'
                style.top = vy+'px'
                style.width = Math.floor(vw*0.5) + 'px'
                style.height = vh + 'px'
            }
            else if(closest === top){
                if(y < vy + headSize){
                    this.dropPart = 0
                    style.left = vx+'px'
                    style.top = vy+'px'
                    style.width = vw + 'px'
                    style.height = headSize + 'px'
                }
                else{
                    this.dropPart = 3
                    style.left = vx+'px'
                    style.top = vy+'px'
                    style.width = vw + 'px'
                    style.height = Math.floor(vh*0.5) + 'px'
                }
            }
            else if(closest === bottom){
                this.dropPart = 4
                style.left = vx+'px'
                style.top = (vy+Math.floor(vh*0.5))+'px'
                style.width = vw + 'px'
                style.height = Math.floor(vh*0.5) + 'px'
            }
            break
        }
    }

    onTabTearDrop(e, n){
        var node =  this.dropView.domNode
        node.parentNode.removeChild(node)
  
        var data = this.serialize()
        var steps = this.dropPath.split('/')
        var node = data
        // walk into it
        for(var i = 0; i < steps.length; i++){
            if(steps[i] === '1'){
                node = node.pane1
            }
            else node = node.pane2
        }
        
        var newTab = {
            type:this.dropWidget.type,
            uid:this.dropWidget.uid,
            title:this.dropWidget.title
        }

        if(node.type === 'Tabs'){
           
            if(this.dropPart == 0){ 
                node.activeTab = node.tabs.push(newTab) - 1
            }
            else if(this.dropPart === 1){ // split left
                node.type = 'Splitter'
                node.vertical = true
                node.pos = 0.5
                node.pane1 = {
                    type:'Tabs',
                    tabs:[newTab]
                }
                node.pane2 = {
                    type:'Tabs',
                    tabs:node.tabs,
                    activeTab:node.activeTab,
                    group:node.group
                }
                node.tabs = undefined
            }
            else if(this.dropPart === 2){ // split right
                node.type = 'Splitter'
                node.vertical = true
                node.pos = 0.5
                node.pane1 = {
                    type:'Tabs',
                    tabs:node.tabs,
                    activeTab:node.activeTab,
                    group:node.group
                }                
                node.pane2 = {
                    type:'Tabs',
                    tabs:[newTab]
                }
                node.tabs = undefined
            }
            else if(this.dropPart === 3){ // split top
                node.type = 'Splitter'
                node.vertical = false
                node.pos = 0.5
                node.pane1 = {
                    type:'Tabs',
                    tabs:[newTab]
                }
                node.pane2 = {
                    type:'Tabs',
                    group:node.group,
                    activeTab:node.activeTab,
                    tabs:node.tabs,
                }
                node.tabs = undefined
            }
            else if(this.dropPart === 4){ // split bottom
                node.type = 'Splitter'
                node.vertical = false
                node.pos = 0.5
                node.pane1 = {
                    type:'Tabs',
                    tabs:node.tabs,
                    activeTab:node.activeTab,
                    group:node.group
                }                
                node.pane2 = {
                    type:'Tabs',
                    tabs:[newTab]
                }
                node.tabs = undefined
            }

        }
        this.data =  data
        this.rebuild()
    }

    onBuilt(){
        this.serialize()
    }

    findWidgetsByUid(uid){
        // find the widget by UID
        var results = []
         function find(node){
            if(!node) return null
            // we only recur on splitters
            if(node.type === 'Splitter'){
                var data = node.getSplitted()
                find(data[0])
                find(data[1]) 
            }
            else if(node.type === 'Tabs'){ // tabs
                var tabs = node.getTabs()
                for(var i = 0; i < tabs.length; i++){
                    var tab = tabs[i]
                    if(uid instanceof RegExp){
                        if(tab.uid.match(uid)) results.push(tab)
                    }  
                    else if(tab.uid === uid) results.push(tab)
                }
            }
        }
        find(this.childWidgets()[0])
        return results
    }

    hasUid(uid){
        var data = this.serialize()
        function walk(node){
            if(node.type === 'Splitter'){
                if(walk(node.pane1))return true
                if(walk(node.pane2)) return true
            }
            else if(node.type === 'Tabs'){
                if(!node.tabs) return false
                for(var i = 0; i < node.tabs.length; i++){
                    if(node.tabs[i].uid === uid) return true
                }
            }
        }
        return walk(data)
    }

    addTab(group, newTemplate){
        var data = this.serialize()
        function walk(node){
            if(node.type === 'Splitter'){
                return walk(node.pane1) || walk(node.pane2)
            }
            else if(node.type === 'Tabs'){
                if(node.group === group){
                    node.activeTab = node.tabs.push(newTemplate) - 1
                    return true
                }
            }
        }
        walk(data)
        this.data = data
        this.rebuild()
    }

    closeTabByUID(uid){
        var data = this.serialize()
        function walk(node){
            if(node.type === 'Splitter'){
                return walk(node.pane1) || walk(node.pane2)
            }
            else if(node.type === 'Tabs'){
                for(var i = 0;i < node.tabs.length; i++){
                    var tab = node.tabs[i]
                    if(tab.uid === uid){
                        node.tabs.splice(i,1)
                        if(node.activeTab === i) node.activeTab = Math.min(node.tabs.length - 1, node.activeTab)
                        return true
                    }
                }
            }
        }
        if(walk(data)){
            this.data = data
            this.rebuild()
        }
    }

    // serialize the state of the entire dock from DOM
    serialize(tabsOut){
        
        function serialize(node, path){
            if(!node) return null
            // we only recur on splitters
            if(node.type === 'Splitter'){
                if(path) path = path+'/'
                
                var data = node.getSplitted()
                var split = {
                    type:'Splitter',
                    pos:node.pos,
                    foldable:node.foldable,
                    folded:node.folded,
                    vertical:node.vertical,
                    pane1:serialize(data[0], path+'1'),
                    pane2:serialize(data[1], path+'2') 
                }
                
                if(split.pane1.type === 'Tabs' && split.pane1.tabs.length === 0){
                    return split.pane2
                }
                else if(split.pane2.type === 'Tabs' && split.pane2.tabs.length === 0){
                    return split.pane1
                }
                return split
            }
            else if(node.type === 'Tabs'){ // tabs
                if(tabsOut) tabsOut.push({tab:node, path:path})
                var tabs = node.getTabs()
                var out = []
                for(var i = 0; i < tabs.length; i++){
                    out.push(serialize(tabs[i]))
                }
                return {
                    type:'Tabs',
                    group:node.group,
                    activeTab:node.activeTab,
                    tabs:out
                }
            }
            else{ // its something else, content usually
                return {
                    type:node.type,
                    uid:node.uid,
                    title:node.title
                }
            }
        }
        return serialize(this.childWidgets()[0], '')
    }

    // build deserializes the serialized form
    build(){
        return {
            width:this.width,
            height:this.height,
            type:'DockContainer',
            children:this.data?[
                this.data
            ]:null
        }
    }
}

module.exports = HtmlDock;