import uuid
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from datetime import date, datetime
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

def generate_uuid():
    return str(uuid.uuid4().hex[:8])


# 
class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now())
    
    # Define relationship with Teller
    # tellers = db.relationship('Teller', backref='user', lazy=True)
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self._password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def verify_password(self, password):
        return bcrypt.check_password_hash(self._password, password)
    
    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
             }
    
    def __repr__(self):
        return f"<User {self.username}>"
    
class Teller(db.Model):
    __tablename__ = 'teller'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=False)
    
    # Define relationship with Ticket
    tickets = db.relationship('Ticket', backref='teller', lazy=True)
    
    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "is_active": self.is_active
        }
    
    def __repr__(self):
        return f"<Teller {self.name}"

class Ticket(db.Model):
    __tablename__ = 'ticket'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    ticket_number = db.Column(db.String(20), unique=True, nullable=False)
    ticket_type = db.Column(db.String(1), nullable=False)
    created_at =  db.Column(db.DateTime, default=datetime.now(), nullable=True)
    is_served = db.Column(db.Boolean, default=False)
    served_at = db.Column(db.DateTime, nullable=True)
    teller_id = db.Column(db.String(36), db.ForeignKey('teller.id'), nullable=True)
    is_canceled = db.Column(db.Boolean, default=False)
    completed = db.Column(db.Boolean, default=False)

    TICKET_TYPE_LABELS = {
        'W': 'Withdrawal',
        'D': 'Deposit',
        'T': 'Transfer',
        'I': 'Inquiry',
        'O': 'Other',
    }

    def get_ticket_type_display(self):
        return self.TICKET_TYPE_LABELS.get(self.ticket_type, "Unknown")
    


    def __repr__(self):
        return f"<{self.ticket_number} - {self.get_ticket_type_display()}>"
    
    def to_json(self):
        return {
            "id" : self.id,
            "canceled" : self.is_canceled,
            "status": "served" if self.is_served else "pending",
            "ticket_number": self.ticket_number,
            "ticket_type" : self.get_ticket_type_display(),
            "issue_date": self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'Teller': get_teller_name(self.teller_id)  if self.teller_id else None,
            'completed': self.completed,
        }

def get_teller_name(id):
        teller = Teller.query.filter_by(id=id).first()
        return teller.name if teller else None


class DailyCounter(db.Model):
    __tablename__ = 'daily_counter'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, unique=True, nullable=False, default=date.today)
    last_number = db.Column(db.Integer, default=0)

    @classmethod
    def get_today_counter(cls):
        today = date.today()
        counter = cls.query.filter_by(date=today).first()
        if not counter:
            counter = cls(date=today)
            db.session.add(counter)
            db.session.commit()
        return counter

    def increment(self):
        self.last_number += 1
        db.session.commit()
        return self.last_number

    def __repr__(self):
        return f"<Counter for {self.date}: {self.last_number}>"

