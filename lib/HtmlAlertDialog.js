/**
 * Copyright (C) 2017 Metrological
 */

class HtmlAlertDialog extends require('./HtmlModalDialog') {

    constructor(parent, props) {
        super(parent, props);
    }

    properties() {
        this.title = 'Rename or move:'
        this.annotations = {
        };
        this.dependencies = {
            Body:{
                type:'Text',
                fontSize:'20px'
            },
            Icon:{
                float:'none',
                icon:'question-circle', 
                color:'#f33',
                marginTop:'50px',
                marginLeft:'90px',
                height:'100px', fontSize:'100px'
            },
            OKButton:{
                text:'Yes'
            },
            CancelButton:{
                text:'No'
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

    buildInside(){
         return {
            type:'View',
            width:'100%',
            height:'100%',
            children:[
                {type:'Body',  text:this.body},
                {type:'Icon'}
            ]
        }
    }
}

module.exports = HtmlAlertDialog