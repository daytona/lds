# LDS - CLI
Command line interface for managing a Living Design System

This only returns the means for root lds-package to define commandnds and their actions.


Commands availibla are:

$ lds init      : Set up a new project with folder structure and configuation file
$ lds start     : Start up a Living-design-system server and build assets.
$ lds build {type}    : Build assets, if no type is defined all will be built (js, css, image, sass, fonts, icons)
$ lds watch     : Set up watch task to run build if any file is changed
$ lds create {type:name} creates a new basic component eg. component:Button, view:parentpage/subpage
$ lds test {test} : Run LDS test suite to make sure everything is correctly set up and ready for action or deploy
