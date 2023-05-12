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
npm i -g @criticalmanufacturing/generator-iot@100x
```
> **Note** Starting from 7.2.0, each combination of Critical Manufacturing MES version (Major + Minor) will have a dedicated generator to make it easier to keep compatibility.
>
> For versions 7.2.0, 7.2.1, 7.2.2, ..., 7.2.\*, use the tag `72x` (`npm i -g @criticalmanufacturing/generator-iot@72x`)
>
> For versions 8.0.0, 8.0.1, 8.0.2, ..., 8.0.\*, use the tag `80x` (`npm i -g @criticalmanufacturing/generator-iot@80x`)

# Apps

To see at any time, the list of available apps, open a terminal window and run:
```
yo @criticalmanufacturing/iot
```

There are different types of questions that will be displayed interactively. Some will request for a simple text, others a confirmation (Yes or No), a selection of one option out of many or event a multiple choice.

For both multiple and single choice, use the cursor (Up/Down) to move between the choices and use the Space bar to select/unselect.

All questions are considered answered when the Enter key is pressed.

<!-- ## tasksPackage
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
The code generated is the skeleton on the converter (base structure), so you have to implement the logic before it is usable. -->

## driver
The driver is the implementation of a protocol.

This app creates an entire new package with all the code necessary to be used by `Connect IoT`. Of course, you still need to implement the entire logic.

In a terminal window with the path where the entire package directory will be created, run:
```
yo @criticalmanufacturing/iot:driver
```
Answer all questions and a new directory with the protocol driver will be available and ready for you to implement the communication logic.

<!-- ## fontgen

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
``` -->



## packagePacker

It is not desirable to have Internet services (NPM, GitHub, etc) as a dependency for the packages that would run on a production environment.

To bypass such dependency, we provide a tool that will pack all the package dependencies from a development environment into a ready-to-be-used package.

The steps this tool executes in background are somehow complicated, but, in a nutshell, it will statically analyze all the dependencies of the package and subsequent dependencies and merge everything into a single `index.js` file. Some other dependencies, like configurations, certificates, node addons (*.node) are also added into the resulting package, however, to keep everything in a clean state, some post-processing steps are needed and this tool supports them up to some extent.

In a terminal window run:

```
yo @criticalmanufacturing/iot:packagePacker --help
```

The following parameters can be supplied:

| **Parameter** | Type      | Default                  | Description                                                  |
| ------------- | --------- | ------------------------ | ------------------------------------------------------------ |
| i, input      | `String`  | `${cwd}`                 | Location of the package to pack (directory where the `package.json` is located) |
| o, output     | `String`  |                          | (optional) When defined, it is the directory where the `.tgz` package file will be placed |
| t, temp       | `String`  | `${cwd}\__TEMP__`        | Temporary directory where the processed files will be placed |
| c, config     | `String`  | `${cwd}\packConfig.json` | Location where the file with the post-processing instructions is located |
| a, addons     | `String`  |                          | Location where the binary addons (`\*.node`) are located. Required to prepare a package that is cross-platform, cross-architecture and supporting multiple Node versions.<br />**Note**: Due to the complexity of this option, the usage is not described in this documentation and requires some support from our company |
| d, debug      | `Boolean` | `false`                  | Activate the debug mode. This mode will not delete the temporary directory allowing the user to properly define the post-processing directives |
| v, version    | `String`  |                          | Flag that allows to override the version defined in the `package.json` into an user-defined value |

### Configuration file structure

The configuration is a .json file that identifies the type of package and declare post-packing actions to perform to organize, clean and possibly, fix some issues with the result structure.

```json
{
    "type": "<Package Type>",
    "postActions": [
        { "type": "<ActionType>", "parameter1": "value1", "parameter2": "value2", "...": "..." },
        { "type": "<ActionType>", "parameter1": "value1", "parameter2": "value2", "...": "..." }
    ]
}
```

Possible Package Types:

| Type           | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `TasksPackage` | Represents a package used to contain `Tasks` and `Converters`. The result package will be ready for runtime (no internet dependencies) and for design-time (all `.js`, `.html`, `.css`, etc) required by the GUI but not required for the runtime. |
| `Component`    | Represents a package that is only used for runtime (driver, etc) |

Possible Post Actions:

| Structure                                                    | Description                                                  | Example                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `DeleteFile`(`source`)                                       | Deletes the file `source`                                    | ```{ "type": "DeleteFile", "source": "${Temp}/completion.sh.hbs" }``` |
| `DeleteDirectory`(`source`)                                  | Deletes the directory `source`                               | ```{ "type": "DeleteDirectory", "source": "${Temp}/locales" }``` |
| `CopyDirectory`(`source`, `destination`)                     | Copies the entire directory structure from `source` into `destination` | ```{ "type": "CopyDirectory", "source": "font", "destination": "${Temp}/font" }``` |
| `CopyFile`(`file`, `source`, `destination`)                  | Copy the file `file` located in the directory `source` into the directory `destination` | ```{ "type": "CopyFile", "source": "${Source}/certificates/default.pem", "destination": "${Temp}/examples" }``` |
| `MoveFile`(`file`, `source`, `destination`)                  | Moves the file `file` located in the directory `source` into the directory `destination` | ```{ "type": "MoveFile", "file": "client_selfsigned_cert_2048.pem", "source": "${Temp}", "destination": "${Temp}/certificates" }`` |
| `ReplaceText`(`source`, `search`, `replace`, `isRegularExpression`) | In the file `source`, tried to find all occurrences of `search` and replaces them with `replace`. If `isRegularExpression` the search is expected to be a valid regular expression.<br />*Note: Make sure the `replaced` value is not captured again by the `search` value, otherwise, the process will enter into an infinite loop.* | ```{ "type": "ReplaceText", "source": "${Temp}/index.js", "search":"\"client_selfsigned_cert_2048.pem\"", "replace": "\"/../certificates/client_selfsigned_cert_2048.pem\"" }```<br />`{ "type": "ReplaceText", "source": "${Temp}/index.js", "search":"__webpack_require__\\(\\d*\\)\\('HID-hidraw.node'\\)", "replace": "require(__webpack_require__.ab + \"/../lib/hid-hidraw.node\")", "isRegularExpression": true }` |

Some tokens can be used in the Post Actions to be replaced according to the environment/command line arguments:

| Token            | Description                                   |
| ---------------- | --------------------------------------------- |
| `${Source}`      | Source location (argument `i`, `input`)       |
| `${Destination}` | Destination location (argument `o`, `output`) |
| `${Temp}`        | Temporary location (argument `t`, `temp`)     |
| `${Addons}`      | Addons location (argument `a`, `addons`)      |

# Development tips

If you are extending this package, it is easier to have it linked locally. Run the following command from the root directory of the package:
`npm link`

<!-- C:\Users\jpsantos\AppData\Roaming\npm\node_modules\@criticalmanufacturing\generator-iot -> N:\COMMON\EI\Business\Scaffolding\generator-iot -->

# Version History
History is maintained in the Github page

https://github.com/criticalmanufacturing/generator-iot/releases

