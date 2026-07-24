import { useEffect, useState } from 'react'
import { calculateWinner, getBestComputerMove } from './gameLogic'
import './App.css'

const EMPTY_BOARD = Array(9).fill(null)

function Square({ value, onClick, isWinning, disabled }) {
  return (
    <button
      type="button"
      className={`square${value ? ` square-${value.toLowerCase()}` : ''}${isWinning ? ' winning' : ''}`}
      onClick={onClick}
      disabled={disabled || Boolean(value)}
      aria-label={value ? `Cell marked ${value}` : 'Empty cell'}
    >
      {value && <span className="mark">{value}</span>}
    </button>
  )
}

function ModeSelect({ onSelect }) {
  return (
    <div className="mode-select">
      <p className="brand">Tic Tac Toe</p>
      <h1>Choose how to play</h1>
      <p className="subtitle">Pick a mode and claim three in a row.</p>
      <div className="mode-actions">
        <button type="button" className="mode-btn" onClick={() => onSelect('cpu')}>
          <span className="mode-label">Human vs Computer</span>
          <span className="mode-hint">You are X · Computer is O</span>
        </button>
        <button type="button" className="mode-btn" onClick={() => onSelect('pvp')}>
          <span className="mode-label">Human vs Human</span>
          <span className="mode-hint">Pass &amp; play on one device</span>
        </button>
      </div>
    </div>
  )
}

function NameForm({ onStart, onBack }) {
  const [playerX, setPlayerX] = useState('')
  const [playerO, setPlayerO] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const nameX = playerX.trim() || 'Player X'
    const nameO = playerO.trim() || 'Player O'
    onStart({ X: nameX, O: nameO })
  }

  return (
    <form className="name-form" onSubmit={handleSubmit}>
      <p className="brand">Tic Tac Toe</p>
      <h1>Enter player names</h1>
      <p className="subtitle">Both players take turns on this device.</p>

      <label className="name-field">
        <span>Player X</span>
        <input
          type="text"
          value={playerX}
          onChange={(e) => setPlayerX(e.target.value)}
          placeholder="Enter name"
          maxLength={20}
          autoFocus
        />
      </label>

      <label className="name-field">
        <span>Player O</span>
        <input
          type="text"
          value={playerO}
          onChange={(e) => setPlayerO(e.target.value)}
          placeholder="Enter name"
          maxLength={20}
        />
      </label>

      <div className="controls">
        <button type="submit" className="btn primary">
          Start game
        </button>
        <button type="button" className="btn ghost" onClick={onBack}>
          Back
        </button>
      </div>
    </form>
  )
}

function WinnerBanner({ name, onPlayAgain, onChangeMode }) {
  return (
    <div className="winner-overlay" role="dialog" aria-labelledby="winner-title">
      <div className="winner-card">
        <img src="/trophy.svg" alt="Trophy" className="trophy" />
        <p className="winner-eyebrow">Winner</p>
        <h2 id="winner-title" className="winner-name">{name}</h2>
        <p className="winner-message">takes the trophy!</p>
        <div className="controls">
          <button type="button" className="btn primary" onClick={onPlayAgain}>
            Play again
          </button>
          <button type="button" className="btn ghost" onClick={onChangeMode}>
            Change mode
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [mode, setMode] = useState(null)
  const [screen, setScreen] = useState('mode')
  const [names, setNames] = useState({ X: 'Player X', O: 'Player O' })
  const [squares, setSquares] = useState(EMPTY_BOARD)
  const [xIsNext, setXIsNext] = useState(true)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const [thinking, setThinking] = useState(false)

  const { winner, line } = calculateWinner(squares)
  const gameOver = Boolean(winner)
  const isCpuTurn = mode === 'cpu' && !xIsNext && !gameOver
  const showWinnerBanner = mode === 'pvp' && winner && winner !== 'draw'
  const winnerName = winner === 'X' || winner === 'O' ? names[winner] : ''

  function recordResult(board) {
    const { winner: result } = calculateWinner(board)
    if (!result) return
    setScores((prev) => {
      if (result === 'draw') return { ...prev, draws: prev.draws + 1 }
      return { ...prev, [result]: prev[result] + 1 }
    })
  }

  useEffect(() => {
    if (!isCpuTurn) return undefined

    setThinking(true)
    const timer = setTimeout(() => {
      let nextBoard = null
      setSquares((current) => {
        const next = [...current]
        const move = getBestComputerMove(next)
        if (move < 0) return current
        next[move] = 'O'
        nextBoard = next
        return next
      })
      if (nextBoard) recordResult(nextBoard)
      setXIsNext(true)
      setThinking(false)
    }, 450)

    return () => clearTimeout(timer)
  }, [isCpuTurn])

  function handleSelectMode(selectedMode) {
    setMode(selectedMode)
    if (selectedMode === 'pvp') {
      setScreen('names')
    } else {
      setNames({ X: 'You', O: 'Computer' })
      setScreen('game')
    }
  }

  function handleStartPvP(playerNames) {
    setNames(playerNames)
    setScreen('game')
  }

  function handleClick(index) {
    if (gameOver || squares[index] || thinking || isCpuTurn) return

    const next = [...squares]
    next[index] = xIsNext ? 'X' : 'O'
    setSquares(next)
    setXIsNext(!xIsNext)
    recordResult(next)
  }

  function resetBoard() {
    setSquares(EMPTY_BOARD)
    setXIsNext(true)
    setThinking(false)
  }

  function changeMode() {
    resetBoard()
    setScores({ X: 0, O: 0, draws: 0 })
    setMode(null)
    setNames({ X: 'Player X', O: 'Player O' })
    setScreen('mode')
  }

  function statusText() {
    if (winner === 'draw') return "It's a draw!"
    if (winner) {
      if (mode === 'cpu') {
        return winner === 'X' ? 'You win!' : 'Computer wins!'
      }
      return `${names[winner]} wins!`
    }
    if (mode === 'cpu') {
      return thinking ? 'Computer is thinking…' : 'Your turn (X)'
    }
    return `${names[xIsNext ? 'X' : 'O']}'s turn`
  }

  if (screen === 'mode') {
    return (
      <div className="app">
        <div className="atmosphere" aria-hidden="true" />
        <ModeSelect onSelect={handleSelectMode} />
      </div>
    )
  }

  if (screen === 'names') {
    return (
      <div className="app">
        <div className="atmosphere" aria-hidden="true" />
        <NameForm onStart={handleStartPvP} onBack={changeMode} />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />
      <main className="game">
        <header className="game-header">
          <p className="brand">Tic Tac Toe</p>
          <p className="mode-tag">
            {mode === 'cpu' ? 'Human vs Computer' : 'Human vs Human'}
          </p>
        </header>

        <p className={`status${gameOver ? ' status-end' : ''}`} key={statusText()}>
          {statusText()}
        </p>

        <div className="scoreboard" aria-label="Score">
          <div className="score">
            <span className="score-label">{mode === 'cpu' ? 'You (X)' : names.X}</span>
            <span className="score-value">{scores.X}</span>
          </div>
          <div className="score">
            <span className="score-label">Draws</span>
            <span className="score-value">{scores.draws}</span>
          </div>
          <div className="score">
            <span className="score-label">{mode === 'cpu' ? 'CPU (O)' : names.O}</span>
            <span className="score-value">{scores.O}</span>
          </div>
        </div>

        <div className="board" role="grid" aria-label="Tic tac toe board">
          {squares.map((value, index) => (
            <Square
              key={index}
              value={value}
              onClick={() => handleClick(index)}
              isWinning={line?.includes(index)}
              disabled={gameOver || thinking || isCpuTurn}
            />
          ))}
        </div>

        <div className="controls">
          <button type="button" className="btn primary" onClick={resetBoard}>
            {gameOver ? 'Play again' : 'Reset board'}
          </button>
          <button type="button" className="btn ghost" onClick={changeMode}>
            Change mode
          </button>
        </div>
      </main>

      {showWinnerBanner && (
        <WinnerBanner
          name={winnerName}
          onPlayAgain={resetBoard}
          onChangeMode={changeMode}
        />
      )}
    </div>
  )
}

export default App
