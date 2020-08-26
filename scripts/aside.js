let width = 800;
let height = 80;
let mysvg = d3.select("aside").append("svg").attr("width", width).attr("height", height);

d3.json("data/count-people.json", function(data) {
    let dataset = [data.count["Wei"], data.count["Shu"], data.count["Wu"], data.count["Jin"], data.count["Other"]];
    let color = ["blue", "green", "red", "purple", "grey"];
    let faction = ["Wei", "Shu", "Wu", "Jin", "Other"];
    let xlinear = d3.scale.linear().domain([0, d3.max(dataset)]).range([0, 200]);
    let xPos = [];
    for (let i = 0; i < dataset.length; i++) {
        dataset[i] = xlinear(dataset[i]);
        xPos[i] = i == 0 ? 0 : dataset[i - 1] + xPos[i - 1];
    }
    let rectHeight = 40;
    let fontSize = 20;

    let g = mysvg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("g")

    g.append("rect")
        .attr("y", 0)
        .attr("x", function(d, i) {
            return xPos[i];
        })
        .attr("height", rectHeight)
        .attr("width", function(d) {
            return d;
        })
        .attr("fill", function(d, i) {
            return color[i];
        });

    g.append("text")
        .text(function(d, i) {
            return faction[i];
        })
        .attr("y", (rectHeight+fontSize) / 2)
        .attr("x", function(d, i) {
            return xPos[i] + d / 2;
        })
        .attr("font-size", fontSize)
        .attr("text-anchor", "middle")
        .attr("fill", "white");
        // .attr("dy", fontSize / 4);
});