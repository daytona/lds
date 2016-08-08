# LDS - Engine
Render engine methods for using different templating languages in LDS.

It depends on a rendering engine is defined in lds.config.js in your LDS project folder, wich defines three methods.

* registerPartial(name, templateString);
* registerHelper(name, helperFunction);
* render(templateString, data);
