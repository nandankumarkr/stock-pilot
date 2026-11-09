
import os
import psycopg2
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title="StockPilot Semantic Search")

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


class SearchRequest(BaseModel):
    query: str


@app.post("/search")
def search_products(request: SearchRequest):
    query = request.query.strip()

    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    embedding = model.encode(
        query,
        normalize_embeddings=True
    ).tolist()

    vector_string = "[" + ",".join(map(str, embedding)) + "]"

    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        p.product_id,
                        p.product_name,
                        p.sku,
                        pe.searchable_text,
                        1 - (pe.embedding <=> %s::vector) AS similarity
                    FROM product_embeddings pe
                    JOIN products p ON p.product_id = pe.product_id
                    WHERE p.is_active = TRUE
                    ORDER BY pe.embedding <=> %s::vector
                    LIMIT 5
                """, (vector_string, vector_string))

                rows = cur.fetchall()

        return {
            "success": True,
            "results": [
                {
                    "product_id": row[0],
                    "product_name": row[1],
                    "sku": row[2],
                    "description": row[3],
                    "similarity": round(float(row[4]), 4)
                }
                for row in rows
            ]
        }

    except Exception:
        raise HTTPException(status_code=500, detail="Semantic search failed")
