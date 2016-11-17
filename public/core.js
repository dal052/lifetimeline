//core.js
var scotchLifetimeline = angular.module('scotchLifetimeline', []);
var globalMinDate = 5000;
var globalMaxDate = 0;

function mainController($scope, $http) {
    $scope.formData = {};
    $scope.editData = {};
    $scope.editData.currentItem = undefined; //to get current item index for update
    $scope.editing = false;
    //show and hide form so that relevant form shows up
    $scope.showEditing = function (){
        $scope.editing = true;
    };

     $scope.hideEditing = function (){
        $scope.editing = false;
    };
    //to add value to datepicker for start and end date
    $('#datepickerstart').datepicker({
        startView: "months",
        format: "yyyy-mm-dd"
    }).on('changeDate', function(){
      $scope.formData.startDate = this.value;
      console.log($scope.formData.startDate); //checking if this returns json or else try $resource
    });
    $('#datepickerend').datepicker({
        startView: "months",
        format: "yyyy-mm-dd"
    }).on('changeDate', function(){
      $scope.formData.endDate = this.value;
    });
    $('#datepickerstartupdate').datepicker({
        startView: "months",
        format: "yyyy-mm-dd"
    }).on('changeDate', function(){
      $scope.editData.startDate = this.value;
      console.log($scope.editData.startDate); //checking if this returns json or else try $resource
    });
    $('#datepickerendupdate').datepicker({
        startView: "months",
        format: "yyyy-mm-dd"
    }).on('changeDate', function(){
      $scope.editData.endDate = this.value;
    });
    //get api/lifetimeline and call new Timesheet over here
    // when landing on the page, get all lifetimeline and show them
    $http.get('/api/lifetimelines')
        .success(function(data) {
            $scope.lifetimelines = data;
            //console.log(data);
            var arr =  Object.keys($scope.lifetimelines[0]).length;
            //var arr = $scope.lifetimelines.map(JSON.parse);
            //if there is some data existing but constMin is not set 
            if((globalMinDate == 5000) && (arr != 0)){
                for(var i in $scope.lifetimelines){
                    var obj = $scope.lifetimelines[i];
                    //console.log(obj);
                    if(obj.startDate.split('-')[0] < globalMinDate) globalMinDate = obj.startDate.split('-')[0];
                    //if there is no maxDate
                    if((obj.endDate == null) && (globalMaxDate == 0)){
                        globalMaxDate = globalMinDate;
                    }
                    else {
                        if(obj.endDate == null){
                            obj.endDate = obj.startDate;
                        }
                       if(globalMaxDate = globalMaxDate < obj.endDate.split('-')[0]) globalMaxDate = obj.endDate.split('-')[0]; 
                    }
                }
            }
            //sorted descending by start date
            $scope.lifetimelines.sort(function (a, b) {
              if (a.startDate > b.startDate) { return 1; } 
              if (a.startDate < b.startDate) { return -1; }
              // a must be equal to b
              return 0;
            });
            //console.log('lifetimelines: '+ $scope.lifetimelines);
            new Timesheet('timesheet', globalMinDate, globalMaxDate, $scope.lifetimelines);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    $scope.editformLifetimeline = function(id){
        //console.log('editing');
        $scope.editData = $scope.lifetimelines.find(obj => obj._id === id);
        $scope.editData.currentItem = $scope.lifetimelines.findIndex(obj => obj._id === id);
    };
    $scope.updateLifetimeline = function(id){
        console.log($scope.editData);
        $http.put('/api/lifetimelines/'+id, $scope.editData)
            .success(function(data){
                //console.log(data);
                //formate the date to iso style Month dd, yyyy to yyyy-mm-ddTtime
                formatstartDate = new Date($scope.editData.startDate);
                $scope.editData.startDate = formatstartDate.toISOString();
                formatendDate = new Date($scope.editData.endDate);
                $scope.editData.endDate = formatendDate.toISOString();
                //console.log("date format: "+$scope.editData.endDate);
                $scope.lifetimelines[$scope.editData.currentItem].title = $scope.editData.title;
                $scope.lifetimelines[$scope.editData.currentItem].description = $scope.editData.description;
                $scope.lifetimelines[$scope.editData.currentItem].startDate = $scope.editData.startDate;
                $scope.lifetimelines[$scope.editData.currentItem].endDate = $scope.editData.endDate;
                $scope.lifetimelines[$scope.editData.currentItem].emoColor = $scope.editData.emoColor;
                $scope.editData.currentItem = undefined;
                //console.log($scope.lifetimelines);

                //reorganizing time spectrum
                for(var i in $scope.lifetimelines){
                    var obj = $scope.lifetimelines[i];
                    //console.log(obj);
                    if(obj.startDate.split('-')[0] < globalMinDate) globalMinDate = obj.startDate.split('-')[0];
                    //if there is no maxDate
                    if((obj.endDate == null) && (globalMaxDate == 0)){
                        globalMaxDate = globalMinDate;
                    }
                    else {
                        if(obj.endDate == null){
                            obj.endDate = obj.startDate;
                        }
                       if(globalMaxDate = globalMaxDate < obj.endDate.split('-')[0]) globalMaxDate = obj.endDate.split('-')[0]; 
                    }
                }
                //sorted descending by start date
                $scope.lifetimelines.sort(function (a, b) {
                  if (a.startDate > b.startDate) { return 1; } 
                  if (a.startDate < b.startDate) { return -1; }
                  // a must be equal to b
                  return 0;
                });
                new Timesheet('timesheet', globalMinDate, globalMaxDate, $scope.lifetimelines);

            })
            .error(function(data) {
                console.log('Error: ' + data);
            });  
    };
    // when submitting the add form, send the text to the node API
    $scope.createLifetimeline = function() {
        if($scope.formData.title == null){
            $('#inputTitlespan').html('<span style="color: red;">*Title is empty</span>');
        }
        if($scope.formData.startDate == null){
            $('#inputStartDatespan').html('<span style="color: red;">*Start Date is empty</span>');
        }
        //can store it only when title and start date is not empty
        if(($scope.formData.title != null) && ($scope.formData.startDate != null)) {
            $http.post('/api/lifetimelines', $scope.formData)
                .success(function(data) {
                    //console.log($scope.formData);
                    var tmpminDate = $scope.formData.startDate.split('/');
                    var tmpmaxDate;
                    if((globalMinDate == 5000) || (tmpminDate[2] < globalMinDate)){
                        globalMinDate = tmpminDate[2];
                    }
                    if(tmpmaxDate == null){
                        tmpmaxDate = tmpminDate;
                    }
                    if($scope.formData.endDate != null){
                        tmpmaxDate = $scope.formData.startDate.split('/');
                    }
                    if((globalMaxDate == 0) || (globalMaxDate < tmpmaxDate[2])){
                        globalMaxDate = tmpmaxDate[2];
                    }
                    $scope.formData = {}; // clear the form so our user is ready to enter another
                    $scope.lifetimelines = data;
                    //sorted descending by start date
                    $scope.lifetimelines.sort(function (a, b) {
                      if (a.startDate > b.startDate) { return 1; } 
                      if (a.startDate < b.startDate) { return -1; }
                      // a must be equal to b
                      return 0;
                    });
                    //console.log($scope.lifetimelines);
                    new Timesheet('timesheet', globalMinDate, globalMaxDate, $scope.lifetimelines);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
    };

    // delete a lifetimeline after checking it
    $scope.deleteLifetimeline = function(id) {
        $http.delete('/api/lifetimelines/' + id)
            .success(function(data) {
                $scope.lifetimelines = data;
                var objfirst = $scope.lifetimelines[0];
                globalMinDate = objfirst.startDate.split('-')[0]; //get startdate
                console.log('testing'+Object.keys($scope.lifetimelines[0]).length);
                globalMaxDate = 0;
                for(var i in $scope.lifetimelines){
                    var obj = $scope.lifetimelines[i];
                    //if there is no maxDate
                    if((obj.endDate == null) && (globalMaxDate == 0)){
                        globalMaxDate = globalMinDate;
                    }
                    else {
                        if(obj.endDate == null){
                            obj.endDate = obj.startDate;
                        }
                       if(globalMaxDate = globalMaxDate < obj.endDate.split('-')[0]) globalMaxDate = obj.endDate.split('-')[0]; 
                    }
                }
                //sort bu startDate order
                $scope.lifetimelines.sort(function (a, b) {
                      if (a.startDate > b.startDate) { return 1; } 
                      if (a.startDate < b.startDate) { return -1; }
                      // a must be equal to b
                      return 0;
                    });
                new Timesheet('timesheet', globalMinDate, globalMaxDate, $scope.lifetimelines);
                $scope.formData = {};
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

}