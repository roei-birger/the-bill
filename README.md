# TheBill - Shared Expense Management

An application for managing shared expenses in groups, with emphasis on minimizing money transfers between group members.

## Key Features

- **Group Management**: Create, edit and delete groups for shared expenses
- **Member Management**: Add, edit and remove group members
- **Payment Tracking**: Record payments made by group members
- **Smart Balance Calculation**: Automatically calculate balances and minimize required money transfers
- **Detailed Reports**: View detailed breakdown of expenses and transfers
- **Data Export**: Export financial data to JSON or CSV format
- **Member Merging**: Ability to merge members who represent a single economic unit (couple, family, etc.)

## Detailed User Guide

### Installation and Setup

1. Install Python 3.6 or higher (if not already installed)
2. Install required packages:
   ```
   pip install -r requirements.txt
   ```
3. Run the application:
   ```
   python server.py
   ```

### Creating a New Group

1. On the home screen, click "New Group"
2. Enter the group name and administrator details
3. Click "Create Group"

### Managing Members

1. Select a group from the group list
2. Go to the "Members" tab
3. **Adding a Member**:
   - Click "Add Member"
   - Enter first name and last name
   - Click "Add Member"
   
4. **Editing a Member**:
   - Click on the member you want to edit
   - Click "Edit"
   - Edit the details and click "Save Changes"
   
5. **Removing a Member**:
   - Click on the member you want to remove
   - Click "Remove" (only possible when the member's balance is 0)
   
6. **Merging Members**:
   - Drag one member toward another member
   - Confirm the merge action in the window that opens
   - The members will be merged into a single economic unit

### Managing Payments

1. Select a group from the group list
2. Go to the "Payments" tab
3. **Adding a Payment**:
   - Click "Add Payment"
   - Enter payment details (title, amount, who paid)
   - Mark the participants in the payment
   - Click "Add Payment"
   
4. **Viewing Payment Details**:
   - Click on the payment to view full details
   
5. **Editing a Payment**:
   - Click on the payment you want to edit
   - Click "Edit"
   - Change the details and click "Save Changes"
   
6. **Deleting a Payment**:
   - Click on the payment you want to delete
   - Click "Delete"

### Viewing Money Transfers and Balancing

1. Select a group from the group list
2. Go to the "Balance" tab
3. View the list of recommended transfers for complete balancing

### Exporting Data

1. Select a group from the group list
2. Go to the "Balance" tab
3. **Exporting Summary to Members**:
   - Click "Export Summary to Members"
   - The summary will be displayed in a separate window and can be copied to the clipboard
   
4. **Exporting Group Data**:
   - Click "Export Data"
   - Choose format (JSON or CSV)
   - The file will be saved in the data folder

### Editing Group Details

1. Select a group from the group list
2. Click the "Edit" button in the group header
3. Change the group name and click "Save Changes"

### Deleting a Group

1. Select a group from the group list
2. Click the "Delete" button in the group header
3. Confirm the deletion (only possible when all balances are zero)

## Technical Development

- **Front-end**: HTML, CSS, JavaScript
- **Back-end**: Python with Eel for JavaScript communication
- **Data storage**: Local JSON files

## License

This project is protected under the MIT license.
