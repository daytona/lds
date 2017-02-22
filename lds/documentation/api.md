## API

The API is a set of endpoint used by Living Design System to trigger certain behaviours or rendering certain parts of the structure.

Most of the endpoints are used by LDS itself in order to render a component with specific properties or figuring out the correct screenshotURL, but some can be used by the developer to test a component in isolation or help the styleguide trigger screenshots.

Theese are some of the available endpoints:

```
/api/screendump
```
Goes through all components and opens them in a headless browser and taking a screenshot, for the styleguide

```
/api/export
```
Exports the entire prototype to static html-files within your dist folder, allowing the entire thing to run from the file browser.

```
/api/components/MyComponent?standalone=true
/api/views/start
```
Opens a specific component/view all alone, making it easy to test in isolation of others.
