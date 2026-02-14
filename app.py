# C:\Users\Usuario\Desktop\projectos\majo_villama\app.py
from flask import Flask, render_template, request

app = Flask(__name__)

@app.get("/")
def home():
    return render_template("home.html")

@app.get("/sobre")
def about():
    return render_template("about.html")

@app.route("/contacto", methods=["GET", "POST"])
def contact():
    sent = False
    data = {"nombre": "", "email": "", "mensaje": ""}
    if request.method == "POST":
        data["nombre"] = (request.form.get("nombre") or "").strip()
        data["email"] = (request.form.get("email") or "").strip()
        data["mensaje"] = (request.form.get("mensaje") or "").strip()
        # Por ahora: no enviamos email; solo confirmación UI.
        sent = True
    return render_template("contact.html", sent=sent, data=data)

@app.get("/healthz")
def healthz():
    return {"ok": True}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
