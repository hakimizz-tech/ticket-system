from datetime import date, datetime, timedelta
from sqlite3 import IntegrityError

from flask_jwt_extended import jwt_required
from app.db.db import DailyCounter, Teller, Ticket, db
from app.modules.ticket import ticket_bp
from flask import jsonify, request
from datetime import datetime
from app.db.db import DailyCounter




def generate_ticket_number(ticket_type):
    """Generate a unique ticket number based on date and type"""
    counter = DailyCounter.get_today_counter()
    next_number = counter.increment()
    
    today = date.today().strftime('%Y%m%d')
    # Format: YYYYMMDD-TYPE-NUMBER (e.g., 20250411-W-001)
    ticket_number = f"{today}-{ticket_type}-{next_number:03d}"
    return ticket_number

@ticket_bp.route('/ticket/new', methods=['POST'])
def create_ticket():
    """Create a new ticket in the system"""
    data = request.get_json()
    
    if not data or 'ticket_type' not in data:
        return jsonify({'error': 'Ticket type is required'}), 400
    
    ticket_type = data['ticket_type'].upper()
    
    # Validate ticket type
    if ticket_type not in Ticket.TICKET_TYPE_LABELS:
        return jsonify({'error': 'Invalid ticket type'}), 400
    
    try:
        ticket_number = generate_ticket_number(ticket_type)
        
        # Create new ticket
        new_ticket = Ticket(
            ticket_number=ticket_number,
            ticket_type=ticket_type,
        )
        
        db.session.add(new_ticket)
        db.session.commit()
        
        return jsonify({
            'ticket': new_ticket.to_json(),
            'message': 'Ticket created successfully'
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Failed to create ticket. Please try again.'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

@ticket_bp.route('/ticket/cancel', methods=['POST', 'DELETE'])
def cancel_ticket():
    """Cancel a ticket in the system"""
    data = request.get_json()
    
    if not data or 'ticket_number' not in data:
        return jsonify({
            'status': 'error',
            'message': 'Ticket number is required'}), 400
    
    ticket_number = data['ticket_number']
    
    # Find the ticket
    ticket = Ticket.query.filter_by(ticket_number=ticket_number).first()
    
    if not ticket:
        return jsonify({
            'status': 'error',
            'message': 'Ticket not found'}), 404

    if ticket.teller_id:
        teller = Teller.query.filter_by(id=ticket.teller_id).first()
        if teller:
            teller.is_active = False
        else:
            pass
    
    try:
        ticket.is_cancelled = True
        db.session.commit()
        
        return jsonify({
            'status': 'ok',
            'message': 'Ticket cancelled successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@ticket_bp.route('/ticket/valid', methods=['POST'])
def validate_ticket():
    """Validate a ticket in the system"""
    data = request.get_json()
    
    if not data or 'ticket_number' not in data:
        return jsonify({'error': 'Ticket number is required'}), 400
    
    ticket_number = data['ticket_number']
    
    # Find the ticket
    ticket = Ticket.query.filter_by(ticket_number=ticket_number).first()
    
    if not ticket:
        return jsonify({
            'status': 'error',
            'message': 'Ticket not found'}), 404
    
    #check if the ticket is expired. Ticket is valid for 1 day
    if ticket.created_at < datetime.now() - timedelta(days=1):
        return jsonify({
            'status ': 'error',
            'message': 'Ticket is expired'
        }), 400
    
    if ticket.is_served:
        return jsonify({
            'status': 'error',
            'message': 'Ticket is already served'
        }), 400
    
    return jsonify({
        'status': 'ok',
        'message': 'Ticket is valid'
    }), 200


#get the list of all tickets at the current day
@ticket_bp.route('/ticket/list', methods=['GET'])
@jwt_required()
def get_ticket_list():
    # Get date parameter or use today's date
    date_str = request.args.get('date')
    
    try:
        if date_str:
            query_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            query_date = datetime.now().date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Query tickets for the specified date - Time range for the whole day
    start_of_day = datetime.combine(query_date, datetime.min.time())
    end_of_day = datetime.combine(query_date, datetime.max.time())
    
    # Filter by status if provided
    status = request.args.get('status')
    if status == 'pending':
        tickets = Ticket.query.filter(
            Ticket.created_at.between(start_of_day, end_of_day),
            Ticket.is_served == False
        ).all()
    elif status == 'served':
        tickets = Ticket.query.filter(
            Ticket.created_at.between(start_of_day, end_of_day),
            Ticket.is_served == True
        ).all()
    else:
        tickets = Ticket.query.filter(
            Ticket.created_at.between(start_of_day, end_of_day)
        ).all()
    
    return jsonify({
        'status': 'ok',
        'message': 'Ticket list retrieved successfully',
        'date': query_date.strftime('%Y-%m-%d'),
        'total_tickets': len(tickets),
        'tickets': [ticket.to_json() for ticket in tickets]
    }), 200


@ticket_bp.route('/ticket/<string:ticket_id>/serve', methods=['POST'])
@jwt_required()
def ticket_served(ticket_id):
    data = request.get_json()
    
    if not data or 'teller_id' not in data:
        return jsonify({
            'status': 'error',
            'message': 'Teller ID is required'}), 400
    
    ticket = Ticket.query.get_or_404(ticket_id)
    teller = Teller.query.get_or_404(data['teller_id'])
    
    # Check if ticket is already served
    if ticket.is_served:
        return jsonify({
            'status' : 'error',
            'message': 'Ticket is already served'}), 400
    
    if teller.is_active:
        return jsonify({
            'status' : 'error',
            'message': 'This teller is currently serving another ticket'}), 400
    

    
    # Update ticket status
    ticket.is_served = True
    ticket.served_at = datetime.now()
    ticket.teller_id = teller.id

    # Mark teller as active (busy with this ticket)
    teller.is_active = True
    
    db.session.commit()
    
    return jsonify({
        'status': 'ok',
        'message': 'Ticket marked as served',
        'ticket': ticket.to_json()
    }), 200

@ticket_bp.route('/ticket/<string:ticket_id>/complete', methods=['PUT'])
@jwt_required()
def complete_ticket_service( ticket_id):
    """Mark a ticket as completed and free up the teller"""
    
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # Check if ticket is assigned to a teller
    if not ticket.teller_id:
        return jsonify({
            'status': 'error',
            'message': 'This ticket is not assigned to any teller'}), 400
    
    teller = Teller.query.filter_by(id=ticket.teller_id).first()
    
    # Update teller status
    teller.is_active = False
    
    db.session.commit()
    
    return jsonify({
        'message': 'Ticket service completed, teller is now available',
        'ticket': ticket.to_json(),
        'teller': teller.to_json()
    }), 200


@ticket_bp.route('/tellers', methods=['GET'])
@jwt_required()
def get_tellers():
    # Get all tellers with optional filter for active status
    active_only = request.args.get('active', 'false').lower() == 'true'
    
    if active_only:
        tellers = Teller.query.filter_by(is_active=True).all()
    else:
        tellers = Teller.query.all() 
    
    return jsonify({
        'total': len(tellers),
        'tellers': [teller.to_json() for teller in tellers]
    }), 200


@ticket_bp.route('/tickets/<string:ticket_id>/auto-assign', methods=['GET'])
def auto_assign_ticket(ticket_id):
    # Find available tellers (is_active=False)
    available_tellers = Teller.query.filter_by(is_active=False).all()
    
    if not available_tellers:
        # No tellers available - return empty response
        return '', 204
    
    # Choose a random teller
    import random
    chosen_teller = random.choice(available_tellers)
    
    # Find the first pending ticket
    pending_ticket = Ticket.query.filter_by(id=ticket_id).first()
    if not pending_ticket:
        # No pending tickets - return empty response
        return '', 204
    
    # Assign the ticket to the chosen teller
    pending_ticket.teller_id = chosen_teller.id
    pending_ticket.is_served = True
    pending_ticket.served_at = datetime.now()
    chosen_teller.is_active = True
    db.session.commit()
    return jsonify({
        'message': 'Ticket has been assigned Teller',
        'ticket': pending_ticket.to_json(),
        'teller': chosen_teller.to_json()
    }), 200