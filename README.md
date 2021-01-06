Connect IoT Yeoman Generator
========= 

# Generator Versioning
Starting from 7.2.0, each combination of Critical Manufacturing MES version (Major + Minor) will have a dedicated generator to make it easier to keep compatibility.

For versions 7.2.0, 7.2.1, 7.2.2, ..., 7.2.\*, use the tag `72x` to install and update the generators<br>
```npm i -g @criticalmanufacturing/generator-iot@72x```

For versions 8.0.0, 8.0.1, 8.0.2, ..., 8.0.\*, use the tag `80x` to install and update the generators<br>
```npm i -g @criticalmanufacturing/generator-iot@80x```

<br>Each version will have it's own dedicated branch
https://github.com/criticalmanufacturing/generator-iot/tree/72x
https://github.com/criticalmanufacturing/generator-iot/tree/80x<br>
...
<br><br><br><br>


**generator-iot** is a set of scaffolding templates that enable CMF customization teams, partners and customers to easily start a new task, converter or protocol driver within `Critical Manufacturing MES` Equipment Integration module (Connect IoT).

Getting Started

Make sure `Yeoman` is also installed globally. If not:
```
npm i -g yo
```

To start using this generator, it is advisable to have it installed globally (-g setting in NPM).
```
npm i -g @criticalmanufacturing/generator-iot
```
# Apps
To see at any time, the list of available apps, open a terminal window and run:
```
yo @criticalmanufacturing/iot
```

There are different types of questions that will be displayed interactively. Some will request for a simple text, others a confirmation (Yes or No), a selection of one option out of many or event a multiple choice.

For both multiple and single choice, use the cursor (Up/Down) to move between the choices and use the Space bar to select/unselect.

All questions are considered answered when the Enter key is pressed.


## tasksPackage
Use this app to create a new custom package structure help you getting started. Of course, you still need to implement the tasks and converters (there are also apps to help you)

In a terminal window with the path where the entire package directory will be created, run:
```
yo @criticalmanufacturing/iot:tasksPackage
```
Answer all questions and a new directory with the package skeleton will be available and ready for you to implement the tasks and/or converters.

## task
To create a new task, make sure you have a terminal window open on the path of the root directory of the package that will contain the new task (must be the same path where the `package.json` file is located), and run:

```
yo @criticalmanufacturing/iot:task
```
Answer all questions and the task will be created on the `src/tasks` directory of the package.
The code generated is the skeleton on the task (base structure), so you have to implement the logic before it is usable.

## converter
To create a new converter, make sure you have a terminal window open on the path of the root directory of the package that will contain the new converter (must be the same path where the `package.json` file is located), and run:

```
yo @criticalmanufacturing/iot:converter
```
Answer all questions and the converter will be created on the `src/converters` directory of the package.
The code generated is the skeleton on the converter (base structure), so you have to implement the logic before it is usable.

## driver
The driver is the implementation of a protocol.

This app creates an entire new package with all the code necessary to be used by `Connect IoT`. Of course, you still need to implement the entire logic.

In a terminal window with the path where the entire package directory will be created, run:
```
yo @criticalmanufacturing/iot:driver
```
Answer all questions and a new directory with the protocol driver will be available and ready for you to implement the communication logic.

## fontgen

Tasks Packages can have their own set of icons to assign to each of the custom tasks. This generator is necessary to convert a set of `svg` files into a web font compatible with `Critical Manufacturing MES`.

This app must run on a terminal window where a file named `font.js` must exist. A template content of the file can be as follows:

```javascript
fontDef = {
	"font": {
		"fontname": "secsgem",
		"fullname": "SecsGem IoT",
		"familyname": "SecsGem IoT",
		"version": 0.1,
		"prefix": "secsgem-iot"
	}
}
module.exports = fontDef;
```

Currently, the app is expecting to have the `svg` files in the same directory level. All the generated files will be placed in the parent directory.

> svg icons must have a `-lg` and a `-sm` suffix in the name, representing a large and small icon respectively.

It is advisable to have the following directory structure:

```
controller-engine-custom-tasks
   font
      svg
         font.js
         someicon-lg.svg
         someicon-sm.svg
   src
      ...
   test
      ...
```

To run the app, execute the following command under the `svg` directory:

```
yo @criticalmanufacturing/iot:fontgen
```

# Development tips

If you are extending this package, it is easier to have it linked locally. Run the following command from the root directory of the package:
`npm link`

<!-- C:\Users\jpsantos\AppData\Roaming\npm\node_modules\@criticalmanufacturing\generator-iot -> N:\COMMON\EI\Business\Scaffolding\generator-iot -->

# Version History
**Next**
 - History will be maintained in the Github page for now on

**1.4.4**
- Removed Chokidar dependency from driver
- Removed Dev dependency from driver package.json
- Added gulpfile.js into driver
- Fixed compiler errors in driver
- Added missing entries in config (monitorApplication, SecurityPortal)

**1.4.3**
- Added gulp + codelyzer as devDependencies for taskPackage

**1.4.2**
- Added fonts section in taskPackage metadata

**1.4.1**
- Updated template driver for ssl implementation

**1.4.0**
- Updated dependencies versions for driver package
- Updated dependencies versions for tasks packages
- Fix driver source code to support new version of typescript
- Add entityName command parameter in driver
- Add commandParameter extension file in driver
- Add settings in tasksPackage to suppress generated files from VSCode

**1.3.1**
- Removed invalid entries from .gitignore file
- removed tgz file from previous package
- removed development entry from .npmrc

**1.3.0**
- Fixed missing entries in task settings code behind
- Fixed typos in task
- Updated gulpfile.js in tasksPackage
- Fixed dependencies in taskPackage
- Added template .less file in tasks
- Added missing comments in task designer file

**1.2.3**
- Several fixes and cleanup on the driver template

**1.2.2**
- Added missing gulpfile.js file back into tasksPackage template

**1.2.1**
- Added componentId to driver app command line

**1.2.0**
- Updated driver app

**1.1.0**
- Added tasksPackage app
- Added task app
- Small bug fixes 

**1.0.2** 
- Updated driver template

**1.0.1** 
- Fixed template generation of the driver with hidden files included
- Added missing IoT datatype Boolean
- Added test example for converter

**1.0.0**
- First version
