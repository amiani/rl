const fs = require('fs')

const GAMMA = .9
const EXPREQONE = 3
const EXPREQTWO = 4
const EXPRETONE = 3
const EXPRETTWO = 2

const factorial = n => {
  if (n == 0 || n == 1) return 1
  return factorial(n-1)*n
}

const poissonMemo = [[],[],[],[]]
const poisson = (n, lambda) => {
  if (poissonMemo[lambda-2][n] > 0) return poissonMemo[lambda-2][n]
  return poissonMemo[lambda-2][n] = ((Math.pow(lambda, n)*Math.exp(-lambda))/factorial(n))
}

//first index is value, second is action
const states = []
for (let i = 0; i <= 20; i++) {
  states[i] = []
  for (let j = 0; j <= 20; j++) {
    states[i][j] = [0, 0]
  }
}

const expectedReturn = (carsOne, carsTwo, action) => {
  let G = 0
  const carsOneTransferred = Math.min(carsOne - action, 20)
  const carsTwoTransferred = Math.min(carsTwo + action, 20)
  //sum(p(sprime, r | s, pi(s)[r + gamma*V(sprime)])
  for (let carsOneNext = 0; carsOneNext <= 20; carsOneNext++) {
    for (let carsTwoNext = 0; carsTwoNext <= 20; carsTwoNext++) {
      //don't know the reward probabilities until after this loop because there are multiple ways to get each reward
      const rewardProbs = Array(42).fill(0)
      for (let carsOneReq = 0; carsOneReq <= carsOneTransferred; carsOneReq++) {
        for (let carsTwoReq = 0; carsTwoReq <= carsTwoTransferred; carsTwoReq++) {
          if (carsOneNext > (carsOneTransferred - carsOneReq) && carsTwoNext > (carsTwoTransferred - carsTwoReq)) {
            rewardProbs[carsOneReq+carsTwoReq] += 
              poisson(carsOneNext - (carsOneTransferred - carsOneReq), EXPRETONE) *
              poisson(carsOneReq, EXPREQONE) *
              poisson(carsTwoNext - (carsTwoTransferred - carsTwoReq), EXPRETTWO) *
              poisson(carsTwoReq, EXPREQTWO)
          }
        }
      }
      //add prob * value to total value of state
      for (let i = 0; i != rewardProbs.length; i++) {
        G += rewardProbs[i]*(i*10 + GAMMA*states[carsOneNext][carsTwoNext][0])
      }
    }
  }
  return G
}

let policyStable
const THETA = .01
do {
  //policy evaluation
  console.log('evaluating')
  let delta
  do {
    delta = 0
    for (let carsOne = 0; carsOne <= 20; carsOne++) {
      for (let carsTwo = 0; carsTwo <= 20; carsTwo++) {
        const prevValue = states[carsOne][carsTwo][0]
        const newValue = expectedReturn(carsOne, carsTwo, states[carsOne][carsTwo][1])
        states[carsOne][carsTwo][0] = newValue
        delta = Math.max(delta, Math.abs(prevValue - newValue))
      }
    }
  } while (delta >= THETA)

  //policy improvement
  console.log('improving')
  policyStable = true
  for (let carsOne = 0; carsOne <= 20; carsOne++) {
    for (let carsTwo = 0; carsTwo <= 20; carsTwo++) {
      const oldAction = states[carsOne][carsTwo][1]
      let bestAction = 0
      let bestActionValue = 0
      for (let action = -Math.min(5, carsTwo), maxAction = Math.min(5, carsOne); action <= maxAction; action++) {
        const actionValue = expectedReturn(carsOne, carsTwo, action)
        if (actionValue > bestActionValue) {
          bestAction = action
          bestActionValue = actionValue
        }
      }
      states[carsOne][carsTwo][1] = bestAction
      if (oldAction !== bestAction) {
        policyStable = false
      }
    }
  }
} while (!policyStable)
const json = JSON.stringify(states)
fs.writeFile('jacksrentalstates.json', json, 'utf8', err => console.error(err))
