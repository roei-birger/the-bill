# TheBill - Shared Expense Management

An application for managing shared expenses in groups, with emphasis on minimizing money transfers between group members.

## Key Features

- **Group Management**: Create, edit and delete groups for shared expenses
- **Member Management**: Add, edit and remove group members
- **Household Units**: Create economic units by grouping members (couples, families) whose debts and credits are combined
- **Payment Tracking**: Record payments made by group members
- **Smart Balance Calculation**: Automatically calculate balances and minimize required money transfers
- **Detailed Reports**: View detailed breakdown of expenses and transfers
- **Data Export**: Export financial data to JSON or CSV format, with dedicated export for household units
- **Modern Glass Morphism UI**: Beautiful gradient design with icon rain animation in header

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
   - Click "Remove"
   - The member will be removed along with all their payments and participant records
   
6. **Creating Household Units** (🏠 Family/Economic Units):
   - Drag one member toward another member
   - A creation window will open for a household unit
   - Enter an optional name for the unit (e.g., "Cohen Family") or leave for automatic name
   - Click "Create Household Unit"
   - **How it works**: When adding payments - you still select each member individually. In balance calculation - their debts are combined into one unit
   - The unit is displayed with a purple gradient background and 🏠 icon
   
7. **Deleting a Household Unit**:
   - Click the red X button in the household unit container
   - The members will return to being independent individuals

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
4. Household units are displayed with 🏠 icon in the transfer list

### Exporting Data

1. Select a group from the group list
2. Go to the "Balance" tab
3. **Exporting Summary to Members**:
   - Click "Export Summary to Members"
   - The summary displays household units with their combined balances
   - Example format:
     ```
     📊 Summary for Group: Independence Day 2025 📊
     
     👤 Noa and Roei
     💸 Balance: -32.00 ₪ (to pay)
     📥 Total paid: 25.00 ₪
     📤 To pay:
        • To Avital: 32.00 ₪
     ```
   - The summary can be copied to clipboard
   
4. **Exporting Household Unit Summary**:
   - In the "Balance" tab, dedicated export buttons appear for each household unit
   - Click "Export Summary: [Household Name]"
   - A dedicated summary for that household will be displayed with detailed breakdown
   
5. **Exporting Group Data**:
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

- **Front-end**: HTML5, CSS3 with Glass Morphism design, Vanilla JavaScript
- **Back-end**: Python with Flask REST API
- **Data storage**: Local JSON files with automatic persistence
- **Features**: 
  - Drag & Drop API for household creation
  - Async/await for smooth data loading
  - Icon rain animation in header (💵💰🍕🍺🎉 and more)
  - Responsive design with gradient backgrounds
  - Real-time balance calculations with household aggregation

## License

This project is protected under the MIT license.
