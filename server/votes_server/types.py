from pydantic import BaseModel
from typing import Literal
from prisma.models import Discussion


class VoteRequest(BaseModel):
    discussion_id: int
    beatmapset_id: int
    vote: Literal[-1, 1]


class DiscussionResponse(BaseModel):
    id: int
    upvotes: int
    downvotes: int
    vote: Literal[-1, 0, 1]

    @classmethod
    def from_prisma(cls, obj: Discussion, vote: Literal[-1, 0, 1]):
        return cls(
            id=obj.id,
            upvotes=obj.upvotes_count,
            downvotes=obj.downvotes_count,
            vote=vote,
        )
