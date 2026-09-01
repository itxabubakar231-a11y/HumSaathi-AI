from typing import Optional, Literal
from pydantic import BaseModel, Field, EmailStr

DEFAULT_SENSORY = {
    'textSize': 'medium',
    'soundEnabled': False,
    'animationsEnabled': True,
    'reducedMotion': False,
    'highContrast': False,
    'calmMode': True,
}

class SensoryPrefsSchema(BaseModel):
    textSize: Optional[Literal['small', 'medium', 'large', 'xlarge']] = 'medium'
    soundEnabled: Optional[bool] = False
    animationsEnabled: Optional[bool] = True
    reducedMotion: Optional[bool] = False
    highContrast: Optional[bool] = False
    calmMode: Optional[bool] = True

class UserSignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=150)
    password: str = Field(..., min_length=6, max_length=128)
    persona: Optional[Literal['child', 'teen', 'adult']] = 'child'
    language: Optional[Literal['en', 'ur', 'ur_rm']] = 'en'
    sensoryPrefs: Optional[SensoryPrefsSchema] = None

class UserAuthLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=150)
    password: str = Field(..., min_length=1, max_length=128)

class UserSetupRequest(BaseModel):
    userId: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=80)
    persona: Optional[Literal['child', 'teen', 'adult']] = 'child'
    language: Optional[Literal['en', 'ur', 'ur_rm']] = 'en'
    sensoryPrefs: Optional[SensoryPrefsSchema] = None

class UserLoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    name: Optional[str] = None
    userId: Optional[str] = None

class PersonaUpdateRequest(BaseModel):
    persona: str

class SensoryUpdateRequest(BaseModel):
    textSize: Optional[Literal['small', 'medium', 'large', 'xlarge']] = None
    soundEnabled: Optional[bool] = None
    animationsEnabled: Optional[bool] = None
    reducedMotion: Optional[bool] = None
    highContrast: Optional[bool] = None
    calmMode: Optional[bool] = None

class LanguageUpdateRequest(BaseModel):
    language: Literal['en', 'ur', 'ur_rm']

class GoogleAuthRequest(BaseModel):
    idToken: Optional[str] = None
    credential: Optional[str] = None

