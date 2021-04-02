<script>
import {
  setRoom,
  updateRoom,
  updateUserGame,
  referSupporter,
  getPeoplelessRooms,
  getServerLogMessages,
} from '../firebase/network'

export default {
  async setup() {
    const timeseries = {}
    const peoplelessRooms = await getPeoplelessRooms()
    console.log(peoplelessRooms.map((room) => new Date(room.lastUpdateTime)))
    // peopelessRooms.forEach(room => {
    //   const timeStampMod
    //   timeseries[]
    // })
    console.log('peopleless rooms ', peoplelessRooms)

    const serverLogMessages = await getServerLogMessages()
    const messagesArray = serverLogMessages.map((entry) => entry.message)
    const dupset = {}
    messagesArray.forEach((message) => {
      if (dupset[message]) {
        console.log('dup found: ' + message)
      } else {
        dupset[message] = 1
      }
    })
  },
}
</script>
