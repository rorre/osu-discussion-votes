from typing import TYPE_CHECKING

from votes_server.plugins import db

if TYPE_CHECKING:
    from flask_sqlalchemy.model import Model

    BaseModel = db.make_declarative_base(Model)
else:
    BaseModel = db.Model


class Discussion(BaseModel):
    id = db.Column(db.Integer, primary_key=True)
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)

    mapset_id = db.Column(db.Integer, index=True)
    votes = db.relationship("Vote", backref="discussion", lazy=True)


class Vote(BaseModel):
    id = db.Column(db.Integer, primary_key=True)
    vote = db.Column(db.Integer, default=0)

    user_id = db.Column(db.Integer, db.ForeignKey("users.osu_uid"), nullable=False)
    discussion_id = db.Column(
        db.Integer, db.ForeignKey("discussion.id"), nullable=False
    )
