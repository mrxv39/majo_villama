# app/app.py
import os
from flask import Flask, render_template, request, redirect, url_for, flash

from .db import get_db, close_db, init_db

def create_app() -> Flask:
    app = Flask(__name__)

    # SECRET_KEY en Fly: fly secrets set SECRET_KEY=...
    app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-me")

    # Asegura DB y tabla
    init_db()

    # Cerrar conexión al final del request
    app.teardown_appcontext(close_db)

    @app.get("/")
    def home():
        return render_template("home.html")

    @app.get("/sobre")
    def sobre():
        return render_template("sobre.html")

    @app.get("/clases")
    def clases():
        return render_template("clases.html")

    @app.get("/contacto")
    def contacto():
        return render_template("contacto.html")

    @app.post("/contacto")
    def contacto_post():
        nombre = (request.form.get("nombre") or "").strip()
        email = (request.form.get("email") or "").strip()
        mensaje = (request.form.get("mensaje") or "").strip()

        if not nombre or not email or not mensaje:
            flash("Completa nombre, email y mensaje.")
            return redirect(url_for("contacto"))

        db = get_db()
        db.execute(
            "INSERT INTO leads (nombre, email, mensaje) VALUES (?, ?, ?)",
            (nombre, email, mensaje),
        )
        db.commit()

        flash("¡Gracias! Te responderé lo antes posible.")
        return redirect(url_for("contacto"))

    return app
