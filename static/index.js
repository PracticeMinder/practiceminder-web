
window.ScatterPlot = function($, d3, nv){

  var sp = {};

  sp.randomData = function (groups, points) { //# groups,# points per group
    var data = [],
        shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
        random = d3.random.normal();
  
    for (i = 0; i < groups; i++) {
      data.push({
        key: 'Group ' + i,
        values: []
      });
  
      for (j = 0; j < points; j++) {
        data[i].values.push({
          x: random()
        , y: random()
        , size: Math.random()
        //, shape: shapes[j % 6]
        });
      }
    }
  
    return data;
  };

  sp.buildMenu  = function(selector){
    $.when(
      $.get("template/metric-dropdown.html"),
      $.getJSON("practices/metrics")
    ).then(function(dropdown,metrics){
      var template = Hogan.compile(dropdown[0]);
      var metrics = metrics[0].available_metrics.map(function(metric){
        return {name: metric, metric: metric}
      }); 
      ["X-Axis", "Y-Axis", "Size"].forEach(function(control){
          var data = {
            control: control, 
            control_name:control, 
            metrics: metrics
          };
          $("#choices").append(template.render(data));
      });
      $("#choices").append(template.render({control: "Color",control_name:"Color",metrics: [{"name": "CCG", "metric": "CCG"}]}));

    });
  };
  
  sp.getData = function(){
    $.when( 
      $.getJSON("practices/metric/random"), 
      $.getJSON("practices/metric/random")
    ).then(
      function(metrica, metricb){
        var random = d3.random.normal();
        
        console.log(metrica, metricb);
        
        var datum = { 
          key: "General Practices",
          values: []
        };
        
        metrica[0].forEach(function(v){
          datum.values.push({
            size: 1,
            x: v.metrics.random,
            y: random(),
          });
        });
        
        console.log(datum);

        sp.plot("#chart svg", [datum]);
        
      },
      function(){
        alert("Error ocurred when loading data.");
      }
    ); 
  };
  sp.encodeMetricName = function(name){
    return btoa(name); 
  };
  sp.compare = function(x_metric, y_metric, size_metric, color_metric){
    if( !x_metric || !y_metric ){ 
      console.log("We don't mess with the graph until we have two metrics");
      return null;
    }
    else if( x_metric && y_metric &&  !size_metric && !color_metric){ 
      $.when( 
      $.getJSON("practices/compare/"+sp.encodeMetricName(x_metric)+
                  "/"+sp.encodeMetricName(y_metric)+
                  "/2000") 
    ).then(
      function(metrics){
        var datum = { 
          key: "General Practices",
          values: []
        };
        metrics.forEach(function(practice){
          datum.values.push({
            size: 1,
            x: parseFloat(practice.metrics[x_metric]),
            y: parseFloat(practice.metrics[y_metric]),
          });
        });
        $("#datapoints").html( datum.values.length);
        sp.plot("#chart svg", [datum]);
      }
    );
    $.when(
      $.getJSON("practices/comparestats/"+sp.encodeMetricName(x_metric)+
                  "/"+sp.encodeMetricName(y_metric)+
                  "/2000")
      ).then(
      function(stats){
        var Rcoef = stats['R']
        var pvalue = stats['p']
        $("#Rcoef").html(Rcoef);
        $("#pvalue").html(pvalue);
        $("#JSONUrl").html('<a href="practices/compare/'+sp.encodeMetricName(x_metric)+
                  "/"+sp.encodeMetricName(y_metric)+
                  '/2000">' +'Export </a>')
      }
      )
  }
    else if( x_metric && y_metric &&  !size_metric && (color_metric == 'CCG' )){ 
      console.log(color_metric)
      $.when( 
      $.getJSON("practices/compare/"+sp.encodeMetricName(x_metric)+
                  "/"+sp.encodeMetricName(y_metric)+
                  "/2000") 
    ).then(
      function(metrics){
        var datum = {};
        ['10A', '00N', '08T', '99Q', '02E', '02D', '02G', '02F', '02A', '99P', '00R', '02M', '02N', '02H', '99E', '99D', 
        '99G', '99F', '02Q', '02P', '99C', '02R', '99M', '99N', '02Y', '02X', '99K', '99J', '08H', '10W', '01A', '00T', 
        '04W', '08A', '09X', '09Y', '01C', '01D', '01E', '01F', '01G', '01H', '01J', '01K', '01M', '01N', '09W', '09H', 
        '09P', '09J', '07G', '01T', '04Q', '01V', '01W', '01X', '09A', '09C', '09D', '09E', '09F', '09G', '05C', '10J', 
        '04N', '04M', '04L', '04K', '04J', '10L', '04H', '04G', '10C', '04E', '04D', '04C', '10G', '10D', '10E', '10X', 
        '10Y', '04Y', '04X', '10R', '04V', '10Q', '10V', '04R', '10T', '09N', '12A', '01Y', '12D', '03J', '03K', '03H', 
        '03N', '03L', '03M', '11M', '03C', '03A', '03F', '03G', '03D', '03E', '11T', '03X', '03Y', '03R', '03Q', '03V', 
        '03W', '03T', '01R', '06Q', '06P', '06T', '06W', '06V', '06Y', 'NA', '02W', '06A', '02V', '06D', '06F', '06H', 
        '06K', '06M', '06L', '06N', '11E', '11D', '99B', '07Y', '11A', '05L', '05N', '05H', '11C', '05J', '05D', '05E',
         '05F', '05G', '05A', '99H', '05X', '05Y', '05T', '08N', '05V', '05W', '05P', '05Q', '05R', '00J', '11N', '11H', 
         '02T', '11J', '00C', '08Y', '08X', '00G', '00F', '00D', '00K', '08R', '08Q', '08P', '08W', '08V', '00M', '00L', 
         '08K', '08J', '00Q', '00P', '00W', '00V', '08M', '08L', '08C', '00Y', '00X', '08G', '08F', '08E', '08D', '10K', 
         '00H', '10H', '10N', '07V', '07W', '07T', '07R', '07P', '07Q', '10M', '07X', '11X', '09L', '04F', '07N', '07L', 
         '07M', '07J', '07K', '07H', '99A','unknown'].forEach(function(CCG){
         datum[CCG] = {values: []}
        });

        metrics.forEach(function(practice){
          if (practice.CCG in datum){
            datum[practice.CCG].values.push({
              size: 1,
              x: parseFloat(practice.metrics[x_metric]),
              y: parseFloat(practice.metrics[y_metric]),
            });
          }else{
            datum['unknown'].values.push({
              size: 1,
              x: parseFloat(practice.metrics[x_metric]),
              y: parseFloat(practice.metrics[y_metric]),
            });
          }
        });
        var data = []
        for (var CCG in datum){
          data.push({
              key:  CCG,
              values : datum[CCG]['values']
          }
          )
        }
        // $("#datapoints").html( datum.values.length);
        sp.plot("#chart svg", data);
      }
    );
    $.when(
      $.getJSON("practices/comparestats/"+sp.encodeMetricName(x_metric)+
                  "/"+sp.encodeMetricName(y_metric)+
                  "/2000")
      ).then(
      function(stats){
        var Rcoef = stats['R']
        var pvalue = stats['p']
        $("#Rcoef").html(Rcoef);
        $("#pvalue").html(pvalue);
        $("#JSONUrl").html('<a href="practices/compare/'+sp.encodeMetricName(x_metric)+
                  "/"+sp.encodeMetricName(y_metric)+
                  '/2000">' +'Export </a>')
      }
      )
    }else{


    $.when( 
      $.getJSON("practices/compare/"+sp.encodeMetricName(x_metric)+
                  "/"+sp.encodeMetricName(y_metric)+
                  "/"+sp.encodeMetricName(size_metric)+
                  "/2000") 
    ).then(
      function(metrics){
        var datum = { 
          key: "General Practices",
          values: []
        };
        metrics.forEach(function(practice){
          datum.values.push({
            size: parseFloat(practice.metrics[x_metric]),
            x: parseFloat(practice.metrics[x_metric]),
            y: parseFloat(practice.metrics[y_metric]),
          });
        });
        console.log(datum)
        
        $("#datapoints").html( datum.values.length);
        $("#size").html( size_metric);
        sp.plot("#chart svg", [datum]);

        
      }
    );
    // Get Stats
    $.when(
      $.getJSON("practices/comparestats/"+sp.encodeMetricName(x_metric)+
                  "/"+sp.encodeMetricName(y_metric)+
                  "/2000")
      ).then(
      function(stats){
        var Rcoef = stats['R']
        var pvalue = stats['p']
        $("#Rcoef").html(Rcoef);
        $("#pvalue").html(pvalue);
        $("#JSONUrl").html('<a href="practices/compare/'+sp.encodeMetricName(x_metric)+
                  "/"+sp.encodeMetricName(y_metric)+
                  '/2000">' +'Export </a>')
      }
      )
  };
}

  sp.plot = function(target, data){
    nv.addGraph(function() {
      var chart = nv.models.scatterChart()
                    .showDistX(true)
                    .showDistY(true)
                    .color(d3.scale.category10().range());
    
      chart.xAxis.tickFormat(d3.format('.02f'))
      chart.yAxis.tickFormat(d3.format('.02f'))
    
      d3.select(target)
          .datum(data)
        .transition().duration(500)
          .call(chart);
    
      nv.utils.windowResize(chart.update);
    
      return chart;
    });
  };

  sp.controller = function(elem){
     var controlFor = $(elem).attr("control-for");
     var metric = $(elem).attr("metric");
     sp[controlFor] =  metric;
     $("#xlabel").html(sp["X-Axis"]);
     $("#ylabel").html(sp["Y-Axis"]);
     sp.compare(
        sp["X-Axis"],
        sp["Y-Axis"],
        sp["Size"],
        sp["Color"]
     );
  };
  
  sp["X-Axis"] = "";
  sp["Y-Axis"] = "";
  sp["Color"] = "";
  sp["Size"] = "";

  return sp;

}(jQuery, d3, nv);


