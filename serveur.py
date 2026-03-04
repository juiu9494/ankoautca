#!/usr/bin/env python3
"""
🚀 Serveur Flask — reçoit les soumissions du formulaire GitHub Pages
Lance avec : python serveur.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Autorise les requêtes depuis GitHub Pages

# ─── Couleurs terminal ────────────────────────────────────────────
RESET  = "\033[0m"
BOLD   = "\033[1m"
GREEN  = "\033[92m"
CYAN   = "\033[96m"
YELLOW = "\033[93m"
MAGENTA= "\033[95m"
RED    = "\033[91m"
GRAY   = "\033[90m"

def banner():
    print(f"""
{CYAN}{BOLD}╔══════════════════════════════════════════════╗
║   📬  Serveur formulaire GitHub Pages        ║
║   En écoute sur  http://localhost:5000        ║
╚══════════════════════════════════════════════╝{RESET}
{GRAY}  → Configure le formulaire avec l'URL :
    http://localhost:5000/submit
  → Utilise ngrok pour un accès depuis internet :
    ngrok http 5000{RESET}
""")

@app.route("/submit", methods=["POST", "OPTIONS"])
def recevoir_message():
    # Gestion preflight CORS
    if request.method == "OPTIONS":
        return jsonify(ok=True), 200

    data = request.get_json(silent=True)
    if not data:
        return jsonify(error="Données invalides"), 400

    # ─── Affichage dans le terminal ───────────────────────────────
    now = datetime.now().strftime("%H:%M:%S")
    sep = f"{GRAY}{'─' * 46}{RESET}"

    print(f"\n{sep}")
    print(f"  {GREEN}{BOLD}✉  Nouveau message  {GRAY}[{now}]{RESET}")
    print(sep)
    print(f"  {CYAN}Prénom   {RESET}: {data.get('prenom', '—')}")
    print(f"  {CYAN}Nom      {RESET}: {data.get('nom', '—')}")
    print(f"  {CYAN}Email    {RESET}: {YELLOW}{data.get('email', '—')}{RESET}")
    print(f"  {CYAN}Sujet    {RESET}: {data.get('sujet', '—')}")
    print(f"  {CYAN}Message  {RESET}:")
    for line in data.get('message', '').splitlines():
        print(f"    {MAGENTA}{line}{RESET}")
    print(f"  {CYAN}Date     {RESET}: {data.get('date', now)}")
    print(sep)

    # ─── Sauvegarde dans un fichier JSON (optionnel) ──────────────
    sauvegarder(data)

    return jsonify(success=True, message="Message reçu !"), 200


def sauvegarder(data: dict):
    """Ajoute la soumission dans messages.json"""
    fichier = "messages.json"
    try:
        with open(fichier, "r", encoding="utf-8") as f:
            messages = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        messages = []

    data["recu_le"] = datetime.now().isoformat()
    messages.append(data)

    with open(fichier, "w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)

    print(f"  {GRAY}💾 Sauvegardé dans {fichier} ({len(messages)} message(s) total){RESET}\n")


@app.route("/messages", methods=["GET"])
def lister_messages():
    """Endpoint bonus : voir tous les messages en JSON"""
    try:
        with open("messages.json", "r", encoding="utf-8") as f:
            return jsonify(json.load(f)), 200
    except FileNotFoundError:
        return jsonify([]), 200


if __name__ == "__main__":
    banner()

    # ─── Installe les dépendances si besoin ───────────────────────
    try:
        import flask, flask_cors
    except ImportError:
        import subprocess, sys
        print(f"{YELLOW}Installation des dépendances...{RESET}")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "flask", "flask-cors", "-q"])
        print(f"{GREEN}✓ Dépendances installées{RESET}\n")

    app.run(host="0.0.0.0", port=5000, debug=False)
