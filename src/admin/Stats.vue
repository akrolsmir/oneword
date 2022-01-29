<template>
  <h1>Game statz</h1>
  <!-- <div style="white-space: pre">
    {{ JSON.stringify(rows.slice(0, 10), null, 2) }}
  </div> -->
</template>

<script setup>
import * as unused from '../firebase/network'
import firebase from 'firebase/app'
import { ref } from 'vue'

// Download all games from the database
// Async components don't work well with vue-router :(
// listGames().then(alignItGamesToCsv)
listGames().then((games) => console.log(games.length))

function alignItGamesToCsv(games) {
  const rows = []
  games.forEach((game) => {
    const rounds = game.history || []
    rounds.forEach((round) => {
      // Row: [xAxis, yAxis, clue, votes]
      // Example row: ['Good-Evil', 'New-Old', 'Twitter', 'A, B, B']
      const row = [
        round.xAxis.join('-'),
        round.yAxis.join('-'),
        round.clue,
        (Object.values(round.votes) || []).join(', '),
      ]
      rows.push(row)
    })
  })

  // Print rows to a CSV file
  const csv = rows.map((row) => row.join(', ')).join('\n')
  console.log('csv')
  console.log(csv)
}

async function listGames() {
  const db = firebase.firestore()
  // Find all games with lastUpdateTime > 1630806223 aka Nov 5th
  console.log('start logging')
  const response = await db
    .collection('alignit')
    .where('lastUpdateTime', '>', 1630806223000)
    .get()
  console.log('done logging')
  return response.docs.map((doc) => doc.data())
}
</script>
