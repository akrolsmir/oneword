import streamlit as st
from google.cloud import firestore

import pandas as pd
import datetime

# TODO: Show a nice st.error when key is missing
db = firestore.Client.from_service_account_json("firestore-account-key.json")


global rounds_without_clues
global rounds_without_guesses
global total_rounds
rounds_without_clues = 0
rounds_without_guesses = 0
total_rounds = 0


@st.cache
def list_rooms(number_of_rooms):
    def doc_to_room(doc):
        room = doc.to_dict()
        room["id"] = doc.id
        return room

    rooms_ref = (
        db.collection("rooms")
            .order_by("lastUpdateTime", direction="DESCENDING")
            .limit(number_of_rooms)
    )
    return [doc_to_room(doc) for doc in rooms_ref.stream()]


def room_to_df(room):
    return [room["id"],
            len(room["history"]),
            len(room["players"]),  # Should dig in history for ALL players
            datetime.datetime.fromtimestamp(room["lastUpdateTime"] / 1000), ]


def room_to_history_list(room):
    global rounds_without_clues, rounds_without_guesses, total_rounds
    history_list = []
    for history in room["history"]:
        total_rounds += 1

        clues_list = list(history["clues"].values())
        user_guess = history["guess"]

        if len(clues_list) == 0:
            rounds_without_clues += 1
            if should_filter_rounds_without_clues:
                continue
        if user_guess == "":
            rounds_without_guesses += 1
            if should_filter_rounds_without_guesses:
                continue

        history_list.append([
            history["category"],
            history["word"].lower(),
            clues_list,
            user_guess.lower(),
            history["guess"] == history["word"]
        ])
    return history_list


def round_to_clue_list(input_round):
    clue_list = []
    for c in input_round[2]:
        clue_list.append([
            str(c),  # Hack because Austin doesn't sanitize inputs
            input_round[0],
            input_round[1],
            input_round[3],
            input_round[4]
        ])
    return clue_list


st.title("Simple analytics for One Word")
st.header("Options")
should_filter_empty_room = st.checkbox("Filter rooms without games")
should_filter_rounds_without_clues = st.checkbox("Filter rounds without clues")
should_filter_rounds_without_guesses = st.checkbox("Filter rounds without guesses")
num_rooms = st.slider("Number of rooms to query", min_value=1, max_value=2000, value=1000)
raw_rooms = list_rooms(num_rooms)
nonempty_rooms = [room for room in raw_rooms if len(room["history"]) > 0]
filtered_rooms = nonempty_rooms if should_filter_empty_room else raw_rooms

room_id, num_rounds, num_players, date = "id", "number of rounds", "number of players", "date of game"
df = pd.DataFrame([room_to_df(room) for room in filtered_rooms], columns=[room_id, num_rounds, num_players, date])

st.header("Analysis By Games")
st.subheader("Raw Data")
st.write("Rooms excluded: " + str(len(raw_rooms) - len(nonempty_rooms)))
st.write("Empty room percentage: " + str(len(nonempty_rooms) / (len(raw_rooms) * 1.0)))
st.write(df)

st.subheader("Daily Breakdown")
df_daily = df.set_index(date).groupby(pd.Grouper(freq="D")).agg(
    total_games=(room_id, "count"),
    average_rounds_per_game=(num_rounds, "mean"),
    mean_players_per_game=(num_players, "mean"),
)
st.write(df_daily)
st.line_chart(df_daily)

st.subheader("Monthly Breakdown")
df_monthly = df.set_index(date).groupby(pd.Grouper(freq="M")).agg(
    total_games=(room_id, "count"),
    average_rounds_per_game=(num_rounds, "mean"),
    mean_players_per_game=(num_players, "mean"),
)
st.write(df_monthly)
st.line_chart(df_monthly)

rounds = []
for room in filtered_rooms:
    rounds += room_to_history_list(room)

category, word, clues, guess, success = "category", "word", "clues", "guess", "success"
rounds_df = pd.DataFrame(rounds, columns=[category, word, clues, guess, success])

st.header("Analysis By Rounds")
st.subheader("Raw Data")
st.write("Rounds excluded without clues: " + str(rounds_without_clues))
st.write("Rounds excluded without guesses: " + str(rounds_without_guesses))
st.write("Rounds without clues percentage: " + str(rounds_without_clues / (total_rounds * 1.0)))
st.write("Rounds without guesses percentage: " + str(rounds_without_guesses / (total_rounds * 1.0)))

st.write(rounds_df)

st.subheader("By Category")
category_df = rounds_df.set_index(category).groupby(category).agg(
    rounds_played=(success, "count"),
    success_rate=(success, "mean"),
)
st.write(category_df)

st.subheader("By Word")
min_rounds_played = st.slider("Minimum Rounds Played", min_value=1, max_value=100)
min_success_rate_word = st.slider("Minimum Success Rate (Word)", min_value=0.0, max_value=1.0, step=0.01)
word_df = rounds_df.set_index(word).groupby(word).agg(
    rounds_played=(success, "count"),
    success_rate=(success, "mean"),
)
word_df = word_df[word_df["rounds_played"] >= min_rounds_played]
word_df = word_df[word_df["success_rate"] >= min_success_rate_word]
st.write(word_df)

clues = []
for r in rounds:
    clues += round_to_clue_list(r)

st.subheader("By Clue")
min_times_clued = st.slider("Minimum Times Clued", min_value=1, max_value=100)
min_success_rate_clue = st.slider("Minimum Success Rate (Clue)", min_value=0.0, max_value=1.0, step=0.01)
clue = "clue"
clues_df = pd.DataFrame(clues, columns=[clue, category, word, guess, success])
st.write(clues_df)
clues_df_agg = clues_df.set_index(clue).groupby(clue).agg(
    times_clued=(success, "count"),
    success_rate=(success, "mean"),
    most_common_word=(word, lambda x: x.value_counts().index[0]),
    most_common_guess=(guess, lambda x: x.value_counts().index[0]),
    most_common_category=(category, lambda x: x.value_counts().index[0])
)
clues_df_agg = clues_df_agg[clues_df_agg["times_clued"] >= min_times_clued]
clues_df_agg = clues_df_agg[clues_df_agg["success_rate"] >= min_success_rate_clue]
st.write(clues_df_agg)

# Questions to answer:
# How many rounds/games are played daily/weekly/monthly?
# Which words are easist? Hardest?
# Which words are commonly clued?
