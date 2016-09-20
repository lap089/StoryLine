
/**
 * Main AngularJS Web Application
 */
var app = angular.module('webApp', [
  'ngRoute',
  'ngMaterial',
  'angularjs-dropdown-multiselect',
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/home.html", controller: "HomeCtrl"})
    // Pages
    .when("/about", {templateUrl: "partials/about.html"})
    // else 404
    .otherwise("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"});
}]);



app.controller('HomeCtrl', function ($scope, $mdDialog) {
  console.log("Home Controller reporting for duty.");

$scope.enableSearchSetting = {
            enableSearch: true,
            displayProp: 'name',
            idProp: 'name',
            externalIdProp: 'name',
            showCheckAll: false,
            showUncheckAll: true,
            scrollableHeight: '250px',
            scrollable: true
        };
$scope.buttonText = {
    buttonDefaultText: "Select characters"
};

var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scale.category20();

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(25)
    .nodePadding(30)
    .size([width, height]);

var path = sankey.link();

$scope.selectEvent = {onItemSelect: function(item) {console.log(item);}}

$scope.data = {
  "avatar": "http://vignette3.wikia.nocookie.net/disney/images/1/13/Toy_Story.jpg/revision/latest/scale-to-width-down/516?cb=20151003163558",
  "name": "Toy Story",
  "summary": "The story begins with a young boy named Andy Davis playing with his toys, such as a Mr. Potato Head toy, Slinky Dog, a plastic dinosaur named Rex and his favorite toy, Woody, a cowboy doll. He pretends Potato Head is a villain for which Woody must try to defeat. He takes Woody into the living room and plays with him some more, with a short interruption talking to his mother about his birthday party later that day and the upcoming move to a new house. After playing with Woody, Andy starts helping his mother by taking his baby sister, Molly, to her. While he's away, all of the toys come to life."
};

$scope.characterNodes = [];
$scope.listSelectedNodes = [];

d3.json("ToyStory.json", function(storyData) {

  sankey
      .nodes(storyData.nodes)
      .links(storyData.links)
      .layout(32);

 

  var link = svg.append("g").selectAll(".link")
      .data(storyData.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .attr("id", function(d,i){
        d.id = i;
        return "link-"+i;
      })
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .style("stroke", function(d) { 
       // console.log(d);
        return d.color = color(d.characterNode.replace(/ .*/, "")); })
      .sort(function(a, b) { return b.dy - a.dy; });


  storyData.nodes.forEach(addCharacter);   

  var node = svg.append("g").selectAll(".node")
      .data(storyData.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("id", function(d,i){
        return "node-" + d.name.replace(' ','');
      })
    .on("click", highlight_node_links)
    .on("dblclick", showScript)
    .on("mouseover", mouseOver)
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() {  console.log("dragstarted");  this.parentNode.appendChild(this); })
      .on("drag", dragmove));
      

     

  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { return d.summary + "\n";});

  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");


  function mouseOver(d){
    console.log(d.name + " hover");
     $scope.$apply(function(){
      $scope.data = d;
      if(typeof $scope.data.avatar == "undefined") {
        $scope.data.avatar = 'http://vignette3.wikia.nocookie.net/shokugekinosoma/images/6/60/No_Image_Available.png/revision/latest?cb=20150708082716';
      }
      $("p:first").scrollTop();
    });

  }    

  function addCharacter(node) {
     $scope.$apply(function(){
      if(typeof node.script == "undefined") {
        $scope.characterNodes.push({"name": node.name});
      }
    });
  }

  function click(d) {
    if (d3.event.defaultPrevented) return; 
    console.log(d.name + " clicked");
  }
  function dragmove(d) {
    console.log(d.name + " draged");
    d3.select(this).attr("transform", "translate(" + (d.x = Math.max(0, Math.min(width - 15, d3.event.x))) + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }

function showScript(node,i,event){
  console.log(node.name + " double clicked");
  if(node.script) {
      $scope.showCustom = function(event) {
               $mdDialog.show({
                  clickOutsideToClose: true,
                  scope: $scope,        
                  preserveScope: true,           
                  template: '<md-dialog flex="98">' +
                              '  <md-toolbar class="_md _md-toolbar-transitions">' +
                              '  <div class="md-toolbar-tools">'  + 
                              '   <h2>Script</h2>'          +
                              '  <span flex="" class="flex"></span>' +  
                              '  </div>'      +
                              '  </md-toolbar>'   +
                              '  <md-dialog-content>' +
                              '  <div class="textwrapper" style="border:1px solid #999999; margin:5px 0; padding:3px;" ><textarea style="text-align:center" rows="20" cols="200">' + node.script + '</textarea></div>' +
                              '  </md-dialog-content>' +
                              '</md-dialog>',
                  controller: function DialogController($scope, $mdDialog) {
                     $scope.closeDialog = function() {
                        $mdDialog.hide();
                     }
                  }
               });
            };
  $scope.showCustom(event);          
}
}

  function highlight_node_links(node,i){
     console.log(node.name + " clicked");
    var remainingNodes=[],
        nextNodes=[];

    var stroke_opacity = 0;
    if( d3.select(this).attr("data-clicked") == "1" ){
      d3.select(this).attr("data-clicked","0");
      stroke_opacity = 0.2;
    }else{
      d3.select(this).attr("data-clicked","1");
      stroke_opacity = 0.7;
    }

    var i = 0;
    storyData.links.forEach(function(step){
      if(step.characterNode === node.name) {
        highlight_link(i, stroke_opacity);
      }
      ++i;
      });

  }

  function highlight_link(id,opacity){
      d3.select("#link-"+id).style("stroke-opacity", opacity);
  }


});

});