## Developing locally

1. Install the requirements

   `pip install -r requirements.txt`

2. Download a service account key from the
   [Firebase Console](https://console.firebase.google.com/u/0/project/oneword-cf74a/settings/serviceaccounts/adminsdk)
   (or ask Austin for the key)

3. Paste the key in this folder as `firestore-account-key.json`

4. Start the analytics app

   `streamlit run streamlit_app.py`
