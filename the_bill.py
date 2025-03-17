import json
import os
import csv
import math
from datetime import datetime
from typing import List, Dict, Tuple, Set, Optional


class Member:
    def __init__(self, first_name: str, last_name: str):
        self.first_name = first_name
        self.last_name = last_name
        self.balance = 0  # Positive means they're owed money, negative means they owe

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def to_dict(self) -> dict:
        return {
            'first_name': self.first_name,
            'last_name': self.last_name,
            'balance': self.balance
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'Member':
        member = cls(data['first_name'], data['last_name'])
        member.balance = data.get('balance', 0)
        return member


class Payment:
    def __init__(self, title: str, amount: float, payer_name: str, participants: List[str], description: str = ""):
        self.title = title
        self.amount = amount
        self.payer_name = payer_name  # Full name of the member who paid
        self.participants = participants  # List of full names of participants
        self.description = description
        self.date = datetime.now()
        self.id = self._generate_id()

    def _generate_id(self) -> str:
        """Generate a unique ID for the payment based on timestamp and title"""
        timestamp = int(self.date.timestamp())
        return f"{timestamp}-{self.title.replace(' ', '-')}"

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'amount': self.amount,
            'payer_name': self.payer_name,
            'participants': self.participants,
            'description': self.description,
            'date': self.date.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'Payment':
        payment = cls(
            data['title'],
            data['amount'],
            data['payer_name'],
            data['participants'],
            data.get('description', '')
        )
        payment.id = data['id']
        payment.date = datetime.fromisoformat(data['date'])
        return payment


class Group:
    def __init__(self, name: str, admin_name: str = None):
        self.name = name
        self.members: List[Member] = []
        self.payments: List[Payment] = []
        self.admin_name = admin_name  # Full name of the group admin
        self.any_member_can_add_payments = True  # Default permission setting
        self.permissions: Dict[str, bool] = {}  # Permissions for each member

    def set_permissions(self, member_full_name: str, can_add_payments: bool) -> None:
        """Set permissions for a member"""
        member = self._get_member_by_name(member_full_name)
        if not member:
            raise ValueError(f"Member {member_full_name} not found")
        self.permissions[member_full_name] = can_add_payments

    def can_add_payments(self, member_full_name: str) -> bool:
        """Check if a member can add payments"""
        return self.permissions.get(member_full_name, self.any_member_can_add_payments)

    def add_member(self, first_name: str, last_name: str) -> Member:
        """Add a new member to the group"""
        member = Member(first_name, last_name)
        
        # Check if member with same name already exists
        if any(m.full_name == member.full_name for m in self.members):
            raise ValueError(f"Member {member.full_name} already exists in the group")
            
        self.members.append(member)
        
        # If this is the first member and no admin was specified, make them admin
        if self.admin_name is None and len(self.members) == 1:
            self.admin_name = member.full_name
            
        return member

    def edit_member(self, old_full_name: str, new_first_name: str, new_last_name: str) -> Member:
        """Edit member details"""
        # Find the member
        member = self._get_member_by_name(old_full_name)
        if not member:
            raise ValueError(f"Member {old_full_name} not found")

        new_full_name = f"{new_first_name} {new_last_name}"
        
        # Check if the new name would conflict with an existing member
        if old_full_name != new_full_name and any(m.full_name == new_full_name for m in self.members):
            raise ValueError(f"Member {new_full_name} already exists in the group")
            
        # Update names
        member.first_name = new_first_name
        member.last_name = new_last_name
        
        # Update admin name if this member is the admin
        if self.admin_name == old_full_name:
            self.admin_name = member.full_name
            
        # Update references in payments
        for payment in self.payments:
            if payment.payer_name == old_full_name:
                payment.payer_name = member.full_name
                
            # Update participant names
            if old_full_name in payment.participants:
                payment.participants = [member.full_name if p == old_full_name else p for p in payment.participants]
                
        return member

    def remove_member(self, full_name: str) -> bool:
        """Remove a member from the group if they have no debts/credits"""
        member = self._get_member_by_name(full_name)
        if not member:
            raise ValueError(f"Member {full_name} not found")
            
        # Calculate current balance for the member
        self._calculate_balances()
            
        # Check if the member has a non-zero balance
        if member.balance != 0:
            raise ValueError(f"Cannot remove member {full_name} because they have an outstanding balance of {member.balance}")
            
        # Remove the member
        self.members.remove(member)
        
        # If the admin was removed, assign a new admin if possible
        if self.admin_name == full_name and self.members:
            self.admin_name = self.members[0].full_name
            
        return True

    def add_payment(self, title: str, amount: float, payer_name: str, participant_names: List[str], description: str = "") -> Payment:
        """Add a new payment to the group"""
        if not self.can_add_payments(payer_name):
            raise PermissionError(f"Member {payer_name} does not have permission to add payments")
        # Verify the payer exists
        payer = self._get_member_by_name(payer_name)
        if not payer:
            raise ValueError(f"Payer {payer_name} not found in the group")
            
        # Verify all participants exist
        for participant_name in participant_names:
            if not self._get_member_by_name(participant_name):
                raise ValueError(f"Participant {participant_name} not found in the group")
                
        # Create and add the payment
        payment = Payment(title, amount, payer_name, participant_names, description)
        self.payments.append(payment)
        
        # Recalculate balances
        self._calculate_balances()
        
        return payment

    def edit_payment(self, payment_id: str, title: str = None, amount: float = None, 
                    payer_name: str = None, participant_names: List[str] = None, 
                    description: str = None) -> Payment:
        """Edit an existing payment"""
        # Find the payment
        payment = self._get_payment_by_id(payment_id)
        if not payment:
            raise ValueError(f"Payment with ID {payment_id} not found")
            
        # Update payment details if provided
        if title is not None:
            payment.title = title
            
        if amount is not None:
            payment.amount = amount
            
        if payer_name is not None:
            # Verify the payer exists
            if not self._get_member_by_name(payer_name):
                raise ValueError(f"Payer {payer_name} not found in the group")
            payment.payer_name = payer_name
            
        if participant_names is not None:
            # Verify all participants exist
            for participant_name in participant_names:
                if not self._get_member_by_name(participant_name):
                    raise ValueError(f"Participant {participant_name} not found in the group")
            payment.participants = participant_names
            
        if description is not None:
            payment.description = description
            
        # Recalculate balances
        self._calculate_balances()
        
        return payment

    def delete_payment(self, payment_id: str) -> bool:
        """Delete a payment by ID"""
        payment = self._get_payment_by_id(payment_id)
        if not payment:
            raise ValueError(f"Payment with ID {payment_id} not found")
            
        self.payments.remove(payment)
        
        # Recalculate balances
        self._calculate_balances()
        
        return True

    def _get_member_by_name(self, full_name: str) -> Optional[Member]:
        """Find a member by their full name"""
        for member in self.members:
            if member.full_name == full_name:
                return member
        return None

    def _get_payment_by_id(self, payment_id: str) -> Optional[Payment]:
        """Find a payment by its ID"""
        for payment in self.payments:
            if payment.id == payment_id:
                return payment
        return None

    def _round_up_for_division(self, amount: float, divisor: int) -> float:
        """Round up the amount to be evenly divisible by the divisor"""
        if divisor <= 0:
            return amount
            
        # Find the remainder when divided
        remainder = amount % divisor
        
        if remainder == 0:
            # Already evenly divisible
            return amount
        else:
            # Round up to the next evenly divisible number
            return amount + (divisor - remainder)

    def _calculate_balances(self) -> None:
        """Calculate current balances for all members based on payments"""
        # Reset all balances
        for member in self.members:
            member.balance = 0
            
        # Process each payment
        for payment in self.payments:
            payer = self._get_member_by_name(payment.payer_name)
            if not payer:
                continue  # Skip if payer not found
                
            participant_count = len(payment.participants)
            if participant_count == 0:
                continue  # Skip if no participants
                
            # Round up the amount to be evenly divisible by number of participants
            rounded_amount = self._round_up_for_division(payment.amount, participant_count)
            amount_per_person = rounded_amount / participant_count
            
            # Add the full amount to the payer's balance
            payer.balance += rounded_amount
            
            # Subtract each participant's share from their balance
            for participant_name in payment.participants:
                participant = self._get_member_by_name(participant_name)
                if participant:
                    participant.balance -= amount_per_person

    def calculate_minimized_transfers(self) -> List[Dict]:
        """Calculate transfers that minimize number of transactions"""
        # First calculate balances
        self._calculate_balances()
        
        # Separate members into those who need to pay and those who need to receive
        payers = []  # Members who have negative balance (need to pay)
        receivers = []  # Members who have positive balance (need to receive)
        
        for member in self.members:
            if member.balance < -0.01:  # Using a threshold to handle floating point errors
                payers.append((member.full_name, abs(member.balance)))
            elif member.balance > 0.01:
                receivers.append((member.full_name, member.balance))
        
        # Sort both lists by amount (largest first)
        payers.sort(key=lambda x: x[1], reverse=True)
        receivers.sort(key=lambda x: x[1], reverse=True)
        
        transfers = []
        
        # Process all debts
        i, j = 0, 0
        while i < len(payers) and j < len(receivers):
            payer_name, payer_amount = payers[i]
            receiver_name, receiver_amount = receivers[j]
            
            # Determine the transfer amount (minimum of what the payer owes and what the receiver is owed)
            transfer_amount = round(min(payer_amount, receiver_amount), 2)
            
            # Add this transfer
            transfers.append({
                "from": payer_name,
                "to": receiver_name,
                "amount": transfer_amount
            })
            
            # Update remaining amounts
            payers[i] = (payer_name, round(payer_amount - transfer_amount, 2))
            receivers[j] = (receiver_name, round(receiver_amount - transfer_amount, 2))
            
            # If a payer has paid all they owe, move to next payer
            if payers[i][1] < 0.01:
                i += 1
                
            # If a receiver has received all they're owed, move to next receiver
            if receivers[j][1] < 0.01:
                j += 1
        
        return transfers

    def get_payment_breakdown(self, payment_id: str) -> Dict:
        """Get detailed breakdown of a specific payment"""
        payment = self._get_payment_by_id(payment_id)
        if not payment:
            raise ValueError(f"Payment with ID {payment_id} not found")
            
        participant_count = len(payment.participants)
        rounded_amount = self._round_up_for_division(payment.amount, participant_count)
        amount_per_person = rounded_amount / participant_count if participant_count > 0 else 0
        
        breakdown = {
            "payment_details": payment.to_dict(),
            "original_amount": payment.amount,
            "rounded_amount": rounded_amount,
            "amount_per_person": amount_per_person,
            "participants": payment.participants,
            "payer": payment.payer_name,
            "transfers": []
        }
        
        # Calculate transfers for this specific payment
        for participant_name in payment.participants:
            if participant_name != payment.payer_name:
                breakdown["transfers"].append({
                    "from": participant_name,
                    "to": payment.payer_name,
                    "amount": amount_per_person
                })
        
        return breakdown

    def get_member_financial_summary(self, full_name: str) -> Dict:
        """Get detailed financial summary for a specific member"""
        member = self._get_member_by_name(full_name)
        if not member:
            raise ValueError(f"Member {full_name} not found")
            
        # Ensure balances are up to date
        self._calculate_balances()
        
        # Get all minimized transfers
        all_transfers = self.calculate_minimized_transfers()
        
        # Filter transfers where this member is involved
        member_transfers = {
            "pays_to": [],  # Who this member needs to pay
            "receives_from": []  # Who this member receives money from
        }
        
        for transfer in all_transfers:
            if transfer["from"] == full_name:
                member_transfers["pays_to"].append({
                    "to": transfer["to"],
                    "amount": transfer["amount"]
                })
            elif transfer["to"] == full_name:
                member_transfers["receives_from"].append({
                    "from": transfer["from"],
                    "amount": transfer["amount"]
                })
        
        # Get payments where the member is involved
        related_payments = {
            "paid_by_member": [],  # Payments made by this member
            "involving_member": []  # Payments where this member is a participant
        }
        
        for payment in self.payments:
            payment_dict = payment.to_dict()
            
            if payment.payer_name == full_name:
                related_payments["paid_by_member"].append(payment_dict)
                
            if full_name in payment.participants:
                related_payments["involving_member"].append(payment_dict)
        
        return {
            "member": member.to_dict(),
            "balance": member.balance,
            "transfers": member_transfers,
            "related_payments": related_payments
        }

    def export_to_json(self, filepath: str) -> str:
        """Export group data to a JSON file"""
        data = {
            "name": self.name,
            "admin_name": self.admin_name,
            "any_member_can_add_payments": self.any_member_can_add_payments,
            "members": [member.to_dict() for member in self.members],
            "payments": [payment.to_dict() for payment in self.payments],
            "transfers": self.calculate_minimized_transfers(),
            "export_date": datetime.now().isoformat(),
            "permissions": self.permissions,
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        return filepath

    def export_to_csv(self, filepath: str) -> str:
        """Export group transfers to a CSV file"""
        transfers = self.calculate_minimized_transfers()
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['From', 'To', 'Amount'])
            
            for transfer in transfers:
                writer.writerow([transfer['from'], transfer['to'], transfer['amount']])
                
        return filepath

    def to_dict(self) -> dict:
        """Convert group to dictionary for storage"""
        return {
            'name': self.name,
            'admin_name': self.admin_name,
            'any_member_can_add_payments': self.any_member_can_add_payments,
            'members': [member.to_dict() for member in self.members],
            'payments': [payment.to_dict() for payment in self.payments],
            'permissions': self.permissions,
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'Group':
        """Create a group from dictionary data"""
        group = cls(data['name'], data.get('admin_name'))
        group.any_member_can_add_payments = data.get('any_member_can_add_payments', True)
        
        # Add members
        for member_data in data.get('members', []):
            member = Member.from_dict(member_data)
            group.members.append(member)
            
        # Add payments
        for payment_data in data.get('payments', []):
            payment = Payment.from_dict(payment_data)
            group.payments.append(payment)
            
        # Calculate balances
        group._calculate_balances()
        
        group.permissions = data.get('permissions', {})
        
        return group


class TheBillApp:
    def __init__(self, storage_dir: str = None):
        self.groups: List[Group] = []
        self.storage_dir = storage_dir or os.path.join(os.path.dirname(__file__), 'data')
        os.makedirs(self.storage_dir, exist_ok=True)
        self.load_data()

    def create_group(self, name: str, admin_first_name: str = None, admin_last_name: str = None) -> Group:
        """Create a new group"""
        # Check if group with same name already exists
        if any(g.name == name for g in self.groups):
            raise ValueError(f"Group {name} already exists")
            
        group = Group(name)
        
        # Add admin as first member if provided
        if admin_first_name and admin_last_name:
            admin_member = group.add_member(admin_first_name, admin_last_name)
            group.admin_name = admin_member.full_name
            
        self.groups.append(group)
        self.save_data()
        
        return group

    def delete_group(self, group_name: str) -> bool:
        """Delete a group if all balances are settled"""
        group = self._get_group_by_name(group_name)
        if not group:
            raise ValueError(f"Group {group_name} not found")
            
        # Ensure balances are up to date
        group._calculate_balances()
        
        # Check if all balances are zero
        if any(abs(member.balance) > 0.01 for member in group.members):
            raise ValueError(f"Cannot delete group {group_name} because there are outstanding balances")
            
        self.groups.remove(group)
        self.save_data()
        
        return True

    def _get_group_by_name(self, name: str) -> Optional[Group]:
        """Find a group by name"""
        for group in self.groups:
            if group.name == name:
                return group
        return None

    def save_data(self) -> None:
        """Save all groups data to storage"""
        data = {
            'groups': [group.to_dict() for group in self.groups],
            'last_updated': datetime.now().isoformat()
        }
        
        filepath = os.path.join(self.storage_dir, 'thebill_data.json')
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def load_data(self) -> None:
        """Load groups data from storage"""
        filepath = os.path.join(self.storage_dir, 'thebill_data.json')
        if not os.path.exists(filepath):
            return
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            self.groups = [Group.from_dict(group_data) for group_data in data.get('groups', [])]
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Error loading data: {e}")


# Create API functions for JavaScript to call

def create_group(name: str, admin_first_name: str = None, admin_last_name: str = None) -> dict:
    app = TheBillApp()
    group = app.create_group(name, admin_first_name, admin_last_name)
    return {'success': True, 'group': group.to_dict()}

def get_all_groups() -> dict:
    app = TheBillApp()
    return {'success': True, 'groups': [group.to_dict() for group in app.groups]}

def get_group(group_name: str) -> dict:
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    return {'success': True, 'group': group.to_dict()}

def add_member_to_group(group_name: str, first_name: str, last_name: str) -> dict:
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    try:
        member = group.add_member(first_name, last_name)
        app.save_data()
        return {'success': True, 'member': member.to_dict()}
    except ValueError as e:
        return {'success': False, 'error': str(e)}

def add_payment_to_group(group_name: str, title: str, amount: float, payer_name: str, 
                         participants: List[str], description: str = "") -> dict:
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    try:
        payment = group.add_payment(title, amount, payer_name, participants, description)
        app.save_data()
        return {'success': True, 'payment': payment.to_dict()}
    except ValueError as e:
        return {'success': False, 'error': str(e)}

def get_group_transfers(group_name: str) -> dict:
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    transfers = group.calculate_minimized_transfers()
    return {'success': True, 'transfers': transfers}

def get_member_summary(group_name: str, member_full_name: str) -> dict:
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    try:
        summary = group.get_member_financial_summary(member_full_name)
        return {'success': True, 'summary': summary}
    except ValueError as e:
        return {'success': False, 'error': str(e)}

def export_group_data(group_name: str, format_type: str, filepath: str = None) -> dict:
    app = TheBillApp()
    group = app._get_group_by_name(group_name)
    if not group:
        return {'success': False, 'error': f"Group {group_name} not found"}
    
    if filepath is None:
        # Create default filepath in data directory
        os.makedirs(app.storage_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(app.storage_dir, f"{group_name}_{timestamp}.{format_type}")
    
    try:
        if format_type.lower() == 'json':
            output_path = group.export_to_json(filepath)
        elif format_type.lower() == 'csv':
            output_path = group.export_to_csv(filepath)
        else:
            return {'success': False, 'error': f"Unsupported export format: {format_type}"}
        
        return {'success': True, 'filepath': output_path}
    except Exception as e:
        return {'success': False, 'error': str(e)}


if __name__ == "__main__":
    # Simple test of functionality
    app = TheBillApp()
    
    # Check if the test group already exists
    test_group = app._get_group_by_name("Test Group")
    if not test_group:
        # Create a test group if it doesn't exist
        test_group = app.create_group("Test Group", "John", "Doe")
    
    # Add members
    try:
        test_group.add_member("Jane", "Smith")
    except ValueError:
        print("Member Jane Smith already exists")
    
    try:
        test_group.add_member("Bob", "Johnson")
    except ValueError:
        print("Member Bob Johnson already exists")
    
    # Add payments
    try:
        test_group.add_payment("Dinner", 300, "John Doe", ["John Doe", "Jane Smith", "Bob Johnson"], "Restaurant dinner")
    except ValueError:
        print("Payment Dinner already exists")
    
    try:
        test_group.add_payment("Groceries", 250, "Jane Smith", ["John Doe", "Jane Smith"], "Weekly groceries")
    except ValueError:
        print("Payment Groceries already exists")
    
    # Calculate transfers
    transfers = test_group.calculate_minimized_transfers()
    print("Minimized transfers:", transfers)
    
    # Export data
    test_group.export_to_json("test_export.json")
    
    print("Test completed successfully.")
