
# źródło: https://medium.com/codex/fastapi-crud-with-postgresql-using-sqlalchemy-and-alembic-fa9418fead71

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Adres
database_url = "postgresql://szwagi:password123@localhost:5432/szwagiair_db"

engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#autocommit=False - spełnienie ACID - spełnienie wymagania rollback

# SQLAlchemy 2.0 - nowym sposobem
class Base(DeclarativeBase):
    pass

# funkcja wstrzykująca sesje w endpointach FastAPI
def get_session():
    with SessionLocal() as session: 
        yield session #(Pauza) yield session zatrzymuje funkcję i przekazuje otwartą sesję do endpointu (np. /loty).