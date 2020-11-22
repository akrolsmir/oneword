import streamlit as st
from google.cloud import firestore

import pandas as pd
import datetime

# TODO: Show a nice st.error when key is missing
db = firestore.Client.from_service_account_json("firestore-account-key.json")


@st.cache
def list_rooms():
    def doc_to_room(doc):
        room = doc.to_dict()
        room["id"] = doc.id
        return room

    rooms_ref = (
        db.collection("rooms")
            .order_by("lastUpdateTime", direction="DESCENDING")
            .limit(50)
    )
    return [doc_to_room(doc) for doc in rooms_ref.stream()]


def essential_room_info(room):
    return [
        room["id"],
        len(room["history"]),
        len(room["playerData"]),  # Should dig in history for ALL players
        len(room["players"]),
                datetime.datetime.fromtimestamp(room["lastUpdateTime"] / 1000),
            ]



def filter_rooms(room):
    return len(room["history"]) > 0


all_rooms = list_rooms()
filtered_rooms = filter(filter_rooms, all_rooms)
all_rooms_df = pd.DataFrame([essential_room_info(room) for room in filtered_rooms])
all_rooms_df.columns = ["room_name", "num_rounds", "num_players_ever","players_end_of_day", "timestamp"]
st.write("mean number of rounds per room = " + str(all_rooms_df["num_rounds"].mean()))
st.write("median number of rounds per room = " + str(all_rooms_df["num_rounds"].median()))
st.write("mode number of rounds per room = " + str(all_rooms_df["num_rounds"].value_counts().idxmax()))
st.write(filtered_rooms)
st.write(all_rooms_df)
st.line_chart(all_rooms_df)
# st.area_chart(data)
# st.bar_chart(data)
# st.pyplot(fig)
# st.altair_chart(data)
# st.vega_lite_chart(data)
# st.plotly_chart(data)
# st.bokeh_chart(data)
# st.pydeck_chart(data)
# st.deck_gl_chart(data)
# st.graphviz_chart(data)
# st.map(data)

# Questions to answer:
# How many rounds/games are played daily/weekly/monthly?
# Which words are easist? Hardest?
# Which words are commonly clued?
