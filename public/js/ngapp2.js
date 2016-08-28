'use strict';
  /* global angular */
      var ngapp2 = angular.module('ngapp2', ["ngRoute"]);
      
      ngapp2.controller('main',['$scope','$window','$http', '$route', function($scope, $window, $http, $route){
        
        $scope.errmsg=null;
        $scope.user=$window.userid;
        $scope.mytrades=[];
        $scope.trades=[];
       
         $http.get('/api/alltrades').success(function(data){
                 for(var i=0; i<data.length; i++){
                     $scope.trades.push(data[i]);
                     console.log($scope.trades[i].fromUser + " " + $scope.user);
                     if(data[i].fromUser==$scope.user){
                         $scope.mytrades.push(data[i]);
                     }
                 }
         });
      
         $scope.delTrade=function(from,to,book){
              var bookurl =  book.substring(book.indexOf('O'));
              for(var i=0; i< $scope.mytrades.length; i++){
                  var trade= $scope.mytrades[i];
                  if(trade.book==book && trade.fromUser==from && trade.toUser==to){
                       $scope.mytrades.splice(i,1);
                  }
              }
               $http.delete('/api/trades/' + from + '/' + to + '/' + bookurl, null);
                $window.location.reload();
         }
         
        
        $scope.trade=function(book, from,to){
            var bookurl =  book.substring(book.indexOf('O'));
          $scope.mytrades.push({"fromUser": from, "toUser":to, "book": book, "status":"pending"});
                 $http.post('/api/trades/' + from + '/' + to + '/' + bookurl, null);
            }
            
      }]);