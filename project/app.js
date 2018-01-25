// Copyright (C) 2017 Metrological
var mod = require('./appmodule')
document.body.innerHTML = ''
var cvs = document.createElement('canvas')
document.body.appendChild(cvs)
var c = cvs.getContext('2d')
var w = c.width = 300
var h = c.height = 300
cvs.style.width = w + 'px'
cvs.style.height = h + 'px'

for(var x = 0; x < w; x++){
	for(var y = 0; y < h; y++){
		var r = x * 1
		var g = y * 1
		var b = Math.abs(x + y)
		c.fillStyle = 'hsla(0,59%,50%,0.69)'
		c.fillRect(x,y,1,1)
	}
}