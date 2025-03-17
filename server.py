import eel
import os
import logging
from the_bill import (
    create_group, get_all_groups, get_group, add_member_to_group, add_payment_to_group,
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

# Set web files folder
web_folder = os.path.join(os.path.dirname(__file__), 'web')
eel.init(web_folder)

# Expose Python functions to JavaScript
eel.expose(create_group)
eel.expose(get_all_groups)
eel.expose(get_group)
eel.expose(add_member_to_group)
eel.expose(add_payment_to_group)
eel.expose(get_group_transfers)
eel.expose(get_member_summary)
eel.expose(export_group_data)

# Additional API functions
@eel.expose
def edit_member(group_name, old_full_name, new_first_name, new_last_name):
    from the_bill import TheBillApp
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    try:
        member = group.edit_member(old_full_name, new_first_name, new_last_name)
        app.save_data()
        return {'success': True, 'member': member.to_dict()}
    except ValueError as e:
        return {'success': False, 'error': str(e)}

@eel.expose
def remove_member(group_name, full_name):
    from the_bill import TheBillApp
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    try:
        success = group.remove_member(full_name)
        app.save_data()
        return {'success': True}
    except ValueError as e:
        return {'success': False, 'error': str(e)}

@eel.expose
def edit_payment(group_name, payment_id, title=None, amount=None, payer_name=None, 
                participants=None, description=None):
    from the_bill import TheBillApp
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    try:
        payment = group.edit_payment(payment_id, title, amount, payer_name, participants, description)
        app.save_data()
        return {'success': True, 'payment': payment.to_dict()}
    except ValueError as e:
        return {'success': False, 'error': str(e)}

@eel.expose
def delete_payment(group_name, payment_id):
    from the_bill import TheBillApp
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    try:
        success = group.delete_payment(payment_id)
        app.save_data()
        return {'success': True}
    except ValueError as e:
        return {'success': False, 'error': str(e)}

@eel.expose
def delete_group(group_name):
    from the_bill import TheBillApp
    app = TheBillApp()
    
    try:
        success = app.delete_group(group_name)
        return {'success': True}
    except ValueError as e:
        return {'success': False, 'error': str(e)}

@eel.expose
def get_payment_breakdown(group_name, payment_id):
    from the_bill import TheBillApp
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    try:
        breakdown = group.get_payment_breakdown(payment_id)
        return {'success': True, 'breakdown': breakdown}
    except ValueError as e:
        return {'success': False, 'error': str(e)}

@eel.expose
def set_permissions(group_name, member_full_name, can_add_payments):
    from the_bill import TheBillApp
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    try:
        group.set_permissions(member_full_name, can_add_payments)
        app.save_data()
        return {'success': True}
    except ValueError as e:
        return {'success': False, 'error': str(e)}

@eel.expose
def edit_group_name(old_name, new_name):
    """Edit a group's name"""
    logger.info(f"Editing group name: {old_name} -> {new_name}")
    
    from the_bill import TheBillApp
    app = TheBillApp()
    
    # Check if new name already exists
    if any(group.name == new_name for group in app.groups):
        logger.error(f"Cannot rename group: {new_name} already exists")
        return {'success': False, 'error': f"שם הקבוצה '{new_name}' כבר קיים"}
    
    # Find the group
    group = app._get_group_by_name(old_name)
    if not group:
        logger.error(f"Cannot rename group: {old_name} not found")
        return {'success': False, 'error': f"קבוצה '{old_name}' לא קיימת"}
    
    # Update the name
    group.name = new_name
    app.save_data()
    logger.info(f"Group renamed successfully: {old_name} -> {new_name}")
    return {'success': True}

@eel.expose
def merge_members(group_name, from_member, to_member, combined_name=None):
    """Merge one member into another, combining their transactions and balances."""
    logger.info(f"Merging members in {group_name}: {from_member} -> {to_member}")
    from the_bill import TheBillApp
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        logger.error(f"Group {group_name} not found for member merge")
        return {'success': False, 'error': f"Group {group_name} not found"}
    
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
            return {'success': False, 'error': f"Member {from_member} not found"}
        
        if not to_member_obj:
            logger.error(f"Member {to_member} not found for merge")
            return {'success': False, 'error': f"Member {to_member} not found"}
        
        logger.info(f"Found both members for merge: {from_member} (balance: {from_member_obj.balance}), {to_member} (balance: {to_member_obj.balance})")
        
        # Prepare the combined member name (default is "First1 + First2")
        if not combined_name:
            combined_name = f"{from_member} + {to_member}"
            
        # Split the combined name into first and last name for the member object
        name_parts = combined_name.split(' ', 1)
        new_first_name = name_parts[0]
        new_last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        # Store metadata about the merged members
        merged_members_data = {
            "original_members": [
                {"name": from_member, "balance": from_member_obj.balance},
                {"name": to_member, "balance": to_member_obj.balance}
            ]
        }
        
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
        new_member = member_from_data({
            'first_name': new_first_name,
            'last_name': new_last_name,
            'balance': combined_balance,
            'merged_data': merged_members_data  # Store metadata about merged members
        })
        
        group.members.append(new_member)
        logger.info(f"Created combined member: {combined_name} with balance: {combined_balance}")
        
        # Recalculate balances
        group._calculate_balances()
        
        # Save changes
        app.save_data()
        logger.info(f"Successfully merged members into: {combined_name}")
        
        return {'success': True}
    except Exception as e:
        logger.exception(f"Error merging members: {str(e)}")
        return {'success': False, 'error': str(e)}

# Helper function to create a member from data dict
def member_from_data(data):
    from the_bill import Member
    member = Member(data['first_name'], data['last_name'])
    member.balance = data.get('balance', 0)
    
    # Add any additional attributes
    if 'merged_data' in data:
        setattr(member, 'merged_data', data['merged_data'])
    
    return member

# Start the application
if __name__ == '__main__':
    try:
        logger.info("Starting TheBill application")
        # Start Eel with a specific page and port
        eel.start('index.html', size=(1000, 800), port=8080)
    except (SystemExit, MemoryError, KeyboardInterrupt):
        logger.info("TheBill application shutting down")
        # Handle when app is closed
        pass
