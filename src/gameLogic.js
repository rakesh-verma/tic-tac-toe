export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function calculateWinner(squares) {
  for (const [a, b, c] of WIN_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] }
    }
  }
  if (squares.every(Boolean)) {
    return { winner: 'draw', line: null }
  }
  return { winner: null, line: null }
}

function minimax(squares, isMaximizing, aiPlayer, humanPlayer) {
  const { winner } = calculateWinner(squares)
  if (winner === aiPlayer) return 10
  if (winner === humanPlayer) return -10
  if (winner === 'draw') return 0

  if (isMaximizing) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = aiPlayer
        best = Math.max(best, minimax(squares, false, aiPlayer, humanPlayer))
        squares[i] = null
      }
    }
    return best
  }

  let best = Infinity
  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      squares[i] = humanPlayer
      best = Math.min(best, minimax(squares, true, aiPlayer, humanPlayer))
      squares[i] = null
    }
  }
  return best
}

export function getBestComputerMove(squares, aiPlayer = 'O', humanPlayer = 'X') {
  let bestScore = -Infinity
  let bestMove = -1

  for (let i = 0; i < 9; i++) {
    if (!squares[i]) {
      squares[i] = aiPlayer
      const score = minimax(squares, false, aiPlayer, humanPlayer)
      squares[i] = null
      if (score > bestScore) {
        bestScore = score
        bestMove = i
      }
    }
  }

  return bestMove
}
