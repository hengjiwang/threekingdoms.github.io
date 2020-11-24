let period = document.getElementById("period");
let profile = document.getElementById("profile");
let profileItems = profile.getElementsByTagName("p");
let button = document.querySelector("button");
let svgWidth = '100%';
let svgHeight = 800;
let svg = d3.select("graph")
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .attr("meetOrSlice", "slice");

let color = { "Wei": "blue", "Shu": "green", "Wu": "red", "Jin": "purple", "Other": "grey" };
let tooltip = d3.select('body')
    .append('div')
    .style('position', 'absolute')
    // .style('z-index', '10')
    .style('background-color', 'white')
    // .style('width', '80px')
    // .style('height', '20px')
    // .style('text-align', 'center')
    // .style('line-height', '20px')
    .style('color', 'black')
    .style('visibility', 'hidden')
    .style('font-size', '12px')
    .text('')

let majors1 = ['Cao Cao', 'Gan Ning',
    'Guan Yu', 'Huang Zhong', 'Liu Bei', 'Lu Bu', 'Sun Ce', 'Sun Quan',
    'Xu Huang', 'Xun Yu', 'Zhang Fei', 'Zhang Liao', 'Zhou Yu'
]

let majors2 = ['Lu Meng', 'Lu Xun', 'Ma Chao', 'Sima Yi', 'Zhang He',
    'Zhuge Liang', 'Zhao Yun'
]

let majors3 = ['Deng Ai', 'Jiang Wei']

// ------------------Profile-------------------------------

let nodePaths = ["count-1-120.json", "count-1-2.json", "count-3-9.json",
    "count-10-24.json", "count-25-33.json", "count-34-50.json", "count-51-85.json",
    "count-86-104.json", "count-105-120.json"
];

let edgePaths = ["graph-1-120.json", "graph-1-2.json", "graph-3-9.json",
    "graph-10-24.json", "graph-25-33.json", "graph-34-50.json", "graph-51-85.json",
    "graph-86-104.json", "graph-105-120.json"
];

// Default show the first option or previou selected option
let index = getCookie("period", 0);
period.selectedIndex = index;

for (let i = 0; i < profileItems.length; i++) {
    profileItems[i].style.display = "none";
}
profileItems[index].style.display = "inline";
let nodePath = nodePaths[index];
let edgePath = edgePaths[index];

d3.json('data/' + nodePath, function(nodes) {
    d3.json('data/' + edgePath, function(edges) {
        makeGraph(nodes, edges, index);
    })
})

// Change displayed innerText if option of period change
period.onchange = function() {
    profileItems[index].style.display = "none";
    index = this.selectedIndex;
    document.cookie = "period=" + index;
    profileItems[index].style.display = "inline";


    nodePath = nodePaths[index];
    edgePath = edgePaths[index];

    // Rebuild canvas
    svg.remove();
    svg = d3.select("graph")
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .attr("meetOrSlice", "slice");

    // Rebuild graph
    d3.json('data/' + nodePath, function(nodes) {
        d3.json('data/' + edgePath, function(edges) {
            makeGraph(nodes, edges, index);
        })
    })
}

// deselect button
button.addEventListener("click", ()=>{
    svg.remove();
    svg = d3.select("graph")
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .attr("meetOrSlice", "slice");

    d3.json('data/' + nodePath, function(nodes) {
        d3.json('data/' + edgePath, function(edges) {
            makeGraph(nodes, edges, index);
        })
    })
    
});

// -------------------Make graph------------------------------

// Build graph based on given nodes and edges

// edit nodes and edges:
function editData(nodes, edges, index) {
    // Filter people
    nodes = nodes.slice(0, 50);

    // Normalize counts
    let maxCount = nodes[0].count;
    let minCount = nodes[nodes.length - 1].count

    // Replace young images to old when proper
    for (let j = 0; j < nodes.length; j++) {
        nodes[j].count = 15 + 30 * Math.pow(nodes[j].count - minCount, 0.6) / Math.pow(maxCount - minCount, 0.6);

        if (index > 5 && majors1.indexOf(nodes[j].name) >= 0) {
            nodes[j].image = nodes[j].image.replace('young', 'old');
        } else if (index > 6 && majors2.indexOf(nodes[j].name) >= 0) {
            nodes[j].image = nodes[j].image.replace('young', 'old');
        } else if (index > 7 && majors3.indexOf(nodes[j].name) >= 0) {
            nodes[j].image = nodes[j].image.replace('young', 'old');
        }

        if (nodes[j].name == 'Lady Sun') {
            nodes[j].image = 'sun-shangxiang-(informal).jpg';
        }
    }

    // Add hashmap

    let hashmap = {}
    for (let i = 0; i < nodes.length; i++) {
        hashmap[nodes[i].name] = i;
    }
    // Change elements in edges to numbers

    let new_edges = [];
    for (let i = 0; i < edges.length; i++) {
        if (hashmap.hasOwnProperty(edges[i].source) && hashmap.hasOwnProperty(edges[i].target)) {
            new_edges.push({
                "source": hashmap[edges[i].source],
                "target": hashmap[edges[i].target],
                "weight": edges[i].weight
            });
        }
    }
    return { "nodes": nodes, "edges": new_edges };
}

// plot svg

function plotSVG(nodes, edges, myclick, oriedges, minEdge, maxEdge) {
    // Layout
    let forceScale = d3.scale.linear().domain([minEdge, maxEdge]).range([300, 150]);
    let force = d3.layout.force()
        .nodes(nodes)
        .links(edges)
        .size([800, 800])
        .linkDistance(function(l) {
            // return forceScale(l.weight);
            if (myclick) {
                return forceScale(l.weight);
            } else {
                if (l.source.faction == l.target.faction & l.source.faction != "Other") {
                    return forceScale(l.weight) / 5 + 200;
                } else {
                    return forceScale(l.weight) / 5 + 300;
                }
            }
        })
        .friction(0)
        .gravity(0)
        .charge(-200);

    // force.resume();
    force.start();
    // Add lines
    // console.log(minEdge, maxEdge);
    let colorscale = d3.scale.linear().domain([minEdge, maxEdge]).range([0.2, 1]);
    let linescale = d3.scale.linear().domain([minEdge, maxEdge]).range([1, 10]);
    let svgEdges = svg.selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .style("stroke", function(d) {
            return "rgba(150,150,150," + colorscale(d.weight) + ")";
        })
        .style("stroke-width", function(d) {
            return linescale(d.weight);
        });


    // Add nodes
    // let countScale = d3.scale.linear().domain([minCount, maxCount]).range([15, 60]);
    let svgNodes = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("title", function(d) {
            return d.name;
        })
        .attr("src", function(d) {
            return d.image;
        })
        .attr("r", function(d) {
            return d.count;
        })
        .style("stroke", function(d) {
            return color[d.faction]; // || "grey";
        })
        .style("stroke-width", 4)
        //Add avatars
        .style("fill", function(d, i) {

            if (d.image == "undefined") {
                return color[d.faction];
            }

            let img_w = d.count * 2;
            let img_h = img_w;

            let defs = svg.append("defs").attr("id", "imgdefs")

            let catpattern = defs.append("pattern")
                .attr("id", "catpattern" + i)
                .attr("height", 1)
                .attr("width", 1)

            catpattern.append("image")
                .attr("x", -(img_w / 2 - d.count))
                .attr("y", -(img_h / 2 - d.count))
                .attr("width", img_w)
                .attr("height", img_h)
                .attr("xlink:href", 'images/avatars/' + d.image)

            return "url(#catpattern" + i + ")";

        })
        .on("mouseover", function(d, i) {
            return tooltip.style('visibility', 'visible').text(d.name);
        })
        .on('mousemove', function(d, i) {
            return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px')
        })
        .on('mouseout', function(d, i) {
            return tooltip.style('visibility', 'hidden')
        })
        .call(force.drag);


    // Update
    force.on("tick", function() {
        svgEdges.attr("x1", function(d) {
                return validateXY(d.source.x, "x");
            })
            .attr("y1", function(d) {
                return validateXY(d.source.y, "y");
            })
            .attr("x2", function(d) {
                return validateXY(d.target.x, "x");
            })
            .attr("y2", function(d) {
                    return validateXY(d.target.y, "y");
                }

            );

        svgNodes.attr("cx", function(d) {
                return validateXY(d.x, "x");
            })
            .attr("cy", function(d) {
                return validateXY(d.y, "y");
            });
    });


    svgNodes.on("click", function(d) {
        if (d3.event.defaultPrevented) return;
        svg.remove();
        svg = d3.select("graph")
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .attr("meetOrSlice", "slice");

        let newEdges = [];
        let newNodes = [];
        let minEdge = 10;
        let maxEdge = 0;
        let minCount = 1000;
        let maxCount = 0;
        newNodes.push({ "name": d.name, "count": 55, "image": d.image, "faction": d.faction });
        let numNodes = 0;
        for (let i = 0; i < oriedges.length; i++) {
            if ((d.name === oriedges[i].source.name) || (d.name === oriedges[i].target.name)) {
                numNodes++;
                newEdges.push({
                    "source": 0,
                    "target": numNodes,
                    "weight": oriedges[i].weight
                });
                minEdge = oriedges[i].weight < minEdge ? oriedges[i].weight : minEdge;
                maxEdge = oriedges[i].weight > maxEdge ? oriedges[i].weight : maxEdge;
                if (d.name == oriedges[i].source.name) {
                    newNodes.push({
                        "name": oriedges[i].target.name,
                        "count": oriedges[i].target.count,
                        "image": oriedges[i].target.image,
                        "faction": oriedges[i].target.faction
                    });
                    minCount = oriedges[i].target.count < minCount ? oriedges[i].target.count : minCount;
                    maxCount = oriedges[i].target.count > maxCount ? oriedges[i].target.count : maxCount;
                } else {
                    newNodes.push({
                        "name": oriedges[i].source.name,
                        "count": oriedges[i].source.count,
                        "image": oriedges[i].source.image,
                        "faction": oriedges[i].source.faction
                    });
                    minCount = oriedges[i].source.count < minCount ? oriedges[i].source.count : minCount;
                    maxCount = oriedges[i].source.count > maxCount ? oriedges[i].source.count : maxCount;
                }
            }
        }

        let nodeScale = d3.scale.linear().domain([minCount, maxCount]).range([15, 45]);
        for (i = 1; i < newNodes.length; i++) {
            newNodes[i].count = nodeScale(newNodes[i].count);
        }

        return plotSVG(newNodes, newEdges, true, oriedges, minEdge, maxEdge);
    });
}

// return the value of cname in the cookie otherwise return cval
function getCookie(cname, cval) {
    let key = cname + "=";
    let buffer = decodeURIComponent(document.cookie);
    let cookies = buffer.split(";");
    for (let i = 0; i < cookies.length; i++) {
        let cooki = cookies[i];
        let start = cooki.indexOf(key);
        if (start != -1) {
            return cooki.substring(start+key.length, cooki.length);
        }
    }
    return cval
}

function validateXY(val, xy) {
    if (xy == "x") {
        let webWidth = document.body.clientWidth - 30;
        return val > 30 ? (val > webWidth ? webWidth : val) : 30;
    } else {
        let webHeight = svgHeight - 30;
        return val > 30 ? (val > webHeight ? webHeight : val) : 30;
    }
}

function makeGraph(nodes, edges, index) {
    let data = editData(nodes, edges, index);
    plotSVG(data.nodes, data.edges, false, data.edges,
        edges[edges.length - 1].weight, data.edges[0].weight,
    );
    let svg2 = d3.select("graph").select("svg");
}