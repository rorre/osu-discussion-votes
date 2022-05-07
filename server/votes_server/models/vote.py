from typing import TYPE_CHECKING

from votes_server.plugins import db

if TYPE_CHECKING:
    from flask_sqlalchemy.model import Model

    BaseModel = db.make_declarative_base(Model)
else:
    BaseModel = db.Model


class Vote(BaseModel):
    id = db.Column(db.Integer, primary_key=True)
    vote = db.Column(db.Integer, default=0, index=True)

    mapset_id = db.Column(db.Integer, index=True)
    discussion_id = db.Column(db.Integer, index=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.osu_uid"), nullable=False)
