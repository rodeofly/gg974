// Generated by CoffeeScript 2.3.0

// set up SVG for D3
var DnDFileController, circle, circlesGroup, colors, dnd, drag_line, force, height, keydown, keyup, lastKeyDown, lastNodeId, links, mousedown, mousedown_link, mousedown_node, mousemove, mouseup, mouseup_node, nodes, path, pathsGroup, resetMouseVars, restart, save, selected_link, selected_node, spliceLinksForNode, svg, tick, width;

width = 960;

height = 500;

colors = d3.scale.category10();

// define arrow markers for graph links
svg = d3.select('#graf974').append('svg').attr('oncontextmenu', 'return false;').attr('width', width).attr('height', height);

svg.append('svg:defs').append('svg:marker').attr('id', 'end-arrow').attr('viewBox', '0 -10 20 20').attr('refX', 12).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto').append('svg:path').attr('d', 'M0,-10L20,0L0,10').attr('fill', '#000');

svg.append('svg:defs').append('svg:marker').attr('id', 'start-arrow').attr('viewBox', '0 -10 20 20').attr('refX', 8).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto').append('svg:path').attr('d', 'M20,-10L0,0L20,10').attr('fill', '#000');


// line displayed when dragging new nodes
drag_line = svg.append('svg:path').attr('class', 'link dragline hidden').attr('d', 'M0,0L0,0');

// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.
nodes = [
  {
    id: 0,
    reflexive: true // parce que depart
  },
  {
    id: 1,
    reflexive: false
  },
  {
    id: 2,
    reflexive: false
  },
  {
    id: 3,
    reflexive: true // parce que arrivee
  },
  {
    id: 4,
    reflexive: false
  },
  {
    id: 5,
    reflexive: false
  }
];

lastNodeId = 5;

links = [
  {
    source: nodes[0],
    target: nodes[1],
    left: false,
    right: true
  },
  {
    source: nodes[0],
    target: nodes[4],
    left: false,
    right: true
  },
  {
    source: nodes[0],
    target: nodes[5],
    left: false,
    right: true
  },
  {
    source: nodes[1],
    target: nodes[2],
    left: false,
    right: true
  },
  {
    source: nodes[2],
    target: nodes[3],
    left: false,
    right: true
  },
  {
    source: nodes[4],
    target: nodes[3],
    left: false,
    right: true
  },
  {
    source: nodes[4],
    target: nodes[5],
    left: false,
    right: true
  },
  {
    source: nodes[5],
    target: nodes[1],
    left: false,
    right: true
  },
  {
    source: nodes[5],
    target: nodes[2],
    left: false,
    right: true
  },
  {
    source: nodes[5],
    target: nodes[3],
    left: false,
    right: true
  }
];

// handles to link and node element groups
pathsGroup = svg.append('svg:g');

path = pathsGroup.selectAll('path');

circlesGroup = svg.append('svg:g');

circle = circlesGroup.selectAll('g');

// update force layout (called automatically each iteration)
tick = function() {
  // draw directed edges with proper padding from node centers
  path.attr('d', function(d) {
    var deltaX, deltaY, dist, normX, normY, sourcePadding, sourceX, sourceY, targetPadding, targetX, targetY;
    deltaX = d.target.x - d.source.x;
    deltaY = d.target.y - d.source.y;
    dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    normX = deltaX / dist;
    normY = deltaY / dist;
    sourcePadding = d.left ? 22 : 12;
    targetPadding = d.right ? 22 : 12;
    sourceX = d.source.x + sourcePadding * normX;
    sourceY = d.source.y + sourcePadding * normY;
    targetX = d.target.x - (targetPadding * normX);
    targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });
  return circle.attr('transform', function(d) {
    return `translate(${d.x}, ${d.y})`;
  });
};

// init D3 force layout
force = d3.layout.force().nodes(nodes).links(links).size([width / 2, height / 2]).linkDistance(80).charge(-500).on('tick', tick);

// mouse event vars
selected_node = null;

selected_link = null;

mousedown_link = null;

mousedown_node = null;

mouseup_node = null;

// only respond once per keydown
lastKeyDown = -1;

resetMouseVars = function() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
};

// update graph (called when needed)
restart = function() {
  var arete, e, g, i, j, k, len, len1, len2, s, sommet;
  // path (link) group
  path = path.data(links);
  // update existing links
  path.classed('selected', function(d) {
    return d === selected_link;
  }).style('marker-start', function(d) {
    if (d.left) {
      return 'url(#start-arrow)';
    } else {
      return '';
    }
  }).style('marker-end', function(d) {
    if (d.right) {
      return 'url(#end-arrow)';
    } else {
      return '';
    }
  });
  // add new links
  path.enter().append('svg:path').attr('class', 'link').classed('selected', function(d) {
    return d === selected_link;
  }).style('marker-start', function(d) {
    if (d.left) {
      return 'url(#start-arrow)';
    } else {
      return '';
    }
  }).style('marker-end', function(d) {
    if (d.right) {
      return 'url(#end-arrow)';
    } else {
      return '';
    }
  }).on('mousedown', function(d) {
    if (d3.event.ctrlKey) {
      
      // select link
      mousedown_link = d;
      if (mousedown_link === selected_link) {
        selected_link = null;
      } else {
        selected_link = mousedown_link;
      }
      selected_node = null;
      return restart();
    }
  });
  
  // remove old links
  path.exit().remove();
  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) {
    return d.id;
  });
  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle').style('fill', function(d) {
    if (d === selected_node) {
      return d3.rgb(colors(d.id)).brighter().toString();
    } else {
      return colors(d.id);
    }
  }).classed('reflexive', function(d) {
    return d.reflexive;
  });
  // add new nodes
  g = circle.enter().append('svg:g');
  g.append('svg:circle').attr('class', 'node').attr('r', 12).style('fill', function(d) {
    if (d === selected_node) {
      return d3.rgb(colors(d.id)).brighter().toString();
    } else {
      return colors(d.id);
    }
  }).style('stroke', function(d) {
    return d3.rgb(colors(d.id)).darker().toString();
  }).classed('reflexive', function(d) {
    return d.reflexive;
  }).on('mouseover', function(d) {
    if (!mousedown_node || d === mousedown_node) {
      return;
    }
    
    // enlarge target node
    d3.select(this).attr('transform', 'scale(1.1)');
  }).on('mouseout', function(d) {
    if (!mousedown_node || d === mousedown_node) {
      return;
    }
    
    // unenlarge target node
    d3.select(this).attr('transform', '');
  }).on('mousedown', function(d) {
    if (d3.event.ctrlKey) {
      return;
    }
    
    // select node
    mousedown_node = d;
    if (mousedown_node === selected_node) {
      selected_node = null;
    } else {
      selected_node = mousedown_node;
    }
    selected_link = null;
    // reposition drag line
    drag_line.style('marker-end', 'url(#end-arrow)').classed('hidden', false).attr('d', `M${mousedown_node.x}, ${mousedown_node.y}L${mousedown_node.x}, ${mousedown_node.y}`);
    restart();
  }).on('mouseup', function(d) {
    var direction, link, source, target;
    if (!mousedown_node) {
      return;
    }
    
    // needed by FF
    drag_line.classed('hidden', true).style('marker-end', '');
    // check for drag-to-self
    mouseup_node = d;
    if (mouseup_node === mousedown_node) {
      resetMouseVars();
      return;
    }
    // unenlarge target node
    d3.select(this).attr('transform', '');
    // add link to graph (update if exists)
    // NB: links are strictly source < target; arrows separately specified by booleans
    source = void 0;
    target = void 0;
    direction = void 0;
    if (mousedown_node.id < mouseup_node.id) {
      source = mousedown_node;
      target = mouseup_node;
      direction = 'right';
    } else {
      source = mouseup_node;
      target = mousedown_node;
      direction = 'left';
    }
    link = void 0;
    link = links.filter(function(l) {
      return l.source === source && l.target === target;
    })[0];
    if (link) {
      link[direction] = true;
    } else {
      link = {
        source: source,
        target: target,
        left: false,
        right: false
      };
      link[direction] = true;
      links.push(link);
    }
    // select new link
    selected_link = link;
    selected_node = null;
    return restart();
  });
  
  // show node IDs
  g.append('svg:text').attr('x', 0).attr('y', 4).attr('class', 'id').text(function(d) {
    return d.id;
  });
  // remove old nodes
  circle.exit().remove();
  // set the graph in motion
  force.start();
  $("#sommets").empty().append("<th>sommets</th>");
  $("#entrants").empty().append("<th>degrés entrants</th>");
  $("#sortants").empty().append("<th>degrés sortants</th>");
  $("#departs").empty();
  $("#arrivees").empty();
  for (i = 0, len = nodes.length; i < len; i++) {
    sommet = nodes[i];
    sommet.reflexive = false;
  }
  for (j = 0, len1 = nodes.length; j < len1; j++) {
    sommet = nodes[j];
    $("#sommets").append(`<td>${sommet.id}</td>`);
    [e, s] = [0, 0];
    for (k = 0, len2 = links.length; k < len2; k++) {
      arete = links[k];
      if (arete.source === sommet && arete.right) {
        s += 1;
      }
      if (arete.target === sommet && arete.left) {
        s += 1;
      }
      if (arete.target === sommet && arete.right) {
        e += 1;
      }
      if (arete.source === sommet && arete.left) {
        e += 1;
      }
      if (arete.source === sommet && !arete.right && !arete.left) {
        e += 1;
        s += 1;
      }
      if (arete.target === sommet && !arete.right && !arete.left) {
        e += 1;
        s += 1;
      }
    }
    $("#entrants").append(`<td>${e}</td>`);
    $("#sortants").append(`<td>${s}</td>`);
    if (s === 0 && e > 0) {
      $("#arrivees").append(`<li>${sommet.id}</li>`);
      sommet.reflexive = true;
    }
    if (e === 0 && s > 0) {
      $("#departs").append(`<li>${sommet.id}</li>`);
      sommet.reflexive = true;
    }
  }
};

mousedown = function() {
  var node, point;
  // prevent I-bar on drag
  //d3.event.preventDefault();
  // because :active only works in WebKit?
  svg.classed('active', true);
  if (d3.event.ctrlKey || mousedown_node || mousedown_link) {
    return;
  }
  // insert new node at point
  point = d3.mouse(this);
  node = {
    id: ++lastNodeId,
    reflexive: false
  };
  node.x = point[0];
  node.y = point[1];
  nodes.push(node);
  restart();
};

mousemove = function() {
  if (!mousedown_node) {
    return;
  }
  // update drag line
  drag_line.attr('d', `M${mousedown_node.x}, ${mousedown_node.y}L${(d3.mouse(this)[0])}, ${(d3.mouse(this)[1])}`);
  restart();
};

mouseup = function() {
  if (mousedown_node) {
    // hide drag line
    drag_line.classed('hidden', true).style('marker-end', '');
  }
  // because :active only works in WebKit?
  svg.classed('active', false);
  // clear mouse event vars
  resetMouseVars();
};

spliceLinksForNode = function(node) {
  var toSplice;
  toSplice = links.filter(function(l) {
    return l.source === node || l.target === node;
  });
  return toSplice.map(function(l) {
    return links.splice(links.indexOf(l), 1);
  });
};

keydown = function() {
  d3.event.preventDefault();
  if (lastKeyDown !== -1) {
    return;
  }
  lastKeyDown = d3.event.keyCode;
  // ctrl
  if (d3.event.keyCode === 17) {
    circle.call(force.drag);
    svg.classed('ctrl', true);
  }
  if (!selected_node && !selected_link) {
    return;
  }
  switch (d3.event.keyCode) {
    // backspace
    case 8:
    case 46:
      // delete
      if (selected_node) {
        nodes.splice(nodes.indexOf(selected_node), 1);
        spliceLinksForNode(selected_node);
      } else if (selected_link) {
        links.splice(links.indexOf(selected_link), 1);
      }
      selected_link = null;
      selected_node = null;
      restart();
      break;
    case 65:
      // A
      if (selected_link) {
        // set link direction to both left and right
        selected_link.left = false;
        selected_link.right = false;
      }
      restart();
      break;
    case 71:
      // G
      if (selected_link) {
        // set link direction to left only
        selected_link.left = true;
        selected_link.right = false;
      }
      restart();
      break;
    case 68:
      // D
      if (selected_node) {
        // toggle node reflexivity
        selected_node.reflexive = !selected_node.reflexive;
      } else if (selected_link) {
        // set link direction to right only
        selected_link.left = false;
        selected_link.right = true;
      }
      restart();
  }
};

keyup = function() {
  lastKeyDown = -1;
  // ctrl
  if (d3.event.keyCode === 17) {
    circle.on('mousedown.drag', null).on('touchstart.drag', null);
    svg.classed('ctrl', false);
  }
};

// app starts here
svg.on('mousedown', mousedown).on('mousemove', mousemove).on('mouseup', mouseup);

d3.select(window).on('keydown', keydown).on('keyup', keyup);

restart();

//Drag an Drop interface
DnDFileController = function(selector, onDropCallback) {
  var el_;
  el_ = document.querySelector(selector);
  this.dragenter = function(e) {
    e.stopPropagation();
    e.preventDefault();
    el_.classList.add('dropping');
    return $("#upload").addClass("slim");
  };
  this.dragover = function(e) {
    e.stopPropagation();
    return e.preventDefault();
  };
  this.dragleave = function(e) {
    e.stopPropagation();
    e.preventDefault();
    el_.classList.remove('dropping');
    return $("#upload").removeClass("slim");
  };
  this.drop = function(e) {
    e.stopPropagation();
    e.preventDefault();
    el_.classList.remove('dropping');
    onDropCallback(e.dataTransfer.files, e);
    return $("#upload").removeClass("slim").hide();
  };
  el_.addEventListener('dragenter', this.dragenter, false);
  el_.addEventListener('dragover', this.dragover, false);
  el_.addEventListener('dragleave', this.dragleave, false);
  return el_.addEventListener('drop', this.drop, false);
};

//#################################################################
//Drag and Drop file
dnd = new DnDFileController('#upload', function(files) {
  var f, reader;
  f = files[0];
  reader = new FileReader;
  reader.onloadend = function(e) {
    var data, i, l, len, ref, t;
    data = JSON.parse(this.result);
    console.log(data);
    pathsGroup.remove();
    circlesGroup.remove();
    
    // handles to link and node element groups
    pathsGroup = svg.append('svg:g');
    path = pathsGroup.selectAll('path');
    circlesGroup = svg.append('svg:g');
    circle = circlesGroup.selectAll('g');
    lastNodeId = data.lastNodeId;
    nodes = data.nodes;
    links = [];
    ref = data.links;
    for (i = 0, len = ref.length; i < len; i++) {
      l = ref[i];
      t = {};
      t.source = nodes[l.source.id];
      t.target = nodes[l.target.id];
      t.left = l.left;
      t.right = l.right;
      links.push(t);
    }
    console.log(links);
    force = d3.layout.force().nodes(nodes).links(links).size([width, height]).linkDistance(150).charge(-500).on('tick', tick);
    return restart();
  };
  reader.readAsText(f);
});

//###################################################################
$("#importJSON").on("click", function() {
  return $("#upload").show();
});

$("#upload .close").on("click", function() {
  return $("#upload").hide();
});

save = function(type) {
  var dataStr, dlAnchorElem, html, stringValue, svgBlob;
  dataStr = `data:text/${type};charset=utf-8,`;
  stringValue = prompt("Nom du fichier ?", stringValue);
  switch (type) {
    case "json":
      dataStr += encodeURIComponent(JSON.stringify({
        nodes: nodes,
        links: links,
        lastNodeId: lastNodeId
      }));
      break;
    case "svg":
      html = d3.select("#graf974").select("svg").attr("title", "svg_title").attr("version", 1.1).attr("xmlns", "http://www.w3.org/2000/svg").node().parentNode.innerHTML;
      svgBlob = new Blob([html], {
        type: "image/svg+xml;charset=utf-8"
      });
      dataStr = URL.createObjectURL(svgBlob);
  }
  dlAnchorElem = document.getElementById('save');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `${stringValue}.${type}`);
  return dlAnchorElem.click();
};

$(function() {
  //  console.log nodes,links
  $("#genJSON").on("click", function() {
    return save("json");
  });
  $("#genSVG").on("click", function() {
    return save("svg");
  });
  $("#hints, #rules, #defs").hide();
  $("#hintsToggler").on("click", function() {
    return $("#hints").toggle();
  });
  $("#rulesToggler").on("click", function() {
    return $("#rules").toggle();
  });
  return $("#defsToggler").on("click", function() {
    return $("#defs").toggle();
  });
});
