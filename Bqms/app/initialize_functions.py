from flask import Flask
from flasgger import Swagger
from app.modules.ticket import ticket_bp
from app.db.db import Teller, db

def create_tellers():
    # Dictionary of tellers
    tellers = {
        'A': {'name': 'Teller A', 'is_active': False},
        'B': {'name': 'Teller B', 'is_active': False},
        'C': {'name': 'Teller C', 'is_active': False},
        'D': {'name': 'Teller D', 'is_active': False},
        'E': {'name': 'Teller E', 'is_active': False},
        'F': {'name': 'Teller F', 'is_active': False}
    }
    
    # Check if tellers already exist in the database
    existing_tellers = Teller.query.all()
    if existing_tellers:
        print("Tellers already exist in the database. Skipping creation.")
        return "Tellers already exist!"

    # Create instances of the Teller class
    for teller_id, teller_info in tellers.items():
        teller = Teller(
            name=teller_info['name'],
            is_active=teller_info['is_active']
        )
        db.session.add(teller)
    
    # Commit the changes to the database
    db.session.commit()
    
    print("All tellers have been successfully added to the database.")
    return "Tellers created successfully!"

def initialize_route(app: Flask):
    with app.app_context():
        app.register_blueprint(ticket_bp, url_prefix='/api')


def initialize_db(app: Flask):
    with app.app_context():
        db.init_app(app)
        db.create_all()
        create_tellers()

def initialize_swagger(app: Flask):
    with app.app_context():
        swagger = Swagger(app)
        return swagger