# LDS - API
This is a server dependency of living design system and allows for simple connections and methods to preform on the running server controlled by certain endpoints.


## The endpoints
* /api/screendump     : Parses all component and views and creates screenshots which will be used to present component in styleguide.
* /api/export         : Eports all views to static HTML, in /dist folder, with relative paths to script and styles.
* /api/screen/[componentpath]  : Returns the URL to a certain components screenshot. If file screenshot.png is available it will be used primarily, otherwise path to generated bump, or if no content is available it will return the URL to its first child component.
* /api/views/[viewpath]?standalone=true : Renders a complete view without possibilities to interact with links or buttons
* /api/views/[viewpath]?type=json : Return view readme.md file rendered as HTML.
* /api/[componentpath]            : Returns rendered HTML of component using its default data (no css or js)
* /api/[componentpath]?standalone=true : Returns rendered HTML of component using its default data with css and js
* /api/[componentpath]?type=info  : return rendered contents of the readme.md
* /api/[componentpath]?type=json  : return styled contents of the default.json
* /api/[componentpath]?type=js    : return styled contentsof  the index.js
* /api/[componentpath]?type=css   : return styled contents of the index.css
* /api/[componentpath]?type=template  : return styled contents of the index.hbs
* /api/[componentpath]?type=html  : return styled contents of the resulting HTML
