# StockPilot — Smart Inventory & Automated Restock Predictor

## 1. Project Overview

StockPilot is a smart inventory management system designed to monitor stock levels, track inventory movements, analyze sales, and predict when products need replenishment.

The system uses PostgreSQL for transactional inventory data and PostgreSQL with pgvector for semantic product search.

## 2. Objectives

- Track product inventory and stock movements.
- Monitor low-stock products.
- Calculate product consumption and daily burn rates.
- Predict stockout timelines and recommend reorder quantities.
- Manage sales and purchase orders.
- Support natural-language product search using vector embeddings.
- Present inventory insights through a Next.js dashboard.

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 16, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL |
| Vector Search | pgvector |
| Database Driver | Node.js pg |
| Semantic Search API | Python FastAPI |
| Embedding Library | Sentence Transformers |
| Embedding Model | all-MiniLM-L6-v2 |
| Icons | Lucide React |

## 4. Main Features

- Inventory dashboard with product counts and inventory value.
- Low-stock monitoring.
- Inventory movement tracking.
- Sales processing and analytics.
- Automated low-stock purchase order generation.
- Restock recommendations based on stock consumption.
- Semantic product search using natural-language queries.

## 5. Database Design

The project uses two complementary database capabilities:

**Relational database — PostgreSQL**

Stores structured information such as:
- Products and categories
- Suppliers
- Inventory
- Sales and sale items
- Stock movements
- Purchase orders
- Users and roles

**Vector search — pgvector**

Stores product embeddings in the `product_embeddings` table.

The embedding model converts product names, categories, and descriptions into normalized 384-dimensional vectors.

Cosine distance is used to retrieve semantically similar products.

An HNSW index supports vector similarity search.

## 6. Advanced Database Concepts

The project demonstrates:

- Database transactions
- SQL functions
- Triggers
- Views
- Indexing
- Constraints and referential integrity
- Row locking for inventory operations
- Vector similarity search

## 7. Project Structure

```text
smart-inventory/
├── database/
│   ├── schema/
│   │   ├── 01_core_tables.sql
│   │   ├── 02_inventory_sales.sql
│   │   └── 03_purchase_orders.sql
│   ├── seed/
│   │   └── 04_sample_data.sql
│   └── functions/
│       ├── 05_inventory_operations.sql
│       ├── 06_low_stock_automation.sql
│       ├── 07_sales_management.sql
│       ├── 08_sales_analytics.sql
│       └── 09_restock_prediction.sql
├── scripts/
│   ├── embedding_api.py
│   ├── generate_embeddings.py
│   └── semantic_search.py
├── src/
│   ├── app/
│   └── lib/
├── public/
├── .env.local
├── package.json
└── README.md
```

## 8. Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3
- PostgreSQL
- pgvector PostgreSQL extension

### Step 1: Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd smart-inventory
```

### Step 2: Install Node.js dependencies

```bash
npm install
```

### Step 3: Configure PostgreSQL

Create the project database and configure a PostgreSQL user with the required database permissions.

Enable pgvector in the project database:

```sql
CREATE EXTENSION vector;
```

Run the SQL files in this order:

1. `database/schema/01_core_tables.sql`
2. `database/schema/02_inventory_sales.sql`
3. `database/schema/03_purchase_orders.sql`
4. `database/seed/04_sample_data.sql`
5. `database/functions/05_inventory_operations.sql`
6. `database/functions/06_low_stock_automation.sql`
7. `database/functions/07_sales_management.sql`
8. `database/functions/08_sales_analytics.sql`
9. `database/functions/09_restock_prediction.sql`

Run each script using the appropriate PostgreSQL database account and permissions.

### Step 4: Configure environment variables

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/smart_inventory_db
```

Use your own PostgreSQL credentials. Do not commit `.env.local` to Git.

### Step 5: Set up the Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the Python dependencies:

```bash
pip install fastapi uvicorn sentence-transformers psycopg2-binary
```

### Step 6: Generate product embeddings

Load the environment variables and run the embedding-generation script:

```bash
set -a
source .env.local
set +a

python scripts/generate_embeddings.py
```

This generates product embeddings using `all-MiniLM-L6-v2` and stores them in PostgreSQL.

### Step 7: Start the semantic search service

In one terminal:

```bash
source .venv/bin/activate

set -a
source .env.local
set +a

uvicorn scripts.embedding_api:app --host 127.0.0.1 --port 8000
```

Keep this terminal running while using semantic search.

### Step 8: Start the Next.js application

Open another terminal:

```bash
npm run dev
```

Open:

http://localhost:3000

## 9. Semantic Search Workflow

1. A user enters a natural-language product query.
2. The FastAPI service converts the query into a 384-dimensional embedding.
3. PostgreSQL compares the query embedding with stored product embeddings.
4. Cosine distance determines similarity.
5. The most relevant products are returned to the Next.js application.

## 10. Testing

The project can be tested by verifying:

- Dashboard statistics against database records.
- Inventory movement updates.
- Low-stock identification.
- Sales processing and inventory deduction.
- Purchase order generation and receipt.
- Restock prediction results.
- Semantic search results for natural-language queries.

## 11. Team Contributions

**Team Member 1:** [Add name and actual contributions]

**Team Member 2:** [Add name and actual contributions]

Update this section with the work actually completed by each member.

## 12. Future Enhancements

Potential future improvements include:
- Improved demand forecasting.
- Supplier performance analysis.
- Expanded inventory analytics.
