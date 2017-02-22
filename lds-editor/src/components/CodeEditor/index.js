import Behave from '../../helpers/behavejs/behave.js';
import controller from '../../helpers/controller';
import Prism from 'prismjs';
import languages from 'prism-languages';
import socket from '../../helpers/socket';

console.log('File code');
export default function CodeEditor (el) {
  console.log('CodeEditor');
  const undoStack = [];
  const redoStack = [];
  const componentId = el.dataset.component;
  const filename = el.dataset.file;
  const textarea = el.querySelector('.js-textarea');
  const highlightEditor = el.querySelector('.js-editor');
  const caret = el.querySelector('.js-caret');

  const form = el.querySelector('.js-form');
  const submitButton = el.querySelector('.js-submit');
  const revisionPicker = el.querySelector('.js-revisions');

  const language = el.dataset.language.trim() || 'markdown';
  let codeString;

  fixIndentationIssue();

  var editor = new Behave({
    textarea: textarea,
    replaceTab: true,
    softTabs: true,
    tabSize: 2,
    autoOpen: true,
    overwrite: true,
    autoStrip: true,
    autoIndent: true,
    fence: false
  });
  let isUndoing = false;
  const initialString = textarea.value;

  function update(event) {
    if (textarea.value !== codeString) {
      if (codeString && !isUndoing) {
        undoStack.push(codeString);
        submitButton.removeAttribute('disabled');
      }
      write();
      isUndoing = false;
    } else if (textarea.selectionEnd) {
      setCaret(textarea.selectionEnd);
    }
    if (codeString === initialString) {
      submitButton.setAttribute('disabled', '');
    } else if (codeString) {
      submitButton.removeAttribute('disabled');
    }
  }
  function focus() {
    el.classList.add('has-focus');
    write();
  }
  function blur() {
    el.classList.remove('has-focus');
  }

  function write (caretPosition) {
    codeString = textarea.value;
    highlightEditor.innerHTML = Prism.highlight(codeString, Prism.languages[language]);

    setCaret(textarea.selectionEnd);
  }
  function setCaret(caretPosition) {
    if (textarea.selectionEnd && textarea.selectionEnd === textarea.selectionStart) {
      caret.innerHTML = codeString.substr(0, textarea.selectionEnd).replace(/</g, '&lt;');
      var reststring = codeString.substr(textarea.selectionEnd).replace(/</g, '&lt;');
      var restWord = reststring.substr(0, reststring.indexOf(' '));
      caret.setAttribute('data-restword', restWord);
      el.classList.remove('no-caret');
    } else {
      el.classList.add('no-caret');
    }
  }

  function undo() {
    if (undoStack.length) {
      isUndoing = true;
      let caretPos = textarea.selectionEnd;
      redoStack.push(textarea.value);
      textarea.value = undoStack.pop();
      textarea.selectionEnd = caretPos;
    }
  }

  function redo() {
    if (redoStack.length) {
      let caretPos = textarea.selectionEnd;
      undoStack.push(textarea.value);
      textarea.value = redoStack.pop();
      textarea.selectionEnd = caretPos;
    }
  }
  function fixIndentationIssue() {
    // Due to handlebars issue 14 extra indentation spaces are added in sourcecode
    textarea.value = textarea.value.replace(/(\n)([ ]{14})/g, (full, m1, m2) => {
      return m1;
    });
  }

  function save() {
    if (confirm('Du kommer att spara över filen. Är du säker på att du vill göra det?')) {
      socket.send({
        action: 'write',
        component: componentId,
        file: filename,
        content: textarea.value
      });
    }
  }

  function submit(event) {
    event.preventDefault();
    save();
  }

  function keystrokes (event) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.keyCode) {
        case 83: // S
          event.preventDefault();
          save();
          break;
        case 90: // Z
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
      }
    }
  }

  function insertAtCursor(string) {
    //IE support
    if (document.selection) {
        textarea.focus();
        sel = document.selection.createRange();
        sel.text = string;
    }
    //MOZILLA and others
    else if (textarea.selectionStart || textarea.selectionStart == '0') {
        var startPos = textarea.selectionStart;
        var endPos = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, startPos)
            + string
            + textarea.value.substring(endPos, textarea.value.length);
    } else {
        textarea.value += string;
    }
  }

  function pickRevision(event) {
    textarea.value = event.target.value;
    fixIndentationIssue();
    write();
  }

  function init () {
    if (revisionPicker) {
      revisionPicker.addEventListener('change', pickRevision);
    }

    form.addEventListener('submit', submit);
    textarea.addEventListener('focus', focus);
    textarea.addEventListener('blur', blur);
    textarea.addEventListener('change', update);
    textarea.addEventListener('click', update);
    textarea.addEventListener('keyup', update);
    textarea.addEventListener('keydown', keystrokes);
    update();
  }
  return { init };
};

controller.add('CodeEditor', CodeEditor);
