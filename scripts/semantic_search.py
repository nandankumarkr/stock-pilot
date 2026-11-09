
import os
import sys
import psycopg2
from sentence_transformers import SentenceTransformer

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Load .env.local first.")

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def search_products(query):
    query_embedding = model.encode(
        query,
        normalize_embeddings=True
    ).tolist()

    vector_string = "[" + ",".join(map(str, query_embedding)) + "]"

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute("""
        SELECT
            p.product_name,
            p.sku,
            pe.searchable_text,
            1 - (pe.embedding <=> %s::vector) AS similarity
        FROM product_embeddings pe
        JOIN products p ON p.product_id = pe.product_id
        ORDER BY pe.embedding <=> %s::vector
        LIMIT 5
    """, (vector_string, vector_string))

    results = cur.fetchall()

    print(f"\nSearch: {query}\n")
    for name, sku, description, similarity in results:
        print(f"Product: {name}")
        print(f"SKU: {sku}")
        print(f"Similarity: {similarity:.4f}")
        print("-" * 35)

    cur.close()
    conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python scripts/semantic_search.py "your search"')
        sys.exit(1)

    search_products(" ".join(sys.argv[1:]))
