from flask import Flask, render_template, request, jsonify, url_for
import os
import logging
from the_bill import (
    create_group, get_all_groups, get_group, add_member_to_group,
    get_group_transfers, get_member_summary, export_group_data
)

# Set up logging
log_dir = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(log_dir, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_dir, 'thebill.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('TheBill')

# Configure Flask appעבור קבצים סטטיים
app = Flask(__name__, static_folder="web", template_folder="web")

@app.route('/')
def home():
    return render_template('index.html')

# API Endpoints to replace Eel functions
@app.route('/api/create_group', methods=['POST'])
def api_create_group():
    data = request.json
    result = create_group(data.get('name'), data.get('admin_first_name'), data.get('admin_last_name'))
    return jsonify(result)

@app.route('/api/get_all_groups', methods=['GET'])
def api_get_all_groups():
    result = get_all_groups()
    return jsonify(result)

@app.route('/api/get_group/<group_name>', methods=['GET'])
def api_get_group(group_name):
    result = get_group(group_name)
    return jsonify(result)

@app.route('/api/add_member_to_group', methods=['POST'])
def api_add_member_to_group():
    data = request.json
    result = add_member_to_group(data.get('group_name'), data.get('first_name'), data.get('last_name'))
    return jsonify(result)

@app.route('/api/get_group_transfers/<group_name>', methods=['GET'])
def api_get_group_transfers(group_name):
    result = get_group_transfers(group_name)
    return jsonify(result)

@app.route('/api/get_member_summary', methods=['POST'])
def api_get_member_summary():
    data = request.json
    result = get_member_summary(data.get('group_name'), data.get('member_full_name'))
    return jsonify(result)

@app.route('/api/export_group_data', methods=['POST'])
def api_export_group_data():
    data = request.json
    result = export_group_data(data.get('group_name'), data.get('format'))
    return jsonify(result)

@app.route('/api/edit_member', methods=['POST'])
def api_edit_member():
    data = request.json
    from the_bill import TheBillApp
    app_instance = TheBillApp()
    group = app_instance._get_group_by_name(data.get('group_name'))
    if not group:
        return jsonify({'success': False, 'error': f"Group {data.get('group_name')} not found"})
    
    try:
        member = group.edit_member(data.get('old_full_name'), data.get('new_first_name'), data.get('new_last_name'))
        app_instance.save_data()
        return jsonify({'success': True, 'member': member.to_dict()})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/remove_member', methods=['POST'])
def api_remove_member():
    data = request.json
    from the_bill import TheBillApp
    app_instance = TheBillApp()
    group = app_instance._get_group_by_name(data.get('group_name'))
    if not group:
        return jsonify({'success': False, 'error': f"Group {data.get('group_name')} not found"})
    
    try:
        success = group.remove_member(data.get('full_name'))
        app_instance.save_data()
        return jsonify({'success': True})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/edit_payment', methods=['POST'])
def api_edit_payment():
    data = request.json
    from the_bill import TheBillApp
    app_instance = TheBillApp()
    group = app_instance._get_group_by_name(data.get('group_name'))
    if not group:
        return jsonify({'success': False, 'error': f"Group {data.get('group_name')} not found"})
    
    try:
        payment = group.edit_payment(
            data.get('payment_id'), 
            data.get('title'), 
            data.get('amount'), 
            data.get('payer_name'), 
            data.get('participants'), 
            data.get('description')
        )
        app_instance.save_data()
        return jsonify({'success': True, 'payment': payment.to_dict()})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/delete_payment', methods=['POST'])
def api_delete_payment():
    data = request.json
    from the_bill import TheBillApp
    app_instance = TheBillApp()
    group = app_instance._get_group_by_name(data.get('group_name'))
    if not group:
        return jsonify({'success': False, 'error': f"Group {data.get('group_name')} not found"})
    
    try:
        success = group.delete_payment(data.get('payment_id'))
        app_instance.save_data()
        return jsonify({'success': True})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/delete_group', methods=['POST'])
def api_delete_group():
    data = request.json
    from the_bill import TheBillApp
    app_instance = TheBillApp()
    
    try:
        success = app_instance.delete_group(data.get('group_name'))
        return jsonify({'success': True})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/get_payment_breakdown', methods=['POST'])
def api_get_payment_breakdown():
    data = request.json
    from the_bill import TheBillApp
    app_instance = TheBillApp()
    group = app_instance._get_group_by_name(data.get('group_name'))
    if not group:
        return jsonify({'success': False, 'error': f"Group {data.get('group_name')} not found"})
    
    try:
        breakdown = group.get_payment_breakdown(data.get('payment_id'))
        return jsonify({'success': True, 'breakdown': breakdown})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/set_permissions', methods=['POST'])
def api_set_permissions():
    data = request.json
    from the_bill import TheBillApp
    app_instance = TheBillApp()
    group = app_instance._get_group_by_name(data.get('group_name'))
    if not group:
        return jsonify({'success': False, 'error': f"Group {data.get('group_name')} not found"})
    
    try:
        group.set_permissions(data.get('member_full_name'), data.get('can_add_payments'))
        app_instance.save_data()
        return jsonify({'success': True})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/edit_group_name', methods=['POST'])
def api_edit_group_name():
    data = request.json
    old_name = data.get('old_name')
    new_name = data.get('new_name')
    
    logger.info(f"Editing group name: {old_name} -> {new_name}")
    
    from the_bill import TheBillApp
    app_instance = TheBillApp()
    
    # Check if new name already exists
    if any(group.name == new_name for group in app_instance.groups):
        logger.error(f"Cannot rename group: {new_name} already exists")
        return jsonify({'success': False, 'error': f"שם הקבוצה '{new_name}' כבר קיים"})
    
    # Find the group
    group = app_instance._get_group_by_name(old_name)
    if not group:
        logger.error(f"Cannot rename group: {old_name} not found")
        return jsonify({'success': False, 'error': f"קבוצה '{old_name}' לא קיימת"})
    
    # Update the name
    group.name = new_name
    app_instance.save_data()
    logger.info(f"Group renamed successfully: {old_name} -> {new_name}")
    return jsonify({'success': True})

@app.route('/api/merge_members', methods=['POST'])
def api_merge_members():
    data = request.json
    group_name = data.get('group_name')
    from_member = data.get('from_member')
    to_member = data.get('to_member')
    combined_name = data.get('combined_name')
    
    logger.info(f"Merging members in {group_name}: {from_member} -> {to_member}")
    from the_bill import TheBillApp
    app_instance = TheBillApp()
    group = app_instance._get_group_by_name(group_name)
    if not group:
        logger.error(f"Group {group_name} not found for member merge")
        return jsonify({'success': False, 'error': f"Group {group_name} not found"})
    
    try:
        # Find both members
        from_member_obj = None
        to_member_obj = None
        
        for member in group.members:
            full_name = f"{member.first_name} {member.last_name}".strip()
            if full_name == from_member:
                from_member_obj = member
            elif full_name == to_member:
                to_member_obj = member
        
        if not from_member_obj:
            logger.error(f"Member {from_member} not found for merge")
            return jsonify({'success': False, 'error': f"Member {from_member} not found"})
        
        if not to_member_obj:
            logger.error(f"Member {to_member} not found for merge")
            return jsonify({'success': False, 'error': f"Member {to_member} not found"})
        
        logger.info(f"Found both members for merge: {from_member} (balance: {from_member_obj.balance}), {to_member} (balance: {to_member_obj.balance})")
        
        # Prepare the combined member name (default is "First1 + First2")
        if not combined_name:
            combined_name = f"{from_member} + {to_member}"
            
        # Split the combined name into first and last name for the member object
        name_parts = combined_name.split(' ', 1)
        new_first_name = name_parts[0]
        new_last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        # Update all payments: if from_member is payer, change to the combined name
        for payment in group.payments:
            if payment.payer_name == from_member:
                payment.payer_name = combined_name
                logger.info(f"Updated payer in payment '{payment.title}': {from_member} -> {combined_name}")
            elif payment.payer_name == to_member:
                payment.payer_name = combined_name
                logger.info(f"Updated payer in payment '{payment.title}': {to_member} -> {combined_name}")
            
            # Update participants list for both members
            updated_participants = []
            for p in payment.participants:
                if p == from_member or p == to_member:
                    if combined_name not in updated_participants:
                        updated_participants.append(combined_name)
                else:
                    updated_participants.append(p)
            
            payment.participants = updated_participants
            logger.info(f"Updated participants in payment '{payment.title}'")
        
        # Update any permissions
        combined_permissions = False
        if from_member in group.permissions:
            combined_permissions |= group.permissions[from_member]
            del group.permissions[from_member]
        
        if to_member in group.permissions:
            combined_permissions |= group.permissions[to_member]
            del group.permissions[to_member]
        
        if combined_permissions:
            group.permissions[combined_name] = True
            logger.info(f"Set permissions for combined member: {combined_name}")
        
        # Calculate combined balance
        combined_balance = from_member_obj.balance + to_member_obj.balance
        
        # Remove both original members
        group.members = [m for m in group.members if f"{m.first_name} {m.last_name}".strip() not in [from_member, to_member]]
        
        # Add the new combined member
        from server import member_from_data
        new_member = member_from_data({
            'first_name': new_first_name,
            'last_name': new_last_name,
            'balance': combined_balance,
            'merged_data': {
                "original_members": [
                    {"name": from_member, "balance": from_member_obj.balance},
                    {"name": to_member, "balance": to_member_obj.balance}
                ]
            }
        })
        
        group.members.append(new_member)
        logger.info(f"Created combined member: {combined_name} with balance: {combined_balance}")
        
        # Recalculate balances
        group._calculate_balances()
        
        # Save changes
        app_instance.save_data()
        logger.info(f"Successfully merged members into: {combined_name}")
        
        return jsonify({'success': True})
    except Exception as e:
        logger.exception(f"Error merging members: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/add_payment_to_group', methods=['POST'])
def api_add_payment_to_group():
    data = request.json
    from the_bill import TheBillApp
    app_instance = TheBillApp()
    group = app_instance._get_group_by_name(data.get('group_name'))
    if not group:
        return jsonify({'success': False, 'error': f"Group {data.get('group_name')} not found"})
    
    try:
        payment = group.add_payment(
            data.get('title'),
            data.get('amount'),
            data.get('payer_name'),
            data.get('participants'),
            data.get('description', "")
        )
        app_instance.save_data()
        return jsonify({'success': True, 'payment': payment.to_dict()})
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)})

# Helper function to create a member from data dict
def member_from_data(data):
    from the_bill import Member
    member = Member(data['first_name'], data['last_name'])
    member.balance = data.get('balance', 0)
    
    # Add any additional attributes
    if 'merged_data' in data:
        setattr(member, 'merged_data', data['merged_data'])
    
    return member

if __name__ == '__main__':
    print(f"Flask application running. Access it at: http://localhost:10000")
    app.run(host='0.0.0.0', port=10000, debug=True) # Run the Flask app