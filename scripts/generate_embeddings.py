
import os
import psycopg2
from sentence_transformers import SentenceTransformer

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is missing")

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute("""
    SELECT
        p.product_id,
        p.product_name,
        COALESCE(p.description, ''),
        COALESCE(c.category_name, '')
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    WHERE p.is_active = TRUE
""")

products = cur.fetchall()

for product_id, name, description, category in products:
    searchable_text = (
        f"Product: {name}. "
        f"Category: {category}. "
        f"Description: {description}"
    )

    embedding = model.encode(
        searchable_text,
        normalize_embeddings=True
    ).tolist()

    vector_string = "[" + ",".join(map(str, embedding)) + "]"

    cur.execute("""
        INSERT INTO product_embeddings
            (product_id, searchable_text, embedding, embedding_model)
        VALUES (%s, %s, %s::vector, %s)
        ON CONFLICT (product_id)
        DO UPDATE SET
            searchable_text = EXCLUDED.searchable_text,
            embedding = EXCLUDED.embedding,
            embedding_model = EXCLUDED.embedding_model,
            updated_at = CURRENT_TIMESTAMP
    """, (
        product_id,
        searchable_text,
        vector_string,
        "all-MiniLM-L6-v2"
    ))

conn.commit()

print(f"Successfully generated embeddings for {len(products)} products.")

cur.close()
conn.close()
