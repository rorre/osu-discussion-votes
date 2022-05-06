from typing import cast
from prisma.models import User
from flask import Flask
import json


def create_app(config_file="config.json"):
    with open(config_file, "r") as f:
        data = json.load(f)

    app = Flask(__name__, static_url_path="/static", static_folder="static")
    app.config["TEMPLATES_AUTO_RELOAD"] = True
    app.config.from_mapping(data)

    from votes_server.routes import auth, vote

    app.register_blueprint(auth.blueprint)
    app.register_blueprint(vote.blueprint)

    from votes_server.plugins import oauth, db, jwt

    jwt.init_app(app)
    oauth.init_app(app)
    init_oauth(app, oauth)

    @app.before_first_request
    def init_db():
        db.connect()

    return app


def fetch_token(name):
    from flask_jwt_extended import current_user

    user = cast(User, current_user)
    return dict(
        access_token=user.access_token,
        token_type="Bearer",
        refresh_token=user.refresh_token,
        expires_at=user.expires_at,
    )


def update_token(name, token, refresh_token=None, access_token=None):
    from flask_jwt_extended import current_user

    from votes_server.plugins import db

    user = cast(User, current_user)
    db.user.update(
        where={
            "id": user.id,
        },
        data={
            "access_token": token["access_token"],
            "refresh_token": token.get("refresh_token"),
            "expires_at": token["expires_at"],
        },
    )


def init_oauth(app, oauth):
    oauth.register(
        "osu",
        client_id=app.config.get("OSU_CLIENT_ID"),
        client_secret=app.config.get("OSU_CLIENT_SECRET"),
        api_base_url="https://osu.ppy.sh/api/v2/",
        authorize_url="https://osu.ppy.sh/oauth/authorize",
        access_token_url="https://osu.ppy.sh/oauth/token",
        client_kwargs=dict(
            scope="identify",
        ),
    )
