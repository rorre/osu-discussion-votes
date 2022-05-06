from flask import Blueprint, request
from flask_jwt_extended import current_user, jwt_required
from votes_server.models import Discussion, User
from votes_server.models.vote import Vote
from votes_server.plugins import db
from typing import cast
from votes_server.types import DiscussionResponse, VoteRequest

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

    discussion: Discussion = Discussion.query.with_for_update().get(discussion_id)  # type: ignore
    if not discussion:
        # TODO: Ensure discussion actually exists in that map
        discussion = Discussion(
            id=discussion_id,
            upvotes=0,
            downvotes=0,
            mapset_id=vote_data.beatmapset_id,
        )  # type: ignore

    user_vote: Vote = Vote.query.filter_by(
        user_id=user.osu_uid,
        discussion_id=discussion_id,
    ).first()  # type: ignore
    if user_vote:
        old_vote = user_vote.vote
        if old_vote == vote_data.vote:
            return DiscussionResponse.from_obj(discussion, vote_data.vote).json()

        user_vote.vote = vote_data.vote

        if old_vote != 0:
            decremented_field = "upvotes" if old_vote == 1 else "downvotes"
            # existing_vote.decremented_field = Vote.decremented_field - 1
            setattr(
                discussion,
                decremented_field,
                getattr(discussion, decremented_field) - 1,
            )

        if vote_data.vote != 0:
            incremeneted_field = "upvotes" if vote_data.vote == 1 else "downvotes"
            # existing_vote.incremeneted_field = Vote.incremeneted_field + 1
            setattr(
                discussion,
                incremeneted_field,
                getattr(discussion, incremeneted_field) + 1,
            )
    else:
        user_vote = Vote(vote=vote_data.vote, user=user, discussion=discussion)

        incremeneted_field = "upvotes" if vote_data.vote == 1 else "downvotes"
        # existing_vote.incremeneted_field = Vote.incremeneted_field + 1
        setattr(
            discussion,
            incremeneted_field,
            getattr(discussion, incremeneted_field) + 1,
        )

    db.session.add(user_vote)
    db.session.add(discussion)
    db.session.commit()

    return DiscussionResponse.from_obj(discussion, vote_data.vote).dict()


@blueprint.get("/mapset/<int:mapset_id>")
@jwt_required()
def view(mapset_id: int):
    user = cast(User, current_user)

    result_js = []
    discussions = Discussion.query.filter_by(mapset_id=mapset_id).all()
    for discussion in discussions:
        existing_vote = Vote.query.filter_by(
            user_id=user.osu_uid, discussion_id=discussion.id
        ).first()
        result_js.append(
            DiscussionResponse.from_obj(
                discussion,
                existing_vote.vote if existing_vote else 0,  # type: ignore
            ).dict()
        )

    return {"id": mapset_id, "discussions": result_js}
