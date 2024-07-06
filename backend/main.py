from fastapi import FastAPI, HTTPException
from tortoise.contrib.fastapi import register_tortoise
from tortoise.contrib.pydantic import pydantic_model_creator
from model import Document

app = FastAPI()

Document_Pydantic = pydantic_model_creator(Document, name="Document")
DocumentIn_Pydantic = pydantic_model_creator(Document, name="DocumentIn", exclude_readonly=True)

@app.get("/")
async def read_root():
    return {"status": 200, "message": "welcome !"}

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
