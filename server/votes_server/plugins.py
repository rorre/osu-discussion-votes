from typing import TYPE_CHECKING
from authlib.integrations.flask_client import OAuth
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy import MetaData

if TYPE_CHECKING:
    from votes_server.models import User

naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(column_0_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

oauth = OAuth()
db = SQLAlchemy(metadata=MetaData(naming_convention=naming_convention))
jwt = JWTManager()


@jwt.user_identity_loader
def user_identity_lookup(user: "User"):
    return user.osu_uid


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    from votes_server.models import User

    identity = jwt_data["sub"]
    return User.query.get(identity)
