from flask import Flask, render_template, request, jsonify
import json
import os
from typing import Dict, List, Any
import subprocess
import tempfile
import uuid

app = Flask(__name__, static_folder="static")


@app.route("/")
def index():
    return render_template("index.html")
