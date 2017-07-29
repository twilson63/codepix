import React from 'react'
import R from 'ramda'
import { withReducer, lifecycle } from 'recompose'

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
    <section className="animated fadeIn flex-column justify-between items-center">
      <header
        className="h3 flex items-center justify-center bg-light-purple white animated slideInDown"
        onClick={e => {
          props.dispatch({ type: 'TOGGLE_GRID' })
        }}
      >
        <h1 className="tracked ttu avenir">Pixel Fun</h1>
      </header>
      <section>
        <p className="tc">Output</p>
        <div className="measure center ba br2 pa2 ma2 w-100">
          <pre>{props.app.output}</pre>
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
      <footer className="flex items-center justify-center pv2">
        <div className="ml2 animated slideInUp flex justify-between bg-light-gray pa4 br3">
          <input
            value={props.app.input}
            onChange={e =>
              props.dispatch({
                type: 'SET_INPUT',
                payload: e.target.value
              })}
            className="input-reset pa1 ba pv1 br1 mh2 db mb2"
          />
          <div>
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

      </footer>
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
      board: boardReducer(state.board || defaultBoard, action),
      input: inputReducer(state.input || '', action),
      clicks: clicksReducer(
        state.clicks || { a: () => console.log('args') },
        action
      ),
      output: outputReducer(
        state.output || 'Welcome to Pixel Programming!',
        action
      ),
      gridIsVisible: gridVisibleReducer(state.gridIsVisible || true, action)
    }
  }),
  lifecycle({
    componentDidMount() {
      const props = this.props
      props.actions({
        setPixel: (row, col, color) =>
          props.dispatch({
            type: 'SET_CELL_COLOR',
            payload: { row, col, color }
          }),
        getPixel: (row, col) =>
          compose(nth(col), nth(row), prop('board'))(props.app),
        getInput: () => props.app.input,
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
