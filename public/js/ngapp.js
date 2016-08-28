'use strict';
  /* global angular */
      var ngapp = angular.module('ngapp', []);
      
      ngapp.controller('main',['$scope','$window','$http',  function($scope, $window, $http){
        
       
        $scope.errmsg=null;
        $scope.user=$window.userid;
       
          
         $http.get('/api/getbooks/' + $scope.user).success(function(data){
           if(data=="")
             $scope.userbooks=[];
           else
            $scope.userbooks=data.split(",");
         });
          
        $http.get('/api/gettrades/' + $scope.user).success(function(data){
          $scope.mytrades=[];
          $scope.othertrades=[];
          $scope.tradesin=0;
            $scope.tradesout=0;
          for(var i=0; i<data.length; i++){
            if(data[i].fromUser==$scope.user){
              $scope.mytrades.push(data[i]);
               if(data[i].status=='pending'){
                  $scope.tradesout++;
            }
            }
            else 
            {  
              $scope.othertrades.push(data[i]);}
              if(data[i].status=='pending' && data[i].toUser==$scope.user){
                $scope.tradesin++;
            }
          }
         
        
          
        });
          
          $scope.getBooks = function(title){
              $http.get('https://openlibrary.org/api/things?query={"type":"\/type\/edition","title~":"' + title + '*"}').success(function(data){
                 if(data.result.length==0){
                   $scope.bookimg=[];
                   return;  
                 } 
                    $scope.errmsg=null;
                 var books = data.result;
                 for(var i=0; i<books.length; i++){
                 books[i] =  books[i].substring(books[i].indexOf('O'));
                 books[i] = 'https://covers.openlibrary.org/b/olid/' + books[i] + '-M.jpg';
                 
                 }
                 $scope.bookimg = books;
              })
          }
          
      $scope.addBook = function(book, userid){
        var inlist=false;
        for(var i=0; i< $scope.userbooks.length; i++){
          if(book==$scope.userbooks[i]) inlist = true;
        }
            if(!inlist){
              var bookurl =  book.substring(book.indexOf('O'));
              $http.post('/api/addbook/' + bookurl + '/' + userid, null);
              $scope.userbooks.push(book);
            $scope.bookimg = [];
           $scope.errmsg=null;
           $scope.book='';
            }
            else{
               $scope.errmsg="You already have that book";
            }
      }
      
      $scope.delTrade = function(id){
            for(var i=0; i<$scope.mytrades.length; i++){
             
              if(id == $scope.mytrades[i]._id){
               if($scope.mytrades[i].fromUser==$scope.user && $scope.mytrades[i].status=='pending'){
                 $scope.tradesout--;
               }
               $scope.mytrades.splice(i, 1);
              }
            }
          $http.delete('/api/trades/' + id, null);
          
      }
      
      $scope.setTrade = function(id, status){
        var url='/api/setTrade/' + id + '/' + status;
        $http.post(url, null).success(function(){
              $http.get('/api/gettrades/' + $scope.user).success(function(data){
          $scope.mytrades=[];
          $scope.othertrades=[];
          $scope.tradesin=0;
            $scope.tradesout=0;
          for(var i=0; i<data.length; i++){
            if(data[i].fromUser==$scope.user){
              $scope.mytrades.push(data[i]);
               if(data[i].status=='pending'){
                  $scope.tradesout++;
            }
            }
            else 
            {  
              $scope.othertrades.push(data[i]);}
              if(data[i].status=='pending' && data[i].toUser==$scope.user){
                $scope.tradesin++;
            }
          }
        });
        });
       
      }
      }
      ]);
      
      ngapp.directive('errSrc', function() {
 return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
        elem.on('load', function(){
          if ($(this).width()<10){
            $(this).parent().hide();
          }
          else{
            $(this).css("width","120px");
            $(this).css("height","150px");
            $(this).parent().css("padding","10px");
          }
          
        })
  }
 }
});