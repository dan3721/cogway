import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
// import _ from 'lodash'

const TICK_MILLIS = 80
const DIMENSION_BLOCK = 10
// const DIMENSION_GRID_X = 120
// const DIMENSION_GRID_Y = 68
const DIMENSION_GRID_X = Math.round(window.innerWidth / DIMENSION_BLOCK) - 5
const DIMENSION_GRID_Y = Math.round(window.innerHeight / DIMENSION_BLOCK) - 10

const styleCellAlive = {
  fill: 'red',
  // stroke: 'white',
  // 'stroke width': 5,
  // opacity: 0.5
}

const styleCellDead = {
  fill: 'black  ',
  // stroke: 'white',
  // 'stroke width': 5,
  // opacity: 0.5
}

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      numGenerations: 0,
      grid: this.randomGrid()
    }
    this.handleTick = this.handleTick.bind(this)
    this.handleStart = this.handleStart.bind(this)
    this.handleStop = this.handleStop.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.handleRandomGrid = this.handleRandomGrid.bind(this)
    this.handleBlankGrid = this.handleBlankGrid.bind(this)
  }

  newGrid() {
    return Array(DIMENSION_GRID_X).fill(0).map(x => Array(DIMENSION_GRID_Y).fill(0))
  }

  randomGrid() {
    let grid = this.newGrid()
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        grid[i][j] = Math.random() >= 0.5
          ? 1
          : 0
      }
    }
    return grid
  }

  handleBlankGrid() {
    this.setState({grid: this.blankGrid()})
  }

  blankGrid() {
    this.stop()
    return this.newGrid();
  }

  handleRandomGrid() {
    this.stop()
    this.setState({grid: this.randomGrid()})
  }

  handleTick() {
    this.tick()
  }

  handleStart() {
    if (this.state.interval === undefined) {
      let interval = setInterval(() => this.tick(), TICK_MILLIS);
      this.setState({interval: interval})
      console.log('*** STARTED GENERATION ***')
    }
  }

  handleStop() {
    this.stop()
  }

  stop() {
    if (this.state.interval !== undefined) {
      clearInterval(this.state.interval)
      this.setState({numGenerations: 0, interval: undefined})
      console.log('*** STOPPED GENERATION ***')
    }
  }

  handleToggle(e) {
    let attrs = e.target.attributes
    let x = attrs.getNamedItem('data-x').value
    let y = attrs.getNamedItem('data-y').value
    this.toggle(x, y)
  }

  toggle(x, y) {
    let grid = this.state.grid;
    let cellState = grid[x][y]
    grid[x][y] = cellState === 0
      ? 1
      : 0
    this.setState({grid: grid})
  }

  /**
  * Returns a count of the live neighbours where point p is defined by x,y
  *
  * Checks North West, West, South West, North, skipps it's self, South,
  * North East, East, and finally South East.
  *
  * nw n ne
  * w  p e
  * sw s se
  *
  * Routine is aware of the grid boundry and will not examin cells outside; so
  * it will not fail for edge cases.
  */
  liveNeighbours(x, y) {
    let grid = this.state.grid
    let dimension = grid.length
    let count = 0
    for (var i = x - 1; i < x + 2; i++) {
      for (var j = y - 1; j < y + 2; j++) {
        if ((i > -1 && j > -1) && !(i === x && j === y) && i < dimension && j < dimension) {
          count += grid[i][j]
        }
      }
    }
    return count
  }

  tick() {

    let grid = this.state.grid
    var nextGrid = this.newGrid();

    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid.length; j++) {

        let alive = grid[i][j] === 1
        let numNeighbors = this.liveNeighbours(i, j);

        // 1. Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
        if (alive && numNeighbors < 2) {
          nextGrid[i][j] = 0
          // console.log('rule 1')
        }

        // 2. Any live cell with two or three live neighbours lives on to the next generation.
        if (alive && (numNeighbors === 2 || numNeighbors === 3)) {
          nextGrid[i][j] = 1
          // console.log('rule 2')
        }

        // 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
        if (alive && numNeighbors > 3) {
          nextGrid[i][j] = 0
          // console.log('rule 3')
        }

        // 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if (!alive && numNeighbors === 3) {
          nextGrid[i][j] = 1
          // console.log('rule 4')
        }

      }

    }

    this.setState({
      numGenerations: this.state.numGenerations + 1,
      grid: nextGrid
    })
  }

  render() {

    let grid = this.state.grid

    let cells = new Array()
    for (var i = 0; i < DIMENSION_GRID_X; i++) {
      for (var j = 0; j < DIMENSION_GRID_Y; j++) {
        let alive = grid[i][j] === 1
        cells.push(<rect width={DIMENSION_BLOCK} data-x={i} data-y={j} key={i + '-' + j} x={i * DIMENSION_BLOCK} y={j * DIMENSION_BLOCK} height={DIMENSION_BLOCK} style={alive
          ? styleCellAlive
          : styleCellDead} onClick={this.handleToggle}/>)
      }
    }

    return (
      <div>
        <div>
          <button onClick={this.handleBlankGrid}>Blank</button>
          <button onClick={this.handleRandomGrid}>Random</button>
          <button onClick={this.handleTick}>Tick</button>
          <button onClick={this.handleStart}>Start</button>
          <button onClick={this.handleStop}>Stop</button>
          <span># generations: {this.state.numGenerations}</span>
        </div>
        <div style={{
          padding: '30px'
        }}>
          <svg width={DIMENSION_GRID_X * DIMENSION_BLOCK} height={DIMENSION_GRID_Y * DIMENSION_BLOCK}>
            {cells}
          </svg>
        </div>
      </div>
    );
  }
}

export default App;
