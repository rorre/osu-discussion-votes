import itertools
from flask import Blueprint, request
from flask_jwt_extended import current_user, jwt_required
from votes_server.models import User
from votes_server.models.vote import Vote
from votes_server.plugins import db
from typing import cast
from votes_server.types import DiscussionResponse, VoteRequest, VoteResponse

blueprint = Blueprint("vote", __name__, url_prefix="/vote")


# def get_or_create_beatmapset(
#     beatmapset_id: int, include: Optional[BeatmapSetInclude] = None
# ):
#     beatmapset = db.beatmapset.find_unique(where={"id": beatmapset_id}, include=include)
#     if beatmapset:
#         return beatmapset

#     params = {
#         "k": current_app.config["OSU_API_KEY"],
#         "s": beatmapset_id,
#     }

#     response = requests.get("https://osu.ppy.sh/api/get_beatmaps?" + urlencode(params))
#     response.raise_for_status()
#     if len(response.json()) == 0:
#         raise Exception("Invalid map")

#     beatmapset = db.beatmapset.create(data={"id": beatmapset_id}, include=include)
#     return beatmapset


@blueprint.post("/<int:discussion_id>")
@jwt_required()
def vote(discussion_id: int):
    vote_data = VoteRequest(**request.json)
    user = cast(User, current_user)

    user_vote: Vote = (
        Vote.query.with_for_update()
        .filter_by(
            user_id=user.osu_uid,
            discussion_id=discussion_id,
            mapset_id=vote_data.beatmapset_id,
        )
        .first()
    )  # type: ignore
    if user_vote:
        user_vote.vote = vote_data.vote
    else:
        user_vote = Vote(
            vote=vote_data.vote,
            user=user,
            discussion_id=discussion_id,
            mapset_id=vote_data.beatmapset_id,
        )
        db.session.add(user_vote)

    db.session.commit()
    return VoteResponse.from_orm(user_vote).dict()


@blueprint.get("/mapset/<int:mapset_id>")
@jwt_required()
def view(mapset_id: int):
    user = cast(User, current_user)

    result_js = []
    votes = Vote.query.filter_by(mapset_id=mapset_id).all()
    for discussion_id, discussion_votes in itertools.groupby(
        votes, key=lambda x: x.discussion_id
    ):
        upvotes = 0
        downvotes = 0
        user_vote = 0
        for vote in discussion_votes:
            if vote.vote == 1:
                upvotes += 1
            elif vote.vote == -1:
                downvotes += 1

            if vote.user_id == user.osu_uid:
                user_vote = vote.vote

        result_js.append(
            DiscussionResponse(
                id=discussion_id, upvotes=upvotes, downvotes=downvotes, vote=user_vote
            ).dict()
        )

    return {"id": mapset_id, "discussions": result_js}
