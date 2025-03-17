# TheBill - ניהול הוצאות משותפות

TheBill is an application for managing shared expenses within groups, similar to Splitwise, but with a focus on minimizing financial transfers between members.

## Features

- **Group Management**: Create and manage groups for shared expenses
- **Member Management**: Add, edit, and remove group members
- **Payment Tracking**: Track payments made by group members
- **Smart Balance Calculation**: Automatically calculate balances and minimize necessary transfers
- **Detailed Reports**: View detailed breakdowns of expenses and transfers
- **Export Data**: Export financial data to JSON or CSV formats

## Technical Details

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python with Eel for JavaScript communication
- **Data Storage**: Local JSON files (no external database required)
- **UI Languages**: Hebrew (RTL)

## Installation

1. Install Python 3.6+ if not already installed
2. Install required packages:
   ```
   pip install eel
   ```
3. Clone or download this repository

## Running the Application

1. Navigate to the application folder
2. Run the server:
   ```
   python server.py
   ```
3. The application will open in your default web browser

## Usage Instructions

### Create a Group
1. Click "קבוצה חדשה" (New Group) on the home page
2. Enter the group name and administrator details
3. Click "צור קבוצה" (Create Group)

### Add Members
1. Open your group
2. Click "הוספת חבר" (Add Member)
3. Enter the member's first and last name
4. Click "הוסף חבר" (Add Member)

### Add a Payment
1. Open your group
2. Click "תשלום חדש" (New Payment)
3. Enter payment details including:
   - Title
   - Amount
   - Who paid
   - Who the payment applies to
   - Optional description
4. Click "הוסף תשלום" (Add Payment)

### View Balance and Transfers
1. Open your group
2. Click on the "איזון" (Balance) tab
3. View the recommended transfers to settle all debts

## License

This project is licensed under the MIT License.
