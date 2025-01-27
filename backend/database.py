from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise

def init_database(app: FastAPI):
    register_tortoise(
        app,
        db_url='sqlite://db.sqlite3',
        modules={'model': ['model']},
        generate_schemas=True,
        add_exception_handlers=True,
    )