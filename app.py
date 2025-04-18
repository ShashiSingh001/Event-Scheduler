from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import json
from datetime import timedelta, date, datetime

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (timedelta, date, datetime)):
            return str(obj)  # Convert date/time objects to string
        return super().default(obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder  # Use custom JSON encoder
# Configure CORS to allow any origin and headers
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*"}})

# MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="@Shashi123",
    database="login_app"
)
cursor = db.cursor(dictionary=True)

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    cursor.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, hashed_password.decode('utf-8')))
    db.commit()
    return jsonify({"message": "User registered successfully"})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user:
        print(f"User found: {user}")  # Debugging log
        print(f"Stored password hash: {user['password']}")  # Debugging log
        print(f"Entered password: {password}")  # Debugging log
        
        if bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            print("Password matched successfully")  # Debugging log
            return jsonify({
                "success": True,
                "message": "Login successful",
                "user": {"id": user["id"], "email": user["email"]}
            })
        else:
            print("Password mismatch")  # Debugging log
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
    else:
        print("User not found")  # Debugging log
        return jsonify({"success": False, "message": "User not found"}), 404


    
@app.route('/events', methods=['GET'])
def get_events():
    try:
        user_id = request.args.get('user_id')
        
        if user_id and user_id.isdigit():
            user_id = int(user_id)  # Convert to integer
            cursor.execute("SELECT * FROM events WHERE user_id = %s", (user_id,))
        else:
            cursor.execute("SELECT * FROM events")
            
        events = cursor.fetchall()
        # Process the events to ensure serializable data
        processed_events = []
        for event in events:
            processed_event = {}
            for key, value in event.items():
                # Convert any problematic types to strings
                processed_event[key] = str(value) if isinstance(value, (timedelta, date, datetime)) else value
            processed_events.append(processed_event)
        return jsonify(processed_events)
    except Exception as e:
        print(f"Error in get_events: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/events', methods=['POST'])
def create_event():
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
            
        # Make sure user_id is an integer
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid user ID format"}), 400
            
        query = "INSERT INTO events (user_id, title, description, location, date, time) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (user_id, data['title'], data['description'], data['location'], data['date'], data['time'])
        cursor.execute(query, values)
        db.commit()
        return jsonify({"message": "Event created"})
    except Exception as e:
        print(f"Error in create_event: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
            
        # Make sure user_id is an integer
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid user ID format"}), 400
            
        query = "UPDATE events SET title=%s, description=%s, location=%s, date=%s, time=%s WHERE id=%s AND user_id=%s"
        values = (data['title'], data['description'], data['location'], data['date'], data['time'], event_id, user_id)
        cursor.execute(query, values)
        db.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"message": "Event not found or you don't have permission to update it"}), 404
            
        return jsonify({"message": "Event updated"})
    except Exception as e:
        print(f"Error in update_event: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    try:
        user_id = request.args.get('user_id')
        
        if not user_id or not user_id.isdigit():
            return jsonify({"error": "Valid user ID is required"}), 400
            
        user_id = int(user_id)
        cursor.execute("DELETE FROM events WHERE id=%s AND user_id=%s", (event_id, user_id))
        db.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"message": "Event not found or you don't have permission to delete it"}), 404
            
        return jsonify({"message": "Event deleted"})
    except Exception as e:
        print(f"Error in delete_event: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/events/<int:event_id>', methods=['GET'])
def get_event_by_id(event_id):
    try:
        user_id = request.args.get('user_id')
        
        if user_id and user_id.isdigit():
            user_id = int(user_id)
            cursor.execute("SELECT * FROM events WHERE id = %s AND user_id = %s", (event_id, user_id))
        else:
            cursor.execute("SELECT * FROM events WHERE id = %s", (event_id,))
            
        event = cursor.fetchone()
        if not event:
            return jsonify({"message": "Event not found"}), 404
        # Process the event to ensure serializable data
        processed_event = {key: str(value) if isinstance(value, (timedelta, date, datetime)) else value for key, value in event.items()}
        return jsonify(processed_event)
    except Exception as e:
        print(f"Error in get_event_by_id: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
