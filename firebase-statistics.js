/*
updates the statistics on word
primary_word = word players were trying to guess
guesses = guesses for that word
current firebase storage implementation:
statistics - one_word - guesses - (guess) - word_guessed - (word_guessed) {total:Int, non_collisions:Int, collisions:Int, gamesPlayed:Int}
                      - (word_guess) - (guess) {num_times:Int}
*/

// String of word, string of hint, bool for if word collided
function updateStatistics(word, hint, collided) {
  var wordDocRef = db.collection("statistics").doc("one_word").collection("guesses").doc(word)
  wordDocRef.get().then(function(doc) // get the doc for word
  {
    if (!doc || !doc.exists) //word was not used before! Create Doc first
    {
      wordDocRef.set()
    }

    var hintForWordDocRef = wordDocRef.collection("word_guessed").doc(guess) // go one level further

    hintForWordDocRef.get().then(function(innerDoc) // get the doc for hint for word
    {
      var collidedCount = (collided ? 1 : 0) //1 if collided, 0 if hint
      if (innerDoc && innerDoc.exists) // if the hint is not new for this word
      {
        const hintForWordData = innerDoc.data() //grab data of hint for word
        hintForWordDocRef.update({"total":hintForWordData.total + 1})
        hintForWordDocRef.update({"collided_total":hintForWordData.collided_total + collidedCount})
        hintForWordDocRef.update({"hint_total":hintForWordData.hint_total + 1 - collidedCount})
      }
      else //new guess for this word! Initialize values similar to above
      {
        hintForWordDocRef.set({
          "total":1,
          "collided_total":(collidedCount),
          "hint_total":(1 - collidedCount)
        })
      }
    }
    )

  }
  )
}
