from flask import jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required
from app.db.db import User, db
from app.modules.ticket import ticket_bp

@ticket_bp.route('/register', methods=['POST'])
def register_admin_user():
    data = request.get_json()

    required_fields = ['username', 'password', 'email']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status' : 'error',
                'message' : f'{field} is required.',
            }, 400)
        
    # username and email should be unique
    if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
        return jsonify({
            'status' : 'error',
            'message' : 'Username or email already exists. Please use a different one.',
        }, 400)
    
    try:
        # Create new user
        new_user = User(
            username=data['username'],
            email=data['email'],
        )
        new_user.password = data['password']

        db.session.add(new_user)
        db.session.commit()


        # generate JWT token for the new user
        access_token = create_access_token(identity=new_user)
        refresh_token = create_refresh_token(identity=new_user)

        return jsonify({
            'status' : 'success',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'message': 'User created successfully',
            'user': new_user.to_json()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status' : 'error',
            'message' : f"Database error : {str(e)}",
        }, 500)
    

@ticket_bp.route('/login', methods=['POST'])
def login_admin_user():
    data = request.get_json()

    required_fields = ['username', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status' : 'error',
                'message' : f'{field} is required.',
            }, 400)
        
    # Find the user
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.verify_password(data['password']):
        return jsonify({
            'status' : 'error',
            'message' : 'Invalid username or password.',
        }, 401)
    
    # generate JWT token for the user
    access_token = create_access_token(identity=user)
    refresh_token = create_refresh_token(identity=user)

    return jsonify({
        'status' : 'success',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'message': 'User logged in successfully',
        'user': user.to_json()
    }), 200

@ticket_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_admin_token():
    current_user = get_jwt_identity()
    user = User.query.filter_by(id=current_user).first()
    
    # check if user exists
    if not user:
        return jsonify({
            'status' : 'error',
            'message' : 'User not found.',
        }, 404)
    
    access_token = create_access_token(identity=user)

    return jsonify({
        'status' : 'ok',
        'access_token': access_token,
        'message': 'Access token refreshed successfully'
    }), 200