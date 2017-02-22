## Styleguide
The styleguide is a visual representation of all your components and views. Making it easy to see how your project is structured.

For every component we can read the readme.md, together with a live example of the component using some example data (defined in default.json).

LDS automatically parses all components and files and lists all dependencies one component has to others, and which other components are dependent on this component. Making it easier to know what to test after each change.

## Variations & Schemas
Each component can be configured to show variations or alternatives to the component data using the config.json file.

here we can define two parameters. "variations" and "schema".

### Variations
In variations, we can define extensions to the default.json data rendering multiple versions of the component after each other with a different set of data.

Only define the actual changes to default.json and not necessarily the entire data structure.
```
{
  "variations": [
    {
      "name": "Extra wide",
      "value": {
        "modifier": "wide"
      }
    },
    {
      "name": "Blue",
      "value": {
        "theme": "blue"
      }
    }
  ]
}
```

### Schema
Schemas are used to define how the component data can be modified for a non coder to change its content.
There are two ways of defining a schema for a data parameter.
Using schema $variations, will create a dropdown allowing the user to modifiy a certain live example with the value in each variation.
```
{
  "schema": {
    "modifier": {
      "$default": false,
      "$variations": [
        {
          "name": "Purple",
          "value": ["bg-purple", "color-white"]
        },
        {
          "name": "White",
          "value": ["bg-white", "color-green"]
        }
      }
    }
  }
}
```

Or using $types, to define what kind of data a parameter expects.
```
{
  "schema": {
    "title": {
      $type: "String"
    },
    "description": {
      "$type": "LongString"
    }
  }
}
```
Using $types will render form fields making it possible to insert any content and re rendering the component to specific needs.
