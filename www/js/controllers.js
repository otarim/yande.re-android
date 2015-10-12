angular.module('yande.controllers', ['ngCordova', 'angularPagination', 'yande.factorys'])

.controller('DashCtrl', function($scope) {})

.controller('listCtrl', function($scope, api, xmlParser, Pagination, $location, $stateParams, $cordovaDialogs, $cordovaLocalNotification, $cordovaProgress, $timeout, $cordovaToast, $window, download) {
  $scope.width = window.innerWidth * .5 - 11
  $scope.model = {
    keyword: $stateParams.q || ''
  }
  $scope.data = []
  $scope.page = $stateParams.page || 1
  $scope.search = function(reset) {
    document.addEventListener('deviceready', function() {
      $window.plugins.toast.hide() //no hide fn..
    }, false)
    if (reset) {
      $scope.page = 1
    }
    $scope.data = []
      // $cordovaProgress.showSimple(false)
    $scope.loading = true
    $location.search('q', $scope.model.keyword)
    api.list({
      tags: $scope.model.keyword,
      limit: 20,
      page: $scope.page
    }).then(function(res) {
      // $cordovaProgress.hide()
      $scope.loading = false
      try {
        res = xmlParser(res)
        $scope.total = parseInt(res.posts.count, 10)
        if ($scope.total) {
          var pagination = $scope.pagination = Pagination.create({
            itemsPerPage: 20,
            itemsCount: $scope.total
          })
          pagination.setCurrent($scope.page) //触发change操作
          pagination.onChange = function(page) {
            $scope.page = page
            $location.search('page', page)
            $scope.search()
          }
          res.posts.post.forEach(function(item) {
            item.tags = item.tags.split(' ')
          })
          $scope.data = res.posts.post
        } else {
          document.addEventListener('deviceready', function() {
            $cordovaToast.showLongCenter('没找到对应的tag结果集：-）')
          }, false)
        }
      } catch (e) {
        document.addEventListener('deviceready', function() {
          $cordovaToast.showLongCenter('解析数据出错了,重新解析中')
          $scope.search()
        }, false)
      }
    }, function(err) {
      // $cordovaProgress.hide()
      $scope.loading = false
      document.addEventListener('deviceready', function() {
        $cordovaToast.showLongCenter('加载数据出错了,重新连接中')
        $scope.search()
      }, false)
    })
  }
  $scope.searchByTag = function(val) {
    $scope.model.keyword = val
    $scope.search(true)
  }
  $scope.download = function(url) {
    var dl = download.addTask(url)
    dl.then(function(task) {
      $cordovaLocalNotification.schedule({
        id: task.id,
        title: 'yande.re',
        text: '任务' + task.id + '下载完成',
        data: {
          target: task.target
        }
      })
    }, function(task) {
      // 重试
      $cordovaDialogs.confirm('是否重新下载任务' + task.id + '?', '下载失败', ['确定', '取消'])
        .then(function(buttonIndex) {
          var btnIndex = buttonIndex
          if (btnIndex === 1) {
            return $scope.download(url)
          }
        })
    })
  }
  $scope.search()
})

.directive('mdTags', function() {
  // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {
      tags: '=',
      handler: '&'
    }, // {} = isolate, true = child, false/undefined = no change
    // controller: function($scope, $element, $attrs, $transclude) {},
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'EA',
    template: '<div class="md-tags"><span ng-repeat="tag in tags" ng-bind="tag" ng-click="handler({tag:tag})"></span></div>',
    // templateUrl: '',
    replace: true,
    // transclude: true,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, iAttrs, controller) {

    }
  }
})

.controller('viewCtrl', function($scope, $stateParams) {
  $scope.url = encodeURI($stateParams.url)
    // console.log($scope.url)
})


.controller('downloadCtrl', function($scope, $cordovaFileOpener2, $timeout, $cordovaDialogs, download) {
  var mimetype = function(url) {
    var ext = url.split('.').pop()
    return 'image/' + (ext === 'jpg' ? 'jpeg' : ext)
  }
  $scope.tasks = download.tasks
  $scope.openImage = function(task) {
    if (task.progress === 100) {
      document.addEventListener('deviceready', function() {
        $cordovaFileOpener2.open(
          task.target,
          mimetype(task.target)
        )
      }, false)
    }
  }
  $scope.cancelTask = function(task) {
    if (task.progress === 100) return
    document.addEventListener('deviceready', function() {
      $cordovaDialogs.confirm('是否删除下载任务?', '警告', ['确定', '取消'])
        .then(function(buttonIndex) {
          var btnIndex = buttonIndex
          if (btnIndex === 1) {
            return task.stop()
          }
        })
    }, false)
  }
})