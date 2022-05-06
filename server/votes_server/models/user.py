from typing import TYPE_CHECKING

from votes_server.plugins import db

if TYPE_CHECKING:
    from flask_sqlalchemy.model import Model

    BaseModel = db.make_declarative_base(Model)
else:
    BaseModel = db.Model


class User(BaseModel):
    __tablename__ = "users"

    def __repr__(self) -> str:
        return f"<User(osu_uid='{self.osu_uid}', username='{self.username}')>"

    #########################
    # osu! API + Authlib
    #########################
    osu_uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, index=True, nullable=False)
    access_token = db.Column(db.String, nullable=True)
    refresh_token = db.String(length=200)
    expires_at = db.Column(db.Integer)
    is_active = True
    is_authenticated = True

    def get_id(self):
        return str(self.osu_uid)

    def to_token(self):
        return dict(
            access_token=self.access_token,
            token_type="Bearer",
            refresh_token=self.refresh_token,
            expires_at=self.expires_at,
        )

    votes = db.relationship("Vote", backref="user", lazy=True)
