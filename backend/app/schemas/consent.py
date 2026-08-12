from pydantic import BaseModel


class ConsentAcceptRequest(BaseModel):
    signature_name: str
