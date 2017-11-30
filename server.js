// Copyright (C) 2017 Metrological
// basic development server

var Http = require('http')
var Fs = require('fs')
var Url = require('url')
var Os = require('os')

var server = Http.createServer(handler)

var serverPort = 2002

var externalIps = ''
server.listen(serverPort, '0.0.0.0', err=>{
	var ifaces = Os.networkInterfaces()
	for(var ifaceName in ifaces){
		var iface = ifaces[ifaceName]
		for(var j = 0; j < iface.length; j++){
			var sub = iface[j]
			var addr = sub.address
			if(sub.family !== 'IPv4') continue
			if(addr !== '127.0.0.1'){
				if(externalIps) externalIps += ','
				externalIps += addr+':'+serverPort
			}
		}
	}
	console.log('Iframe worker bound to '+externalIps)
	console.log('Open http://127.0.0.1:'+serverPort+'/ in your browser for metroDev')
	setTimeout(doWatcher, 100)
})

var serverRoot = process.cwd()

var mimeTable = {
	'.js':'application/javascript',
	'.html':'text/html'
}

var filesWatched = []
var fileStats = {}
var watchRequests = []

function doWatcher(){	
	var fileProms = []
	for(var i = 0; i < filesWatched.length; i++){
		var resolve, reject
		var prom = new Promise(function(res, rej){resolve = res, reject = rej})
		prom.resolve = resolve
		prom.reject = reject
		prom.name = filesWatched[i]
		Fs.stat(prom.name, function(prom, err, stat){
			if(err){
				filesWatched.splice(filesWatched.indexOf(prom.name),1)
				prom.resolve()
				return
			}
			prom.stat = stat
			prom.resolve()
		}.bind(null, prom))
		fileProms.push(prom)
	}

	Promise.all(fileProms).then(function(){
		for(var i =0; i < fileProms.length; i++){
			var prom = fileProms[i]
			if(!prom.stat) continue
			prom.stat.atime = prom.stat.atimeMs = undefined
			var now = JSON.stringify(prom.stat)
			var last = fileStats[prom.name]
			if(last === 0) continue
			if(!last) last = fileStats[prom.name] = now
			if(last !== now){
				fileStats[prom.name] = now
				for(var i = 0; i < watchRequests.length; i++){
					watchRequests[i].writeHead(200,{'Content-type':'text/html'})
					watchRequests[i].end("1")
				}
				watchRequests.length = 0
			}
		}
		setTimeout(doWatcher, 100)
	})
}

function handler(req, res){
	var url = Url.parse(req.url)

	var file = url.pathname
	if(file === '/') file = '/index.html'
	if(file === '/reloader'){
		res.on('close', _=>{
			watchRequests.splice(watchRequests.indexOf(res),1)
		})
		watchRequests.push(res)
		setTimeout(_=>{
			res.writeHead(200,{'Content-Type':'text/html'})
			res.end("0")
		}, 30000)
		return
	}
	var ext = file.slice(file.lastIndexOf('.')).toLowerCase()
	var mime = mimeTable[ext] || 'application/octet-stream'
	// just return the file
	var fullPath = serverRoot + file

	if(fullPath.indexOf('..') !== -1) {
		res.writeHead(404)
		res.end()
	}

	if(req.method === 'POST'){

		// write files into project dir only and from localhost only.
		if(req.connection.remoteAddress !== '127.0.0.1' || file.indexOf('/project') !== 0){
			res.writeHead(404)
			res.end()
			return
		}
		var out = Buffer.alloc(parseInt(req.headers['content-length']))
		var j =0
		req.on('data', data=>{
			for(var i = 0; i < data.length; i++){
				out[j++] = data[i]
			}
		})
		req.on('end', _=>{
			fileStats[fullPath] = 0
			Fs.writeFile(fullPath, out, e=>{
				fileStats[fullPath] = undefined
				if(e){
					res.writeHead(500)
					res.end('')
					return
				}
			})
		})
		return
	}

	Fs.stat(fullPath, (err, stat)=>{
		if(err || !stat.isFile()){
			res.writeHead(404)
			res.end()
			return
		}
		var etag = stat.size + stat.mtime.getTime()
		if(req.headers['if-none-match'] === etag){
			res.writeHead(304, {'External-IPS':externalIps})
			res.end()
			return
		}

		if(filesWatched.indexOf(fullPath) === -1){
			filesWatched.push(fullPath)
		}

		res.writeHead(200, {
			'External-IPS':externalIps,
			'Cache-control':'max-age=0',
			'Content-Type':mime,
			'Content-Length':stat.size,
			'etag':etag
		})

		Fs.createReadStream(fullPath).pipe(res)
	})
}