// Ionic yande App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'yande' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'yande.services' is found in services.js
// 'yande.controllers' is found in controllers.js
var app = angular.module('yande', ['ionic', 'ngCordova', 'ngMaterial', 'yande.controllers'])

.run(function($ionicPlatform, $rootScope) {
  document.addEventListener('deviceready', function() {
    UserAgent.set('yande.re')
      // cordovaHTTP.setHeader("referer", "https://yande.re/", function() {
      //   alert(1)
      // }, function() {
      //   alert(2)
      // })
    $rootScope.$on('$cordovaLocalNotification:click', function(event, notification, state) {
      // $cordovaFileOpener2.open()
      // Object.keys(notification).forEach(function(k) {
      //     console.log(k)
      //   })
      console.log(notification.data.target)
    })
  }, false)
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

  })
  $ionicPlatform.onHardwareBackButton(function() {
    // $window.history.back()
    // $rootScope.$viewHistory.backView.go()
  })
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.pics', {
      url: '/pics?page?q',
      views: {
        'tab-pics': {
          templateUrl: 'templates/pics.html',
          controller: 'listCtrl'
        }
      }
    })
    .state('tab.pic-view', {
      url: '/pics/view?url',
      views: {
        'tab-pics': {
          templateUrl: 'templates/picView.html',
          controller: 'viewCtrl'
        }
      }
    })

  .state('tab.download', {
    url: '/download',
    views: {
      'tab-download': {
        templateUrl: 'templates/download.html',
        controller: 'downloadCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/pics');

});