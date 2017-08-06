import React from 'react'
import R from 'ramda'
import { withReducer, lifecycle } from 'recompose'
import { TextField } from 't63'

const SIZE = 20

const {
  set,
  lensProp,
  map,
  nth,
  merge,
  zipObj,
  times,
  propOr,
  cond,
  find,
  propEq,
  compose,
  T,
  always,
  and,
  equals,
  ifElse,
  identity,
  prop
} = R

const Component = props => {
  const handleClick = name => {
    props.app.clicks[name]()
  }
  return (
    <section className="flex-column justify-start items-center">
      <header
        className="h3 flex items-center justify-center bg-light-purple white"
        onClick={e => {
          props.dispatch({ type: 'TOGGLE_GRID' })
        }}
      >
        <h1 className="tracked ttu avenir">{props.app.title}</h1>
      </header>
      <section>
        <div className="flex items-center justify-center">
          <div className="ml2 flex justify-between bg-light-gray pa2 br3 mt2">
            <TextField
              name={props.app.label}
              helpTxt={props.app.help}
              value={props.app.input}
              onChange={e =>
                props.dispatch({
                  type: 'SET_INPUT',
                  payload: e.target.value
                })}
              className="input-reset pa1 ba pv1 br1 mh2 db mb2"
            />
            <div className="pa4">
              <button
                onClick={e => handleClick('a')}
                className="bg-gray ba br-100 ph2 pv1 mh2 white"
              >
                a
              </button>
              <button
                onClick={e => handleClick('b')}
                className="bg-gray ba br-100 ph2 pv1 mh2 white"
              >
                b
              </button>
            </div>
          </div>
          <div className="ba br2 ph2 ma2 bg-black-80 white">
            {props.app.output && <pre><code>{props.app.output}</code></pre>}
          </div>
        </div>

        {props.app.gridIsVisible &&
          <main className="flex items-center justify-center">
            <div className="pv2">
              {map(
                row =>
                  <div className="cf">
                    {map(
                      cell =>
                        <div
                          className="fl w1 h1 w2-ns h2-ns ba b--dotted animated zoomIn"
                          style={{ backgroundColor: cell.color }}
                        />,
                      row
                    )}
                  </div>,
                propOr([], 'board', props.app)
              )}
            </div>
          </main>}
      </section>
      <footer className="flex items-center justify-center pv2" />
    </section>
  )
}

const defaultBoard = times(
  row => times(col => ({ row, col, color: 'white' }), SIZE),
  SIZE
)

const isMatch = a => b => and(equals(a.row, b.row), equals(a.col, b.col))

const typeIs = propEq('type')

const enhance = compose(
  withReducer('app', 'dispatch', (state = {}, action) => {
    return {
      title: titleReducer(state.title || 'Pixel Fun', action),
      help: helpReducer(state.help || '', action),
      label: labelReducer(state.label || 'Input', action),
      board: boardReducer(state.board || defaultBoard, action),
      input: inputReducer(state.input || '', action),
      clicks: clicksReducer(
        state.clicks || { a: () => console.log('args') },
        action
      ),
      output: outputReducer(state.output || null, action),
      gridIsVisible: gridVisibleReducer(state.gridIsVisible || true, action)
    }
  }),
  lifecycle({
    componentDidMount() {
      const props = this.props
      props.actions({
        title: payload => props.dispatch({ type: 'SET_TITLE', payload }),
        label: payload => props.dispatch({ type: 'SET_LABEL', payload }),
        help: payload => props.dispatch({ type: 'SET_HELP', payload }),
        setPixel: (row, col, color) =>
          props.dispatch({
            type: 'SET_CELL_COLOR',
            payload: { row, col, color }
          }),
        getPixel: (row, col) =>
          compose(nth(col), nth(row), prop('board'))(props.app),
        getInput: () => document.body.querySelector('input').value,
        setInput: v => props.dispatch({ type: 'SET_INPUT', payload: v }),
        onClick: (name, fn) => {
          props.dispatch({
            type: 'SET_CLICK',
            payload: { name, fn }
          })
        },
        output: v =>
          props.dispatch({
            type: 'SET_OUTPUT',
            payload: v
          }),
        clear: () => props.dispatch({ type: 'CLEAR' })
      })
    }
  })
)

export default enhance(Component)

// reducers

function outputReducer(state, action) {
  return cond([[typeIs('SET_OUTPUT'), prop('payload')], [T, always(state)]])(
    action
  )
}

function clicksReducer(state, action) {
  return cond([
    [
      typeIs('SET_CLICK'),
      compose(
        merge(state),
        ({ name, fn }) => zipObj([name], [fn]),
        prop('payload')
      )
    ],
    [T, always(state)]
  ])(action)
}

function inputReducer(state, action) {
  return cond([[typeIs('SET_INPUT'), prop('payload')], [T, always(state)]])(
    action
  )
}

function boardReducer(state = [], action) {
  const update = cell =>
    map(map(ifElse(isMatch(cell), always(cell), identity)), state)

  return cond([
    [typeIs('SET_CELL_COLOR'), compose(update, prop('payload'))],
    [typeIs('CLEAR'), always(map(map(set(lensProp('color'), 'white')), state))],
    [T, always(state)]
  ])(action)
}

function gridVisibleReducer(state = false, action) {
  return cond([[typeIs('TOGGLE_GRID'), always(!state)], [T, always(state)]])(
    action
  )
}

function titleReducer(state = '', action) {
  return cond([[typeIs('SET_TITLE'), prop('payload')], [T, always(state)]])(
    action
  )
}

function labelReducer(state = '', action) {
  return cond([
    [propEq('type', 'SET_LABEL'), prop('payload')],
    [T, always(state)]
  ])(action)
}

function helpReducer(state = '', action) {
  return cond([
    [propEq('type', 'SET_HELP'), prop('payload')],
    [T, always(state)]
  ])(action)
}
