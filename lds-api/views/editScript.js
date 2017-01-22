(function editMode() {
  function traverseDom(curr_element) { // this is the recursive function
    var comments = new Array();
    // base case: node is a comment node
    if (curr_element.nodeName == "#comment" || curr_element.nodeType == 8) {
      // You need this OR because some browsers won't support either nodType or nodeName... I think...
      comments[comments.length] = curr_element;
    }
    // recursive case: node is not a comment node
    else if(curr_element.childNodes.length>0) {
      for (var i = 0; i<curr_element.childNodes.length; i++) {
        comments = comments.concat(traverseDom(curr_element.childNodes[i]));
      }
    }
    return comments;
  }
  var commentNodes = traverseDom(document.body); // Start with body, and thus skip layout data

  var partials = commentNodes.filter(comment => {
    return comment.data.match(/component="/);
  }).map(comment => {
    var component = comment.data.match(/component="([^"]*)"/);
    var data = comment.data.match(/data="([^"]*)"/);
    var schema = comment.data.match(/schema="([^"]*)"/);
    var dataPath = comment.data.match(/datapath="([^"]*)"/);
    var children = [];

    var currEl = comment;
    var endRegExp = new RegExp('\/' + component[1]);

    while (currEl.nextSibling && !(currEl.nextSibling.nodeType === 8 && currEl.nextSibling.data.match(endRegExp))) {
      if (currEl.nodeType === 1) { // IS ElementNode
        children.push(currEl);
      }
      currEl = currEl.nextSibling;
    }

    return {
      comment: comment,
      component: component && component[1],
      data: data && JSON.parse(data[1].replace(/(&quot\;)/g,"\"")),
      dataPath: dataPath && JSON.parse(dataPath[1].replace(/(&quot\;)/g,"\"")),
      schema: schema && JSON.parse(schema[1].replace(/(&quot\;)/g,"\"")),
      children: children
    }
  });
  console.log(partials);
  var editContainer = document.createElement('div');
  editContainer.className = 'LdsEdit-container';
  partials.forEach(partial => {
    var layer = createEditLayer(partial);
    editContainer.appendChild(layer);
  });

  document.body.appendChild(editContainer);

  function mouseover(layer, event) {
    layer.style.display = 'block';
    layer.style.top = event.clientY + window.scrollY + 'px';
  }
  function mouseout(layer, event) {
    layer.style.display = 'none';
  }

  function createEditLayer(partial) {
    var editLayer = document.createElement('div');
    editLayer.innerHTML = `
    <h2 class="LdsEdit-layerTitle">${partial.component}</h2>
    `;
    var pre = document.createElement('pre');
    editLayer.className = 'LdsEdit-layer';

    var dataObject = {};
    Object.keys(partial.schema).forEach(key => {
      dataObject[key] = partial.data[key];
    });
    pre.innerHTML = JSON.stringify(dataObject, false, 2);
    editLayer.appendChild(pre);

    partial.children.forEach(element => {
      element.addEventListener('mouseover', mouseover.bind(this, editLayer));
      element.addEventListener('mouseout', mouseout.bind(this, editLayer));
    })
    return editLayer;
  }
}());
