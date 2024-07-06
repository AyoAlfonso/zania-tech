from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from tortoise.contrib.pydantic import pydantic_model_creator
from model import Document
from typing import List
from fastapi.responses import JSONResponse

from tortoise.transactions import in_transaction


app = FastAPI(
        title="Document API",
        description="API for managing documents",
        version="1.0.0"
    )

origins = [
    "*",
]

# Add CORS middleware to allow cross-origin requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Document_Pydantic = pydantic_model_creator(Document, name="Document")
DocumentIn_Pydantic = pydantic_model_creator(Document, name="DocumentIn", exclude_readonly=True)

@app.get("/")
async def read_root():
    return {"status": 200, "message": "welcome to zania API !"}

@app.post("/documents", response_model=Document_Pydantic)
async def create_document(document: DocumentIn_Pydantic):
    obj = await Document.create(**document.dict())
    return await Document_Pydantic.from_tortoise_orm(obj)

@app.get("/documents/{document_id}", response_model=Document_Pydantic)
async def get_document(document_id: int):
    obj = await Document.get(id=document_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")
    return await Document_Pydantic.from_tortoise_orm(obj)

@app.get("/documents", response_model=list[Document_Pydantic])
async def list_documents():
    return await Document_Pydantic.from_queryset(Document.all())

@app.post("/documents/bulk")
async def update_documents(documents: list[Document_Pydantic]):
    cats_to_delete = [doc.title for doc in documents]
    async with in_transaction():
        await Document.filter(title__in=cats_to_delete).delete()
        # Here we are using bulk_create to create multiple documents at once in a single query for better performance
        await Document.bulk_create([
            Document(**doc.dict(exclude={"id"}, exclude_unset=True)) 
            for doc in documents
        ])
    return JSONResponse(content={"message": "Bulk update completed successfully"}, status_code=200)

# A clean way to delete documents by their titles, usiing id will be problematic beceause it is auto-incremented
async def delete_documents_by_titles(titles: List[str]) -> int:
    await Document.filter(title__in=titles).delete()
    return len(titles) 

register_tortoise(
    app,
    db_url='sqlite://db.sqlite3',
    modules={'model': ['model']},
    generate_schemas=True,
    add_exception_handlers=True,
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
