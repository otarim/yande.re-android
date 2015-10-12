angular.module('yande.factorys', ['restangular', 'ngCordova'])
	.factory('api', function(Restangular) {
		return {
			list: function(query) {
				var api = Restangular.all('/post.xml')
				return api.get('', query)
			}
		}
	})

.factory('download', function($cordovaToast, $q, $cordovaDevice, $timeout, $cordovaFile) {
	var getFilename = function(url) {
		url = url.split('/').pop().replace(/%20/g, '_')
		return url
	}
	var incrId = 0
		// var existsFile = function(filename) {
		// 	return $cordovaFile.checkFile(root, filename)
		// }
	var tasks = []
	var exists = function(url) {
		return tasks.some(function(task) {
			return task.url === url
		})
	}


	return {
		tasks: tasks,
		addTask: function(url) {
			var deferred = $q.defer()
			var tasks = this.tasks
			document.addEventListener('deviceready', function() {
				if (exists(url)) {
					$cordovaToast.showShortBottom('下载任务已存在')
				} else {
					var id = incrId
					incrId++
					var root = cordova.file[$cordovaDevice.getPlatform() === 'Android' ? 'externalRootDirectory' : 'documentsDirectory']
					var task = {
							name: getFilename(url),
							id: id,
							url: url
						}
						// 选择目录
					task.target = root + '/Pictures/' + task.name
					tasks[id] = task
					$cordovaToast.showShortBottom('下载任务已加入')
						// $cordovaFileTransfer.download(url, task.target, {
						// 	headers: {
						// 		'User-Agent': 'yander.re'
						// 	}
						// }, true).then(function() {
						// 	deferred.resolve(task)
						// }, function(err) {
						// 	tasks.splice(id, 1)
						// 	deferred.reject(task)
						// }, function(progress) {
						// 	$timeout(function() {
						// 		task.progress = (progress.loaded / progress.total) * 100
						// 	})
						// })
					var fileTransfer = new FileTransfer()
					var uri = encodeURI(url)

					fileTransfer.onprogress = function(progressEvent) {
						if (progressEvent.lengthComputable) {
							$timeout(function() {
								task.progress = (progressEvent.loaded / progressEvent.total) * 100
							})
						}
					}

					task.stop = function() {
						fileTransfer.abort()
					}

					fileTransfer.download(
						uri,
						task.target,
						function(entry) {
							deferred.resolve(task)
						},
						function(error) {
							tasks.splice(id, 1)
							if (error.code !== 4) {
								deferred.reject(task)
							}
						},
						true, {
							headers: {
								'User-Agent': 'yander.re'
							}
						}
					)

				}
			}, false)
			return deferred.promise
		}
	}
})

.factory('xmlParser', function() {
	var parse = function(doc) {
		var ret = {}
		if (doc.attributes) {;
			[].forEach.call(doc.attributes, function(node) {
				ret[node.nodeName] = node.value
			})
		}
		if (doc.childNodes.length) {;
			[].forEach.call(doc.childNodes, function(node) {
				if (ret[node.tagName]) {
					ret[node.tagName] = [].concat(ret[node.tagName])
					ret[node.tagName].push(parse(node))
				} else {
					ret[node.tagName] = parse(node)
				}
			})
		}
		return ret
	}
	return function(xmlText) {
		var parser = new DOMParser(),
			xmlDoc = parser.parseFromString(xmlText, 'text/xml')
		return parse(xmlDoc)
	}
})

.config(function(RestangularProvider) {
	RestangularProvider.setBaseUrl('https://yande.re/')
	RestangularProvider.setDefaultHeaders({
		'accept': 'application/xml'
	});
})