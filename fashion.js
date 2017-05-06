	//Creating svg element
	var svg_w1 = 750;
	var svg_h1 = 300;
	var svg1 = d3.select("div.network").append("svg")
		.attr("width", svg_w1)
		.attr("height", svg_h1);
	var margin = 10;
	var nodes = [];
	var edges = [];
	var toggle = 0;
	var max_num = 0;
	var months = [];
	var timeIndex = 3;


	var simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(function(d) {
			return d.id;
		}).distance(20).strength(0.5))
		.force("charge", d3.forceManyBody())
		.force("center", d3.forceCenter(svg_w1 / 2, svg_h1 / 2));

	d3.queue()
		.defer(d3.csv, "data-processing/node_list.csv")
		.defer(d3.csv, "data-processing/edge_list.csv")
		.defer(d3.csv, "node_url.csv")
		.await(function(error, node_list, edge_list, node_url) {

			// Create nodes of categories
			// nodes 
			for (var event of node_list) {
				var obj = {};
				obj = {
					id: event.Node,
					label: event.Node,
					group: event.Type,
					value: event.value0,
				};

				for (i = 0; i < 48; i++) {
					obj["value" + i] = eval("event.value" + i);
				}
				nodes.push(obj);

			}
			//edges
			for (var edge of edge_list) {
				var obj = {};
				obj = {
					source: edge.Category,
					target: edge.Event,
					value: edge.value0
				};
				for (i = 0; i < 48; i++) {
					obj["value" + i] = eval("edge.value" + i);
				}
				edges.push(obj);
				// if (!nodes.find(node => node.id == edge.Event)) {
				// nodes.push({
				// id: edge.Category,
				// label: edge.Category,
				// value: 50,
				// month: edge.Month,
				// group: "Clothing"
				// })
				// }
				// if (!nodes.find(node => node.id == edge.Category)) {
				// nodes.push({
				// id: edge.Event,
				// label: edge.Event,
				// value: 50,
				// month: edge.Month,
				// type: 'Event'
				// })
			}
			//}


			for (var url of node_url) {
				for (var i in nodes) {
					if (nodes[i].id == url.Node) {
						nodes[i].url = url.url;
					}
				}
			}

			// Create scales
			var radius_scale = d3.scaleLinear()
				.domain([0, 100])
				.range([0, 20]);

			var radius_color = d3.scaleLinear()
				.domain([0, 100])
				.range(["pink", "#2b90f5"]);



			for (var node of nodes) {
				node.radius = radius_scale(node.value);
				node.color = radius_color(node.value);
			}

			// Create node and edges
			nodeG = svg1.append("g")
				.attr("class", "nodes");

			node = nodeG.selectAll('circle')
				.data(nodes)
				.enter()
				.append("circle")
				.attr('class', 'node')
				.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended))
							.on("click", function(d){
				d3.select('#img')
				.attr('src', d.url);
			});
			//.attr('class', 'node')
			simulation = simulation.nodes(nodes).restart();


			linkG = svg1.append("g")
				.attr("class", "links")

			link = linkG.selectAll('line')
				.data(edges)
				.enter()
				.append('line')
				.attr('class', 'link');

			simulation.force("link")
				.links(edges);


			d3.select("#nRadius").on("input", function() {
				console.log(this.value);
				updateView(this.value);
			});

			updateView(0);



			//update the elements
			function updateView(nRadius) {
				// filter data
				// curNodes = nodes.filter(d => parseDate(d.month) == nRadius);
				// curEdges = edges.filter(d => parseDate(d.month) == nRadius);
				// console.log(curNodes);
				// adjust the text on the range slider

				d3.select("#nRadius-value").text(nRadius);
				d3.select("#nRadius").property("value", nRadius);
				//timeIndex = nRadius;

				// Update nodes 
				node = node.attr('r', function(d) {
						return radius_scale(eval("d.value" + nRadius));
					})
					.merge(node);

				// node.enter()
				// .append('circle')
				// .attr('class','node')
				// .attr('r', d => radius_scale(d.value));

				//Update links
				link = link.attr('stroke-width', function(d) {
						return 1;
					})
					.merge(link);


				simulation.on("tick", ticked);



				function ticked() {
					svg1.selectAll('line.link')
						.attr("x1", function(d) {
							return d.source.x;
						})
						.attr("y1", function(d) {
							return d.source.y;
						})
						.attr("x2", function(d) {
							return d.target.x;
						})
						.attr("y2", function(d) {
							return d.target.y;
						});

					svg1.selectAll('circle.node')
						.attr("cx", function(d) {
							return d.x;
						})
						.attr("cy", function(d) {
							return d.y;
						});
				}
				var myTimer;
				d3.select("#start").on("click", function() {
					clearInterval(myTimer);
					myTimer = setInterval(function() {
						var b = d3.select("#nRadius");
						var t = (+b.property("value") + 1) % (+b.property("max") + 1);
						if (t == 0) {
							t = +b.property("min");
						}
						if (parseInt($("#nRadius").val()) == 48) {
							clearInterval(myTimer); //stop the autoplay
						}
						d3.select("#nRadius-value").text(t);
						d3.select("#nRadius").property("value", t);
						console.log(t); //log value display at nRadius
						b.property("value", t);
						updateView($("#nRadius").val());
						//updateView(t); /// For updating the view
					}, 1000);
				});



			}
		});



	//});


	// Dragging helper functions that use simulation 
	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	// Dragging helper functions that do not need simulation
	function dragended(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}


	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	// Color by group
	function color(group) {
		if (group == "Event") {
			return COLOR.red;
		} else {
			return COLOR.blue;
		}
	}

	// node = svg1.select("g").selectAll("circle").data(nodes)
	// 	.enter()
	// 	.append("circle")
	// 	.attr("r", 10)
	// 	.style("fill", d => radius_color(d.number_searches))
	// 	.attr("stroke", "pink")
	// 	.call(d3.drag()
	// 		.on("start", dragstarted)
	// 		.on("drag", dragged)
	// 		.on("end", dragended))
	// 	.on('dblclick', connectedNodes);



	function parseDate(dateString) {
		var parser = d3.timeParse("%y-%b");
		var date = parser(dateString);
		return (date.getFullYear() - 2012) * 12 + date.getMonth();
	}

	// $('.btn').click(function() {
	// 	console.log('test');
	// 	//if value < max
	// 	var temp = parseInt($("#nRadius").val()) + 12;
	// 	console.log(temp);
	// 	if (temp <= 48) {
	// 		$("#nRadius").val(temp);
	// 		$("#nRadius").trigger('change');
	// 		d3.select("#nRadius-value").text(temp);
	// 		d3.select("#nRadius").property("value", temp);
	// 	}
	// });


	d3.select("#pause").on("click", function() {
		clearInterval(myTimer);
	});

	d3.select("#stop").on("click", function() {
		d3.select("#nRadius-value").text(0);
		d3.select("#nRadius").property("value", 0);
		clearInterval(myTimer);
	});


	var width = 1140,
		height = 20,
		padding = 10;
	margin = 140;
	var svg = d3.select('div.tick').append('svg')
		.attr('width', width)
		.attr('height', height);
	var mindate = new Date(2012, 0, 1),
		maxdate = new Date(2015, 11, 31);
	var scale = d3.scaleTime()
		.domain([mindate, maxdate])
		.range([10, width]);
	var axis = d3.axisBottom(scale).ticks(47).tickFormat(d3.timeFormat("%m"));
	svg.append('g')
		.attr('transform', 'translate(' + -5 + ', ' + 0 + ')')
		.call(axis);
	var year = ["2012", "2013", "2014", "2015"];
	var svg2 = d3.select('div.tick').append('svg')
		.attr('width', width)
		.attr('height', height);
	svg2.selectAll('text')
		.data(year)
		.enter()
		.append('text')
		.attr("dx", margin)
		.attr("x", function(d, i) {
			return 280 * i;
		})
		.attr("font-size", "10px")
		.attr("fill", "black")
		.attr("y", 20)
		.text(function(d) {
			return d;
		});