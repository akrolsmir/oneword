export async function listUsersNewest(
  db: FirebaseFirestore.Firestore,
  limit = 100
) {
  const response = await db
    .collection('users')
    .orderBy('createTime', 'desc')
    .limit(100)
    .get()
  return response.docs.map((doc) => doc.data())
}

// @ts-ignore
export function usersToContacts(users) {
  // @ts-ignore
  return users.map((user) => {
    const onewordGames = countGames(user, 'rooms')
    const [firstname, lastname] = splitName(user.name)
    return {
      Email: user.email,
      IsExcludedFromCampaigns: 'false',
      Name: user.name,
      Properties: {
        firstname,
        lastname,
        createddate: new Date(user.createTime).toISOString(),
        oneword_plays: onewordGames,
        supporter: user.supporter || '',
      },
    }
  })
}

// Copied from ../admin.html
function splitName(name: string) {
  // Austin Chen => Austin, Chen
  // Hillary => Hillary, Hillary
  // Barack Hussein Obama => Barack, Hussein Obama
  const index = name.indexOf(' ')
  if (index >= 0) {
    return [name.substring(0, index), name.substring(index + 1)]
  }
  return [name, name]
}

// @ts-ignore
function countGames(user, roomDb) {
  const gamesList = Object.values(user.games || {})
  // @ts-ignore
  return gamesList.filter((game) => game.roomDb === roomDb).length
}
