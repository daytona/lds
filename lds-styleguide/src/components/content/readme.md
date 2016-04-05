# Content
Placeholder component used to render content of any component, using the scope data.
If content value is string, it will be rendered as paragraph. If value is an array it will parhe it and for each string render a separate paragraph.

If value is an object (either as value or within array) it will look for key **component*** and call that partial wiyh its remaining data, for instance {"component": "heading", "text": "My string content"}.

If
