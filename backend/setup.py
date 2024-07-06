from tortoise import Tortoise, run_async
from model import Document

async def init():
    await Tortoise.init(
        db_url='sqlite://db.sqlite3',
        modules={'model': ['model']}
    )
    await Tortoise.generate_schemas()

    documents_data = [
        {"type": "bank-draft", "title": "Bank Draft", "position": 0},
        {"type": "bill-of-lading", "title": "Bill of Lading", "position": 1},
        {"type": "invoice", "title": "Invoice", "position": 2},
        {"type": "bank-draft-2", "title": "Bank Draft 2", "position": 3},
        {"type": "bill-of-lading-2", "title": "Bill of Lading 2", "position": 4},
    ]

    for doc_data in documents_data:
        await Document.create(**doc_data)

    await Tortoise.close_connections()

run_async(init())
