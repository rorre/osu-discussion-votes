from prisma import Prisma
from authlib.integrations.flask_client import OAuth

from flask_jwt_extended import JWTManager
from prisma.models import User

oauth = OAuth()
db = Prisma()
jwt = JWTManager()


@jwt.user_identity_loader
def user_identity_lookup(user: User):
    return user.id


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return db.user.find_unique(where={"id": identity})
