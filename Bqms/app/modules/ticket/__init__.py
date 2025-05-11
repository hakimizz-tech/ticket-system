

from flask import Blueprint


ticket_bp = Blueprint('main', __name__)

import app.modules.ticket.route
import app.modules.ticket.auth
