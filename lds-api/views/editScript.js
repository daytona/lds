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
    var componentRegEx = new RegExp('component="');
    return comment.data.match(componentRegEx);
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
      data: data && JSON.parse(data[1].replace(/(\\&quot\;)/g, '"')),
      dataPath: dataPath,
      schema: schema && JSON.parse(schema[1].replace(/(\&quot\;)/g, '"')),
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

  function createEditLayer(partial) {
    var editLayer;


    function mouseover(layer, event) {
      // Show toggleButton on first element on hover
      layer.style.display = 'block';
      layer.style.top = event.clientY + window.scrollY + 'px';
    }

    function mouseout(layer, event) {
      // Hide button on mouseout if not over subelement or editLayer
      layer.style.display = 'none';
    }

    function onChange(event) {
      /* call window.socket.send({
        action: 'update',
        component: 'componentID',
        data: formparams
      }) and listen for 'updated' and update location.href with session parameter */
      event.preventDefault();
      console.log('change event');
    }

    function createField(label, field, value) {
      var inputWrapper = document.createElement('div');
      inputWrapper.className = 'LdsEdit-formInput';
      var html = `<div class="LdsEdit-formInput">
        <label for="">${label}</label>`;

      if (field.$type === 'String') {
        html += `<input type="text" name="${field.label}" value="${value || ''}" />`;
      } else if (field.$type === 'LongString') {
        html += `<textarea name="${field.label}">${value || ''}</textarea>`;
      } else if (field.$type === 'Boolean') {
        html += `<input type="checkbox" name="${field.label}" ${value ? 'checked="true"' : ''} />`;
      }
      html += '</div>';
      inputWrapper.innerHTML = html;
      return inputWrapper.outerHTML;
    }

    function createParam(key, obj, data) {
      if (obj.$type) {
        return createField(key, obj, data);
      } else if (typeof obj === 'object' && Object.keys(obj).length) {
        return Object.keys(obj).map(key => {
          return `<div class="LdsEdit-formGroup">
          ${createParam(key, obj[key], data && data[key])}
          </div>`
        });
      }
    }
    function createForm(partial) {
      // Create fields based on schema with data values
      var editForm = document.createElement('form');
      editForm.className = 'LdsEdit-form';
      editForm.innerHTML = `
      <input type="hidden" name="data-path" class="js-datapath" value="${partial.data.$objectPath}">
        ${Object.keys(partial.schema).map(key => {
          return createParam(key, partial.schema[key], partial.data[key]);
        }).join('\n')}
      `;
      return editForm;
    }

    function createLayer() {
      var editLayer = document.createElement('div');
      editLayer.innerHTML = `
      <h2 class="LdsEdit-layerTitle">${partial.component}</h2>
      `;
      var pre = document.createElement('pre');
      editLayer.className = 'LdsEdit-layer';
      var form = createForm(partial);

      editLayer.appendChild(form);
      form.addEventListener('change', onChange);
      return editLayer;
    }

    function init() {
      editLayer = createLayer();
      partial.children.forEach(element => {
        element.addEventListener('mouseover', mouseover.bind(this, editLayer));
        element.addEventListener('mouseout', mouseout.bind(this, editLayer));
      });
      return editLayer;
    }

    return init();
  }
}());
