Connect IoT Yeoman Generator 
========= 

**generator-iot** is a set of scaffolding templates that enable CMF customization teams, partners and customers to easily start a new task, converter or protocol driver within `Critical Manufacturing MES` Equipment Integration module (Connect IoT).

Getting Started

Make sure `Yeoman` is also installed globally. If not:
```
npm i -g yo
```

To start using this generator, it is advisable to have it installed globally (-g setting in NPM).
```
npm i -g @criticalmanufacturing/generator-iot@80x
```
> **Note** Starting from 7.2.0, each combination of Critical Manufacturing MES version (Major + Minor) will have a dedicated generator to make it easier to keep compatibility.
>
> For versions 7.2.0, 7.2.1, 7.2.2, ..., 7.2.\*,  use the tag `72x`
> ```npm i -g @criticalmanufacturing/generator-iot@`72x``
>
> For versions 8.0.0, 8.0.1, 8.0.2, ..., 8.0.\*, use the tag `80x`
> `npm i -g @criticalmanufacturing/generator-iot@80x`

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
History is maintained in the Github page

https://github.com/criticalmanufacturing/generator-iot/releases

