Install requirements:
pip3 install -r requirements.txt

Delete the existing db.sqlite3 file (if necessary):

rm db.sqlite3

Load the seed data into the database:

python3 setup.py

Run app:

python3 -m uvicorn main:app --reload
This will run the app at the base URL (http://127.0.0.1:8000/)

Vist the API docs:
Swagger UI: http://127.0.0.1:8000/docs
