# codepix

A React Component of a programable pixel grid.

The primary purpose of this project is to build small showcase applications to practice learning to code.

## Usage

``` js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'

ReactDOM.render(<App actions={setActions} />, document.getElementById('app'))

function setActions (actions) {
  Object.keys(actions).map(k => window[k] = actions[k])
  window.workspace()
}
```

This will give the user access via the console or a separate js file to the following methods to control the pixel grid:

* setPixel(row, col, color) // sets a color of a cell
* getPixel(row, col) // returns the color of a cell
* setInput('value') // sets the value of the input box
* getInput() // gets the value of the input box
* onClick('a or b', fn) // handles a click event for one of the two buttons
* output('string') // sets output to the output region
* clear()

## License

MIT 
