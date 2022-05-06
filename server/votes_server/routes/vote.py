from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import current_user, jwt_required
import requests
from votes_server.plugins import db
from urllib.parse import urlencode
from typing import Optional, cast
from prisma.models import User
from votes_server.types import DiscussionResponse, VoteRequest
from prisma.types import BeatmapSetInclude

blueprint = Blueprint("vote", __name__, url_prefix="/vote")


def get_or_create_beatmapset(
    beatmapset_id: int, include: Optional[BeatmapSetInclude] = None
):
    beatmapset = db.beatmapset.find_unique(where={"id": beatmapset_id}, include=include)
    if beatmapset:
        return beatmapset

    params = {
        "k": current_app.config["OSU_API_KEY"],
        "s": beatmapset_id,
    }

    response = requests.get("https://osu.ppy.sh/api/get_beatmaps?" + urlencode(params))
    response.raise_for_status()
    if len(response.json()) == 0:
        raise Exception("Invalid map")

    beatmapset = db.beatmapset.create(data={"id": beatmapset_id}, include=include)
    return beatmapset


@blueprint.post("/<int:discussion_id>")
@jwt_required()
def vote(discussion_id: int):
    vote_data = VoteRequest(**request.json)
    user = cast(User, current_user)

    discussion = db.discussion.find_unique(where={"id": discussion_id})
    if not discussion:
        beatmapset = get_or_create_beatmapset(vote_data.beatmapset_id)
        # TODO: Ensure discussion actually exists in that map
        discussion = db.discussion.create(
            data={
                "id": discussion_id,
                "upvotes_count": 0,
                "downvotes_count": 0,
                "mapset": {"connect": {"id": beatmapset.id}},
            }
        )

    existing_vote = db.vote.find_first(
        where={
            "user": {"is": {"id": user.id}},
            "discussion": {"is": {"id": discussion_id}},
        }
    )
    if existing_vote:
        old_vote = existing_vote.vote
        if old_vote == vote_data.vote:
            return DiscussionResponse.from_prisma(discussion, vote_data.vote).json()

        db.vote.update(
            data={
                "vote": vote_data.vote,
            },
            where={
                "id": existing_vote.id,
            },
        )

        update_data = {}
        if old_vote != 0:
            decremented_field = "upvotes_count" if old_vote == 1 else "downvotes_count"
            update_data[decremented_field] = {"decrement": 1}

        if vote_data.vote != 0:
            incremeneted_field = (
                "upvotes_count" if vote_data.vote == 1 else "downvotes_count"
            )
            update_data[incremeneted_field] = {"increment": 1}

        discussion = db.discussion.update(
            data=update_data,  # type: ignore
            where={"id": discussion.id},
        )

    else:
        db.vote.create(
            data={
                "vote": vote_data.vote,
                "user": {"connect": {"id": user.id}},
                "discussion": {"connect": {"id": discussion.id}},
            }
        )
        target_field = "upvotes_count" if vote_data.vote == 1 else "downvotes_count"
        discussion = db.discussion.update(
            data={target_field: {"increment": 1}},  # type: ignore
            where={"id": discussion.id},
        )

    assert discussion is not None
    return DiscussionResponse.from_prisma(discussion, vote_data.vote).json()


@blueprint.get("/mapset/<int:mapset_id>")
@jwt_required()
def view(mapset_id: int):
    user = cast(User, current_user)

    mapset = get_or_create_beatmapset(mapset_id, include={"discussions": True})
    assert mapset.discussions is not None

    discussions = []
    for discussion in mapset.discussions:
        existing_vote = db.vote.find_first(
            where={
                "user_id": user.id,
                "discussion_id": discussion.id,
            }
        )
        discussions.append(
            DiscussionResponse.from_prisma(
                discussion,
                existing_vote.vote if existing_vote else 0,  # type: ignore
            ).dict()
        )

    return {"id": mapset.id, "discussions": discussions}
