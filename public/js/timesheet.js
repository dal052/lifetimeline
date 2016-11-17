(function() {
  'use strict';

  /**
   * Initialize a Timesheet
   */
  var Timesheet = function(container, min, max, data) {
    this.data = [];
    this.year = {
      min: min,
      max: max
    };

    this.parse(data || []);
    if (typeof document !== 'undefined') {
      this.container = (typeof container === 'string') ? document.querySelector('#'+container) : container;
      //remove scale first if it already exists
      if($(".scaleyearmonth").length){
        $(".scaleyearmonth").remove();
      }
      this.drawSections();
      //remove detailed data first it is already exists
      if($(".detailedInfo").length){
        $(".detailedInfo").remove();
        $("#detailedTitle").html('');
        $("#detailedEmotion").html('');
        $("#detailedStartEndDate").html('');
        $("#detailedDescription").html('');
        $("#detailedDeleteButton").remove();
      }
      this.insertData();
    }
  };

  /**
   * Insert data into Timesheet
   */
  Timesheet.prototype.insertData = function() {
    var html = [];
    var widthMonth = this.container.querySelector('.scale section').offsetWidth;

    //this.container.innerHTML += '<ul class="data"></ul>';
    var uldata = this.container.querySelector('.data');
    for (var n = 0, m = this.data.length; n < m; n++) {
      var licreate = document.createElement("li");
      licreate.id = 'li'+n;
      licreate.className = 'detailedInfo';
      uldata.appendChild(licreate);
      //$('ul').append("li");
      var cur = this.data[n];
      licreate.data = cur;
      var bubble = this.createBubble(widthMonth, this.data[0].start, cur.start, cur.end);
      //console.log(JSON.stringify(this.data[n]));  $('#li'+n).html(
      $('#li'+n).append('<span style="margin-left: ' + bubble.getStartOffset() + 'px; width: ' + bubble.getWidth() + 'px;" class="bubble bubble-' + (cur.type || 'default') + '" data-duration="' + (cur.end ? Math.round((cur.end-cur.start)/1000/60/60/24/39) : '') + '"></span>'+
        '<span class="date">' + bubble.getDateLabel() + '</span> '+
        '<span class="label">' + cur.label + '</span>');
      //$('#li'+n).data('cur', { label: cur.label, desc: cur.desc, type: cur.type, start: cur.start, end: cur.end});
      var deletebutton = document.createElement("button"); //button used below to delete
      var editbutton = document.createElement("button"); //button used below to edit
      //when li is clicked it will show detailed information at the bottom 
      licreate.onclick = function(){
        var startenddate = (this.data.start.getMonth() + 1) + '/' + this.data.start.getDate()+ '/' + this.data.start.getFullYear() +'-'+ (this.data.end.getMonth() + 1) + '/' + this.data.end.getDate()+ '/' + this.data.end.getFullYear();;
        //console.log('suuuup'+startenddate);
        //remove class first because addclass will not change but instead get appended when more click happens
        $("#detailedtimesheet").removeClass (function (index, css) {
          return (css.match (/(^|\s)background-\S+/g) || []).join(' ');
        });
        $("#detailedtimesheet").addClass('background-' + (this.data.type || 'default'));
        $("#detailedTitle").html('<p><b>'+this.data.label+'</b></p>');
        $("#detailedEmotion").html('<p>'+this.data.type+'</p>');
        $("#detailedStartEndDate").html('<p>'+ startenddate +'</p>');
        $("#detailedDescription").html('<p>'+this.data.desc+'</p>');
        //document.createTextNode("Delete");
        deletebutton.textContent = "Delete";
        deletebutton.data = this.data.id;
        deletebutton.className = "btn btn-default";
        $('#detailedIdDelete').html(deletebutton);
        deletebutton.onclick = function(){
          angular.element($('#mainCon')).scope().deleteLifetimeline(this.data);
        };
        editbutton.textContent = "Edit";
        editbutton.data = this.data.id;
        editbutton.className = "btn btn-default";
        $('#detailedIdEdit').html(editbutton);
        editbutton.onclick = function(){
          angular.element($('#mainCon')).scope().showEditing();
          angular.element($('#mainCon')).scope().editformLifetimeline(this.data);
          //need $apply so that the ui changes after running showediting and editformlifetimeline
          angular.element($('#mainCon')).scope().$apply();
          //console.log('edit');
        };
      }; 
    }

    // for (var n = 0, m = this.data.length; n < m; n++) {
    //   var cur = this.data[n];
    //   var bubble = this.createBubble(widthMonth, this.data[0].start, cur.start, cur.end);
    //   console.log(JSON.stringify(this.data[n]));
    //   var line = [
    //     '<span onclick="testfunc(\''+JSON.stringify(this.data[n])+'\');" style="margin-left: ' + bubble.getStartOffset() + 'px; width: ' + bubble.getWidth() + 'px;" class="bubble bubble-' + (cur.type || 'default') + '" data-duration="' + (cur.end ? Math.round((cur.end-cur.start)/1000/60/60/24/39) : '') + '"></span>',
    //     '<span class="date">' + bubble.getDateLabel() + '</span> ',
    //     '<span class="label">' + cur.label + '</span>'
    //   ].join('');

    //   html.push('<li class="test">' + line + '</li>');
    // }

    // this.container.innerHTML += '<ul class="data">' + html.join('') + '</ul>'; 
    
    // $('.test').onclick = function (){
    //   console.log('hi');
    // }
    // for (var n = 0, m = this.data.length; n < m; n++) {
    //   this.container.querySelector("[id='"+n+"']")
    //   .onclick = function(){
    //     console.log('helloooo'+cur.label);
    //   };
    // }
  };

  /**
   * Draw section labels
   */
  Timesheet.prototype.drawSections = function() {
    //var htmlmonth = [];
    var yearlength = this.year.max - this.year.min; 
    var firstdate = this.data[0].start;
    var firstmonthlength = (12-firstdate.getMonth()+2);
    var yearperc = (100/(yearlength*12+firstmonthlength));
    //console.log(yearperc);
    for (var c = this.year.min; c <= this.year.max; c++) {
      //if the first year only show starting from the previous two month
      if(c == firstdate.getFullYear()){
        $('#scaleyear').append('<section class="scaleyearmonth" style="width: '+(yearperc*firstmonthlength)+'%">' + c + '</section>');
      }else {
        $('#scaleyear').append('<section class="scaleyearmonth" style="width: '+(yearperc*12)+'%">' + c + '</section>');
      }
      //to show months
      for (var i = 1; i <= 12; i++) {
        if(c == firstdate.getFullYear()){
          if(i > (firstdate.getMonth()-2)){
            $('#scalemonth').append('<section class="scaleyearmonth" style="width: '+yearperc+'%">' + i + '</section>');
          }
        }else {
          $('#scalemonth').append('<section class="scaleyearmonth" style="width: '+yearperc+'%">' + i + '</section>');
        }
      }
    }
    // var html = [];
    // var htmlmonth = [];
    // var yearlength = this.year.max - this.year.min; 
    // var firstdate = this.data[0].start;
    // var firstmonthlength = (12-firstdate.getMonth()+2);
    // var yearperc = (100/(yearlength*12+firstmonthlength));
    // //console.log(yearperc);
    // for (var c = this.year.min; c <= this.year.max; c++) {
    //   //if the first year only show starting from the previous two month
    //   if(c == firstdate.getFullYear()){
    //     html.push('<section style="width: '+(yearperc*firstmonthlength)+'%">' + c + '</section>');
    //   }else {
    //     html.push('<section style="width: '+(yearperc*12)+'%">' + c + '</section>');
    //   }
    //   //to show months
    //   for (var i = 1; i <= 12; i++) {
    //     if(c == firstdate.getFullYear()){
    //       if(i > (firstdate.getMonth()-2)){
    //         htmlmonth.push('<section style="width: '+yearperc+'%">' + i + '</section>');
    //       }
    //     }else {
    //       htmlmonth.push('<section style="width: '+yearperc+'%">' + i + '</section>');
    //     }
    //   }
    // }
    // this.container.className = 'timesheet color-scheme-default';
    // this.container.innerHTML = '<div class="scale" style="width: 100%; padding-right: 15%;">' + html.join('') + '</div>'
    // + '<div class="scale" style="width: 100%; padding-right: 15%; padding-top: 17px;">' + htmlmonth.join('') + '</div>';
  };

  /**
   * Parse data string
   */
  //working on fixing the date to get date form of MM-dd-yyyy
  Timesheet.prototype.parseDate = function(date) {
    date = date.split('-');
    date = new Date(parseInt(date[0], 10), parseInt(date[1], 10)-1, parseInt(date[2].substr(0, 2), 10));
    date.hasMonth = true;
    return date;
  };

  function randomColor(){
    var arr = ['default','lorem','ipsum','dolor','sit']
    var randomNum = Math.floor(Math.random()*5);
    return arr[randomNum];
  }
  /**
   * Parse passed data
   */
  Timesheet.prototype.parse = function(data) {
    for (var n = 0, m = data.length; n < m; n++) {
      //console.log("one: "+data[n].title+Object.keys(data[n]).length);
      var beg = this.parseDate(data[n].startDate);
      var end = typeof data[n].endDate != "undefined" ? this.parseDate(data[n].endDate) : this.parseDate(data[n].startDate);
      var lbl = Object.keys(data[n]).length === 7 ? data[n].title : data[n].title;
      var cat = typeof data[n].emoColor != "undefined" ? data[n].emoColor : randomColor();
      var desc = typeof data[n].description != "undefined" ? data[n].description : "none";
      var id = data[n]._id;
      if (beg.getFullYear() < this.year.min) {
        this.year.min = beg.getFullYear();
      }

      if (end && end.getFullYear() > this.year.max) {
        this.year.max = end.getFullYear();
      } else if (beg.getFullYear() > this.year.max) {
        this.year.max = beg.getFullYear();
      }

      this.data.push({id: id, start: beg, end: end, label: lbl, desc: desc, type: cat});
    }
  };

  /**
   * Wrapper for adding bubbles
   */
  Timesheet.prototype.createBubble = function(wMonth, min, start, end) {
    return new Bubble(wMonth, min, start, end);
  };

  /**
   * Timesheet Bubble
   */
  var Bubble = function(wMonth, min, start, end) {
    this.min = min;
    this.start = start;
    this.end = end;
    this.widthMonth = wMonth;
  };

  /**
   * Format month number
   */
  Bubble.prototype.formatMonth = function(num) {
    num = parseInt(num, 10);

    return num >= 10 ? num : '0' + num;
  };

  /**
   * Calculate starting offset for bubble
   */
  Bubble.prototype.getStartOffset = function() {
    if(this.start.getFullYear() == this.min.getFullYear()){
      //console.log((this.widthMonth/((12-this.start.getMonth()+2)*30)) * ((30 * (12-this.start.getMonth()+1))+this.start.getDate()));
      return (this.widthMonth/((12-this.start.getMonth()+2)*30)) * ((30 * (12-this.start.getMonth()+1))+this.start.getDate());
    }
    //console.log(((360*(this.start.getFullYear() - (this.min.getFullYear()+1))) + (30*(12-this.min.getMonth()+2)) + (this.start.getMonth()*30) + this.start.getDate()));
    return (this.widthMonth/((12-this.min.getMonth()+2)*30)) * ((360*(this.start.getFullYear() - (this.min.getFullYear()+1))) + (30*(12-this.min.getMonth()+2)) + (this.start.getMonth()*30) + this.start.getDate());
  };

  /**
   * Get count of full years from start to end
   */
  Bubble.prototype.getFullYears = function() {
    return ((this.end && this.end.getFullYear()) || this.start.getFullYear()) - this.start.getFullYear();
  };

  /**
   * Get count of all months in Timesheet Bubble
   */
  Bubble.prototype.getMonths = function() {
    var fullYears = this.getFullYears();
    var months = 0;

    if (!this.end) {
      months += !this.start.hasMonth ? 12 : 1;
    } else {
      if (!this.end.hasMonth) {
        months += 12 - (this.start.hasMonth ? this.start.getMonth() : 0);
        months += 12 * (fullYears-1 > 0 ? fullYears-1 : 0);
      } else {
        months += this.end.getMonth() + 1;
        months += 12 - (this.start.hasMonth ? this.start.getMonth() : 0);
        months += 12 * (fullYears-1);
      }
    }
    return months;
  };

  /**
   * Get bubble's width in pixel
   */
  Bubble.prototype.getWidth = function() {
    var monthdiff = this.getMonths()-2;
    var datediff = (30-this.start.getDate()) + this.end.getDate();
    var yeardiff = this.start.getFullYear()-(this.end.getFullYear()+1);
    //if it is in the same month
    if(this.getMonths() == 1){
      datediff = this.end.getDate() - this.start.getDate() + 1;
    }
    //for those if start and end month is the same or is next to it
    if(monthdiff <= 0){
      monthdiff = 0;
    }
    if(yeardiff < 0){
      yeardiff = 0;
    }
    //if it starts in the first year
    if(this.start.getYear() == this.min.getYear()){
      //console.log(this.widthMonth/360) * ((this.getMonths()-2)*30 + this.start.getDate() + (30-this.end.getDate()));
      return (this.widthMonth/(((12-this.min.getMonth())+2)*30)) * ((monthdiff*30) + (30-this.start.getDate()) + this.end.getDate());
    }
    //to make the timeline dot be round cant see if too small
    if(datediff < 7){
      datediff = 7;
    } 
    //console.log(((360*(this.start.getFullYear()-(this.end.getFullYear()+1))) + (30*monthdiff) + datediff));
    return (this.widthMonth/(((12-this.min.getMonth())+2)*30)) * ((360*yeardiff) + (30*monthdiff) + datediff);
  };

  /**
   * Get the bubble's label
   */
  Bubble.prototype.getDateLabel = function() {
    return [
      (this.start.hasMonth ? this.formatMonth(this.start.getMonth() + 1) + '/' + this.formatMonth(this.start.getDate()) + '/' : '' ) + this.start.getFullYear(),
      (this.end ? '-' + ((this.end.hasMonth ? this.formatMonth(this.end.getMonth() + 1) + '/' + this.formatMonth(this.end.getDate()) + '/' : '' ) + this.end.getFullYear()) : '')
    ].join('');
  };

  window.Timesheet = Timesheet;
})();