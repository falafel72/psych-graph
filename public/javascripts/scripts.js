$(document).ready(function() {
    /* 
    TO DO:
        - Create a visualisation for the minimum number of possible studies
        - Change text placement
        - Avoid text scaling when zooming but keep the translation
    */
    var showNumberOfQuestions = false; 
    var showNecessaryStudies = false;
    var showUnits = false;

    var zoom = d3.zoom()
        .scaleExtent([1,10])
        .on("zoom",zoomed);

    var svg = d3.select("svg").call(zoom),
    width = +svg.attr("width"),
    height = +svg.attr("height");

    var typeColor = d3.scaleOrdinal(d3.schemeCategory20);
    var countColor = d3.scaleOrdinal(d3.schemeSpectral[10]);

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-15))
        .force("center", d3.forceCenter(width / 2, height / 2));

    var view = svg.append("g")
        .attr("class","view")
        .attr("transform", "translate(" + 0 + "," + 0 + ")");
    
    var legend = svg.append("g")
        .attr("class","study-legend");

    for(var i = 0; i < 10; i++) {
        legend.append("rect")
        .attr("x",20*i)
        .attr("y",0)
        .attr("width",20)
        .attr("height",5)
        .attr("fill",countColor(i));
    }
    
    d3.json("data.json", function(error, graph) {
        if (error) throw error;

        //need to make a function that returns the number of target questions for a study
        function count(id) {
            //find links[some index].source and count how many links have that as the source. 
            var counter = 0;
            for(var key in graph.links) {
                if(graph.links[key]["source"]["id"] == id) counter += 1;
            }
            return counter;
        }

        var link = view.append("g")
                .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
                .attr("stroke-width", 1);

        //make a group with the circle and label
        var nodeGroup = view.append("g")
                .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter().append("g")
                .attr("class","node");
            
        // the node is the circle
        var node = nodeGroup.append("circle")
            .attr("r", 8)
            .attr("fill", function(d) { return typeColor(d.type); })
            .attr("class",function(d) { return (d.type) ? "question" : "study"; })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // the name of the node is a text tag
        var nodeName = nodeGroup.append("text")
            .text(function(d) {return d.id});

        node.append("title")
                .text(function(d) { return d.id; });
        

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
            nodeName
                .attr("x", function(d) { return d.x + 9; })
                .attr("y", function(d) { return d.y + 4; });
        }
        

        function remove(id) {
            
        }

        //set the mode to switch each time the check box options are changed (with jquery?)
        $("input").change(function(d) {
            if($(this).attr("id") == "number-of-questions") { 
                showNumberOfQuestions = !showNumberOfQuestions;
                $("g.study-legend").toggle();
            }
            if($(this).attr("id") == "necessary-studies") showNecessaryStudies = !showNecessaryStudies;
            if($(this).attr("id") == "unit") showUnits = !showUnits;

            node.attr("fill",function(d) { 
                if(showNumberOfQuestions && d.type == 0) return countColor(count(d.id)-1);
                else return typeColor(d.type);
            });
        });
    });

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function zoomed() {
        view.attr("transform",d3.event.transform);
    }
});
