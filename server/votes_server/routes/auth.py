from flask import Blueprint, jsonify, url_for
from flask_jwt_extended import current_user, create_access_token
from votes_server.models.user import User
from votes_server.plugins import db, oauth

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

    uid = profile["id"]
    this_user = User.query.filter_by(osu_uid=uid).first()
    if this_user is None:
        this_user = User(osu_uid=uid)
    this_user.username = profile["username"]
    this_user.access_token = token["access_token"]
    this_user.refresh_token = token.get("refresh_token")
    this_user.expires_at = token["expires_in"]

    db.session.add(this_user)
    db.session.commit()

    access_token = create_access_token(identity=this_user)
    return jsonify(access_token=access_token)
