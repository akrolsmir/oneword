<script>
import {
  setRoom,
  updateRoom,
  updateUserGame,
  referSupporter,
  getPeoplelessRooms,
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
  },
}
</script>
