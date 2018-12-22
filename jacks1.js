const canvas = document.getElementById('canvas')
fetch('file:///home/amiani/rl/jacksrentalstates.json')
  .then(res => res.json())
  .then(states => {
    const ctx = canvas.getContext('2d')
    const colors = ['#e5003c', '#ce1a40', '#b73544', '#a14f49', '#8a6a4d', 'black', '#748451', '#5d9f56', '#47b95a', '#30d45e', '#1aef63']
    for (let carsOne = 0; carsOne <= 20; carsOne++) {
      for (let carsTwo = 0; carsTwo <= 20; carsTwo++) {
        ctx.fillStyle = colors[states[carsOne][carsTwo][1]+5]
        ctx.fillRect(carsTwo*25, 475-carsOne*25, 25, 25)
      }
    }
  })
