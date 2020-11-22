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
        .limit(200)
    )
    return [doc_to_room(doc) for doc in rooms_ref.stream()]


def room_to_df(room):
    return pd.DataFrame(
        [
            [
                room["id"],
                len(room["history"]),
                len(room["players"]),  # Should dig in history for ALL players
                datetime.datetime.fromtimestamp(room["lastUpdateTime"] / 1000),
            ]
        ]
    )


room = list_rooms()[0]
df = room_to_df(room)
for room in list_rooms():
    df2 = room_to_df(room)
    df = df.append(df2)

st.write(df)


# Questions to answer:
# How many rounds/games are played daily/weekly/monthly?
# Which words are easist? Hardest?
# Which words are commonly clued?
