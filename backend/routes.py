from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from typing import List
from tortoise.transactions import in_transaction
from model import Document
from tortoise.contrib.pydantic import pydantic_model_creator

router = APIRouter()

Document_Pydantic = pydantic_model_creator(Document, name="Document")
DocumentIn_Pydantic = pydantic_model_creator(Document, name="DocumentIn", exclude_readonly=True)


@router.get("/")
async def read_root():
    return {"status": 200, "message": "welcome to Zania API !"}

@router.post("/documents", response_model=Document_Pydantic)
async def create_document(document: DocumentIn_Pydantic):
    try:
        obj = await Document.create(**document.dict())
        return await Document_Pydantic.from_tortoise_orm(obj)
    except Exception as e:
      return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"error": "Failed to create document", "detail": str(e)})


@router.get("/documents/{document_id}", response_model=Document_Pydantic)
async def get_document(document_id: int):
    try:
        obj = await Document.get(id=document_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Document not found")
        return await Document_Pydantic.from_tortoise_orm(obj)
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"error": "Failed to get document", "detail": str(e)})

@router.get("/documents", response_model=list[Document_Pydantic])
async def list_documents():
    try:
        return await Document_Pydantic.from_queryset(Document.all())
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"error": "Failed to list documents", "detail": str(e)}) 

@router.post("/documents/bulk")
async def update_documents(documents: list[Document_Pydantic]):
    try:
        cats_to_delete = [doc.title for doc in documents]
        async with in_transaction():
            await Document.filter(title__in=cats_to_delete).delete()
            # Here we are using bulk_create to create multiple documents at once in a single query for better performance
            await Document.bulk_create([
                Document(**doc.dict(exclude={"id"}, exclude_unset=True)) 
                for doc in documents
            ])
        return JSONResponse(content={"message": "Bulk update completed successfully"}, status_code=200)
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"error": "Failed to bulk update documents", "detail": str(e)})

# A clean way to delete documents by their titles, usiing id will be problematic beceause it is auto-incremented
async def delete_documents_by_titles(titles: List[str]) -> int:
    await Document.filter(title__in=titles).delete()
    return len(titles) 
