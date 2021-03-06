import datetime
import json
import os.path
from time import time

import pandas as pd
import pytz
import streamlit as st
from google.cloud import firestore


class FirestoreHelper:
    def __init__(self):
        self.db = firestore.Client.from_service_account_json(
            "firestore-account-key.json"
        )

    @staticmethod
    def firebase_doc_to_room(doc):
        room = doc.to_dict()
        room["id"] = doc.id
        return room

    def fetch_earlier_rooms(self, number_to_fetch, time_boundary=int(time() * 1000)):
        ref = (
            self.db.collection("rooms")
            .order_by("lastUpdateTime", direction="DESCENDING")
            .where("lastUpdateTime", "<", time_boundary)
            .limit(number_to_fetch)
        )

        return [self.firebase_doc_to_room(doc) for doc in ref.stream()]

    def fetch_later_rooms(self, number_to_fetch, time_boundary=int(time() * 1000)):
        ref = (
            self.db.collection("rooms")
            .order_by("lastUpdateTime", direction="ASCENDING")
            .where("lastUpdateTime", ">", time_boundary)
            .limit(number_to_fetch)
        )

        return [self.firebase_doc_to_room(doc) for doc in ref.stream()]


class RoundHelper:
    def __init__(self):
        self.rounds_without_clues = 0
        self.rounds_without_guess = 0
        self.total_rounds = 0

    def room_to_rounds(self, room):
        rounds = []
        for history in room["history"]:
            self.total_rounds += 1

            word_category = history["category"]
            if exclude_custom_words and word_category == "custom":
                continue
            clues_list = list(history["clues"].values())
            user_guess = history["guess"]

            round = [
                word_category,
                history["word"].lower(),
                clues_list,
                user_guess.lower(),
                history["guess"] == history["word"],
                0,  # round without clues
                0,  # round without guess
            ]

            if len(clues_list) == 0:
                self.rounds_without_clues += 1
                round[5] = 1
            if user_guess == "":
                self.rounds_without_guess += 1
                round[6] = 1

            rounds.append(round)
        return rounds


firestore_helper = FirestoreHelper()
round_helper = RoundHelper()


def room_to_df(room):
    return [
        room["id"],
        len(room["history"]),
        len(room["players"]),  # Should dig in history for ALL players
        len(room["playerData"]) if "playerData" in room.keys() else 0,
        datetime.datetime.fromtimestamp(room["lastUpdateTime"] / 1000, tz=pytz.utc),
    ]


def round_to_clue_list(input_round):
    clue_list = []
    category, word, clues, guess, success, no_clue, no_guess = input_round
    for c in clues:
        clue_list.append(
            [
                str(c),  # Hack because Austin doesn't sanitize inputs
                category,
                word,
                guess,
                success,
            ]
        )
    return clue_list


st.set_page_config(layout="wide")

st.sidebar.header("Options")

st.sidebar.subheader("Room Options")
should_filter_empty_room = st.sidebar.checkbox("Filter rooms without games", value=True)

num_rooms = st.sidebar.number_input(
    "Number of rooms to query", min_value=1, max_value=5000, value=5000
)
# To ignore changes in git: `git update-index --assume-unchanged hashed_rooms.json`
# See https://stackoverflow.com/a/3320183/1222351
file_name = st.sidebar.text_input("File name for data", value="hashed_rooms") + ".json"
fetch_data_prev = st.sidebar.button("Fetch " + str(num_rooms) + " older rooms")
fetch_data_next = st.sidebar.button("Fetch " + str(num_rooms) + " newer rooms")

if os.path.isfile(file_name):
    with open(file_name, "r") as room_dump:
        raw_rooms = json.load(room_dump)
else:
    raw_rooms = firestore_helper.fetch_earlier_rooms(num_rooms)
    with open(file_name, "w") as room_dump:
        json.dump(raw_rooms, room_dump)
min_update_time = raw_rooms[-1]["lastUpdateTime"]
max_update_time = raw_rooms[0]["lastUpdateTime"]
min_update_date = datetime.datetime.fromtimestamp(
    min_update_time / 1000, tz=pytz.utc
).date()
max_update_date = datetime.datetime.fromtimestamp(
    max_update_time / 1000, tz=pytz.utc
).date()

start_date = st.sidebar.date_input(
    "Start date filter",
    min_value=min_update_date,
    max_value=max_update_date,
    value=min_update_date,
)
end_date = st.sidebar.date_input(
    "End date filter",
    min_value=start_date,
    max_value=max_update_date,
    value=max_update_date,
)

window = st.sidebar.radio("Group by Day/Week/Month", ["D", "W", "M"], index=1)

exclude_custom_words = st.sidebar.checkbox(
    "Filter out rounds with custom words", value=True
)

st.sidebar.subheader("Word Options")
enable_words = st.sidebar.checkbox("Enable Word Processing")
min_rounds_played = st.sidebar.number_input(
    "Minimum Rounds Played", min_value=1, max_value=100, value=10
)
min_success_rate_word = st.sidebar.number_input(
    "Minimum Success Rate (Word)", min_value=0.0, max_value=1.0, step=0.01
)
bad_word_success_rate = st.sidebar.number_input(
    "Bad word success rate threshold <",
    min_value=0.0,
    max_value=1.0,
    step=0.01,
    value=0.2,
)
bad_word_clue_rate = st.sidebar.number_input(
    "Bad word clue rate threshold >",
    min_value=0.0,
    max_value=1.0,
    step=0.01,
    value=0.15,
)
bad_word_guess_rate = st.sidebar.number_input(
    "Bad word guess rate threshold >",
    min_value=0.0,
    max_value=1.0,
    step=0.01,
    value=0.2,
)

st.sidebar.subheader("Clue Options")
enable_clues = st.sidebar.checkbox("Enable Clue Processing")
min_times_clued = st.sidebar.number_input(
    "Minimum Times Clued", min_value=1, max_value=100, value=10
)
min_success_rate_clue = st.sidebar.number_input(
    "Minimum Success Rate (Clue)", min_value=0.0, max_value=1.0, step=0.01
)

st.title("Simple analytics for One Word")

if fetch_data_prev:
    fetched_raw_rooms = firestore_helper.fetch_earlier_rooms(num_rooms, min_update_time)
    raw_rooms += fetched_raw_rooms
    with open(file_name, "w") as room_dump:
        json.dump(raw_rooms, room_dump)
elif fetch_data_next:
    fetch_raw_rooms = firestore_helper.fetch_later_rooms(num_rooms, max_update_time)
    raw_rooms = fetch_raw_rooms[::-1] + raw_rooms
    with open(file_name, "w") as room_dump:
        json.dump(raw_rooms, room_dump)

date_filtered_raw_rooms = [
    room
    for room in raw_rooms
    if start_date
    <= datetime.datetime.fromtimestamp(
        room["lastUpdateTime"] / 1000, tz=pytz.utc
    ).date()
    <= end_date + datetime.timedelta(days=1)
]
nonempty_rooms = [room for room in date_filtered_raw_rooms if len(room["history"]) > 0]
filtered_rooms = nonempty_rooms if should_filter_empty_room else date_filtered_raw_rooms

room_id, num_rounds, num_players_cur, num_players_history, date = (
    "id",
    "number of rounds",
    "number of players",
    "number of players history",
    "date of game",
)
df = pd.DataFrame(
    [room_to_df(room) for room in filtered_rooms],
    columns=[room_id, num_rounds, num_players_cur, num_players_history, date],
)

st.header("Analysis By Games")

st.write(
    f"Data: {len(date_filtered_raw_rooms)} rooms ({len(nonempty_rooms)} \
         nonempty = {len(nonempty_rooms) / len(date_filtered_raw_rooms) * 100:.1f}%)"
)
# st.dataframe(df)
st.subheader("Total Metrics")
df_daily = (
    df.set_index(date)
    .groupby(pd.Grouper(freq=window))
    .agg(
        total_games=(room_id, "count"),
        total_players=(num_players_cur, "sum"),
        total_rounds=(num_rounds, "sum"),
        total_players_history=(num_players_history, "sum"),
    )
)
# st.dataframe(df_daily)
col1, col2 = st.beta_columns(2)
col1.line_chart(df_daily[["total_games"]])
col2.line_chart(df_daily[["total_players"]])

col1, col2 = st.beta_columns(2)
col1.line_chart(df_daily[["total_rounds"]])
# TODO: This chart doesn't mean that much...
col2.line_chart(df_daily[["total_players_history"]])

#################### BY ROUNDS ####################

rounds = []
for room in filtered_rooms:
    rounds += round_helper.room_to_rounds(room)

category, word, clues, guess, success, no_clues, no_guess = (
    "category",
    "word",
    "clues",
    "guess",
    "success",
    "no clues",
    "no guess",
)
rounds_df = pd.DataFrame(
    rounds, columns=[category, word, clues, guess, success, no_clues, no_guess]
)

st.header("Analysis By Rounds")
st.subheader("Raw Data")
st.write("Rounds excluded without clues: " + str(round_helper.rounds_without_clues))
st.write("Rounds excluded without guesses: " + str(round_helper.rounds_without_guess))
st.write(
    "Rounds without clues percentage: "
    + str(round_helper.rounds_without_clues / (round_helper.total_rounds * 1.0))
)
st.write(
    "Rounds without guesses percentage: "
    + str(round_helper.rounds_without_guess / (round_helper.total_rounds * 1.0))
)

st.write(rounds_df)

df["score"] = df[num_rounds] * df[num_players_cur]
df_num_rounds = (
    df.set_index(num_rounds)
    .groupby(num_rounds)
    .agg(number_of_rounds=(room_id, "count"), weighted_score=("score", sum))
)
df_num_players = (
    df.set_index(num_players_cur)
    .groupby(num_players_cur)
    .agg(number_of_players=(room_id, "count"), weighted_score=("score", sum))
)
st.subheader("Rounds Distribution")
st.bar_chart(df_num_rounds["number_of_rounds"])
st.subheader("Rounds Distribution By Weighted Score")
st.bar_chart(df_num_rounds["weighted_score"])
st.subheader("Number Of Players Distribution")
st.bar_chart(df_num_players["number_of_players"])
st.subheader("Number Of Players Distribution By Weighted Score")
st.bar_chart(df_num_players["weighted_score"])

st.subheader("By Category")
category_df = (
    rounds_df.set_index(category)
    .groupby(category)
    .agg(
        rounds_played=(success, "count"),
        success_rate=(success, "mean"),
        rounds_without_clues=(no_clues, sum),
        rounds_without_clues_rate=(no_clues, lambda x: x.sum() / x.count()),
        rounds_without_guess=(no_guess, sum),
        rounds_without_guess_rate=(no_guess, lambda x: x.sum() / x.count()),
    )
)
st.dataframe(category_df)

st.subheader("By Word")
if enable_words:
    word_df = (
        rounds_df.set_index(word)
        .groupby(word)
        .agg(
            rounds_played=(success, "count"),
            success_rate=(success, lambda x: (x.sum() + 5) / (x.count() + 10)),
            rounds_without_clues=(no_clues, sum),
            rounds_without_clues_rate=(no_clues, lambda x: x.sum() / x.count()),
            rounds_without_guess=(no_guess, sum),
            rounds_without_guess_rate=(no_guess, lambda x: x.sum() / x.count()),
        )
    )
    word_df = word_df[word_df["rounds_played"] >= min_rounds_played]
    word_df = word_df[word_df["success_rate"] >= min_success_rate_word]
    st.dataframe(word_df)

    bad_words_df = word_df[word_df["success_rate"] < bad_word_success_rate]
    bad_words_df = bad_words_df[
        word_df["rounds_without_clues_rate"] > bad_word_clue_rate
    ]
    bad_words_df = bad_words_df[
        word_df["rounds_without_guess_rate"] > bad_word_guess_rate
    ]
    st.dataframe(bad_words_df)

clues = []
for r in rounds:
    clues += round_to_clue_list(r)

st.subheader("By Clue")
if enable_clues:
    clue = "clue"
    clues_df = pd.DataFrame(clues, columns=[clue, category, word, guess, success])
    st.dataframe(clues_df)
    clues_df_agg = (
        clues_df.set_index(clue)
        .groupby(clue)
        .agg(
            times_clued=(success, "count"),
            success_rate=(success, lambda x: (x.sum() + 5) / (x.count() + 10)),
            most_common_word=(word, lambda x: x.value_counts().index[0]),
            most_common_guess=(guess, lambda x: x.value_counts().index[0]),
            most_common_category=(category, lambda x: x.value_counts().index[0]),
        )
    )
    clues_df_agg = clues_df_agg[clues_df_agg["times_clued"] >= min_times_clued]
    clues_df_agg = clues_df_agg[clues_df_agg["success_rate"] >= min_success_rate_clue]
    st.dataframe(clues_df_agg)
