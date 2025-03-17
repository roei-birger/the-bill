import eel
import os
from the_bill import (
    create_group, get_all_groups, get_group, add_member_to_group, add_payment_to_group,
    get_group_transfers, get_member_summary, export_group_data
)

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

# Start the application
if __name__ == '__main__':
    try:
        # Start Eel with a specific page and port
        eel.start('index.html', size=(1000, 800), port=8080)
    except (SystemExit, MemoryError, KeyboardInterrupt):
        # Handle when app is closed
        pass
