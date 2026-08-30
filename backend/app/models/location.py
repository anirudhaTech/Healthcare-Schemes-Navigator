from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(10), unique=True, nullable=True) # e.g. MH, UP, TN
    
    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    state = relationship("State", back_populates="districts")
    talukas = relationship("Taluka", back_populates="district", cascade="all, delete-orphan")
    hospitals = relationship("Hospital", back_populates="district")


class Taluka(Base):
    __tablename__ = "talukas"

    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    pincode = Column(String(20), nullable=True, index=True)

    district = relationship("District", back_populates="talukas")
    hospitals = relationship("Hospital", back_populates="taluka")
