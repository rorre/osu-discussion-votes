from pydantic import BaseModel
from typing import Literal

from votes_server.models.vote import Discussion


class VoteRequest(BaseModel):
    discussion_id: int
    beatmapset_id: int
    vote: Literal[-1, 0, 1]


class DiscussionResponse(BaseModel):
    id: int
    upvotes: int
    downvotes: int
    vote: Literal[-1, 0, 1]

    @classmethod
    def from_obj(cls, obj: Discussion, vote: Literal[-1, 0, 1]):
        return cls(
            id=obj.id,
            upvotes=obj.upvotes,
            downvotes=obj.downvotes,
            vote=vote,
        )
