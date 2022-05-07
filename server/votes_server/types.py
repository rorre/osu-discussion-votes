from pydantic import BaseModel
from typing import Literal


class VoteRequest(BaseModel):
    discussion_id: int
    beatmapset_id: int
    vote: Literal[-1, 0, 1]

    class Config:
        orm_mode = True


class DiscussionResponse(BaseModel):
    id: int
    upvotes: int
    downvotes: int
    vote: Literal[-1, 0, 1]

    class Config:
        orm_mode = True


class VoteResponse(BaseModel):
    id: int
    vote: int
    mapset_id: int
    discussion_id: int
    user_id: int
    discussion_id: int

    class Config:
        orm_mode = True
