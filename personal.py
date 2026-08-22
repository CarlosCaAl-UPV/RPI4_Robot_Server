from flask import Blueprint
from flask import render_template
from flask import request


personal = Blueprint(
    "personal",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/static",
)


@personal.route("/")
@personal.route("/index")
def index():
    return render_template("index.html")


@personal.route("/enm")
def page1():
    return render_template("page1.html")


@personal.route("/tutorial")
def page2():
    return render_template("page2.html")


@personal.route("/descargas")
def page3():
    return render_template("page3.html")


@personal.route("/errores")
def page4():
    error = request.args.get("error", "error")

    if error == "error01":
        return render_template("page41.html")

    if error == "error02":
        return render_template("page42.html")

    if error == "error03":
        return render_template("page43.html")

    return render_template("page4b.html")


@personal.route("/proceso")
def page5():
    return render_template("page5.html")


@personal.route("/documentacion")
def page6():
    return render_template("page6.html")


@personal.route("/producto")
def page7():
    return render_template("page7.html")


@personal.route("/qr")
def page8():
    return render_template("page8.html")


@personal.route("/<n>")
def page_n(n):
    return render_template("error.html")
