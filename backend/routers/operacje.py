from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_session
import models
import schemas

router = APIRouter() # router pozwala na grupowanie endpointów (np. wszystkie operacje na lotach) w jednym miejscu, a potem podpinamy je do głównej aplikacji FastAPI w main.py
