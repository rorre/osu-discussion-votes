from flask import Blueprint, jsonify, url_for
from flask_jwt_extended import current_user, create_access_token
from votes_server.plugins import db, oauth
from datetime import datetime

blueprint = Blueprint("auth", __name__, url_prefix="/auth")


@blueprint.route("/login")
def auth():
    if current_user:
        return jsonify(error="Already authenticated."), 400

    redirect_uri = url_for("auth.authorize", _external=True)
    return oauth.osu.authorize_redirect(redirect_uri)


@blueprint.route("/authorize")
def authorize():
    try:
        token = oauth.osu.authorize_access_token()
    except:
        return jsonify(error="An error has occured."), 500

    resp = oauth.osu.get("me", token=token)
    profile = resp.json()

    update_data = dict(
        username=profile["username"],
        access_token=token["access_token"],
        refresh_token=token.get("refresh_token"),
        expires_at=datetime.fromtimestamp(token["expires_in"]),
    )

    uid = profile["id"]
    this_user = db.user.find_unique(where={"id": uid})
    if this_user is None:
        this_user = db.user.create(data={"id": uid, **update_data})
    else:
        db.user.update(data=update_data, where={"id": uid})

    access_token = create_access_token(identity=this_user)
    return jsonify(access_token=access_token)
