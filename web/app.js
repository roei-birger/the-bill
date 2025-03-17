// TheBill Application - Frontend JavaScript

// Global application state
const TheBill = {
    groups: [],
    currentGroup: null,
    members: [],
    payments: []
};

// API Interface to communicate with Python backend
const API = {
    // Groups
    createGroup: async (name, adminFirstName, adminLastName) => {
        try {
            console.log("Creating group:", name, adminFirstName, adminLastName);
            const result = await eel.create_group(name, adminFirstName, adminLastName)();
            console.log("Create group response:", result);
            if (!result.success) throw new Error(result.error || "שגיאה לא ידועה ביצירת קבוצה");
            return result.group;
        } catch (error) {
            console.error("Error in createGroup:", error);
            throw error;
        }
    },
    
    loadGroups: async () => {
        try {
            console.log("Loading all groups...");
            const result = await eel.get_all_groups()();
            console.log("Load groups response:", result);
            if (!result.success) throw new Error(result.error || "שגיאה בטעינת קבוצות");
            TheBill.groups = result.groups || [];
            return TheBill.groups;
        } catch (error) {
            console.error("Error in loadGroups:", error);
            TheBill.groups = [];
            throw error;
        }
    },
    
    loadGroup: async (groupName) => {
        const result = await eel.get_group(groupName)();
        if (!result.success) throw new Error(result.error);
        TheBill.currentGroup = result.group;
        TheBill.members = result.group.members;
        TheBill.payments = result.group.payments;
        return result.group;
    },
    
    deleteGroup: async (groupName) => {
        const result = await eel.delete_group(groupName)();
        if (!result.success) throw new Error(result.error);
        return result.success;
    },
    
    // Members
    addMember: async (groupName, firstName, lastName) => {
        const result = await eel.add_member_to_group(groupName, firstName, lastName)();
        if (!result.success) throw new Error(result.error);
        return result.member;
    },
    
    editMember: async (groupName, oldFullName, newFirstName, newLastName) => {
        const result = await eel.edit_member(groupName, oldFullName, newFirstName, newLastName)();
        if (!result.success) throw new Error(result.error);
        return result.member;
    },
    
    removeMember: async (groupName, fullName) => {
        const result = await eel.remove_member(groupName, fullName)();
        if (!result.success) throw new Error(result.error);
        return result.success;
    },
    
    // Payments
    addPayment: async (groupName, title, amount, payerName, participants, description) => {
        const result = await eel.add_payment_to_group(groupName, title, amount, payerName, participants, description)();
        if (!result.success) throw new Error(result.error);
        return result.payment;
    },
    
    editPayment: async (groupName, paymentId, title, amount, payerName, participants, description) => {
        const result = await eel.edit_payment(groupName, paymentId, title, amount, payerName, participants, description)();
        if (!result.success) throw new Error(result.error);
        return result.payment;
    },
    
    deletePayment: async (groupName, paymentId) => {
        const result = await eel.delete_payment(groupName, paymentId)();
        if (!result.success) throw new Error(result.error);
        return result.success;
    },
    
    // Transfers and Balances
    getTransfers: async (groupName) => {
        const result = await eel.get_group_transfers(groupName)();
        if (!result.success) throw new Error(result.error);
        return result.transfers;
    },
    
    getMemberSummary: async (groupName, memberFullName) => {
        const result = await eel.get_member_summary(groupName, memberFullName)();
        if (!result.success) throw new Error(result.error);
        return result.summary;
    },
    
    exportGroupData: async (groupName, format) => {
        const result = await eel.export_group_data(groupName, format)();
        if (!result.success) throw new Error(result.error);
        return result.filepath;
    }
};

// UI Helper Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('he-IL', { 
        style: 'currency', 
        currency: 'ILS',
        maximumFractionDigits: 2
    }).format(amount);
}

function showError(message) {
    console.error("Error:", message);
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    } else {
        alert("שגיאה: " + message);
    }
}

function showSuccess(message) {
    console.log("Success:", message);
    const successContainer = document.getElementById('success-container');
    if (successContainer) {
        successContainer.textContent = message;
        successContainer.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            successContainer.style.display = 'none';
        }, 5000);
    } else {
        alert("הצלחה: " + message);
    }
}

// Screen Management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show requested screen
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.add('active');
    }
}

// Render Functions
function renderGroupsList() {
    const groupsList = document.getElementById('groups-list');
    if (!groupsList || !TheBill.groups) return;
    
    groupsList.innerHTML = '';
    
    if (TheBill.groups.length === 0) {
        groupsList.innerHTML = '<div class="card"><p class="text-center">אין קבוצות. צור קבוצה חדשה להתחלה.</p></div>';
        return;
    }
    
    TheBill.groups.forEach(group => {
        const groupItem = document.createElement('div');
        groupItem.className = 'group-item';
        groupItem.innerHTML = `
            <div class="group-item-info">
                <h4 class="group-name">${group.name}</h4>
                <div class="group-members">${group.members.length} חברים</div>
            </div>
        `;
        
        // Add click event to open group
        groupItem.addEventListener('click', () => loadGroup(group.name));
        
        groupsList.appendChild(groupItem);
    });
}

function renderMembers() {
    const membersList = document.getElementById('members-list');
    if (!membersList || !TheBill.members) return;
    
    membersList.innerHTML = '';
    
    if (TheBill.members.length === 0) {
        membersList.innerHTML = '<div class="card"><p class="text-center">אין חברים בקבוצה זו</p></div>';
        return;
    }
    
    TheBill.members.forEach(member => {
        const fullName = `${member.first_name} ${member.last_name}`;
        const initials = getInitials(fullName);
        const balanceClass = member.balance > 0 ? 'positive-balance' : 
                            member.balance < 0 ? 'negative-balance' : '';
        
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.innerHTML = `
            <div class="member-info">
                <div class="member-avatar">${initials}</div>
                <div>
                    <div class="member-name">${fullName}</div>
                    <div class="member-status">${member.first_name === TheBill.currentGroup?.admin_name ? 'מנהל' : ''}</div>
                </div>
            </div>
            <div class="member-balance ${balanceClass}">${formatCurrency(member.balance)}</div>
        `;
        
        // Add click event to view member details
        memberItem.addEventListener('click', () => loadMemberDetails(fullName));
        
        membersList.appendChild(memberItem);
    });
}

function renderPayments() {
    const paymentsList = document.getElementById('payments-list');
    if (!paymentsList || !TheBill.payments) return;
    
    paymentsList.innerHTML = '';
    
    if (TheBill.payments.length === 0) {
        paymentsList.innerHTML = '<div class="card"><p class="text-center">אין תשלומים בקבוצה זו</p></div>';
        return;
    }
    
    TheBill.payments.forEach(payment => {
        const paymentDate = new Date(payment.date);
        
        const paymentItem = document.createElement('div');
        paymentItem.className = 'payment-item';
        paymentItem.innerHTML = `
            <div class="payment-header">
                <div class="payment-title">${payment.title}</div>
                <div class="payment-amount">${formatCurrency(payment.amount)}</div>
            </div>
            <div class="payment-payer">שילם: ${payment.payer_name}</div>
            <div class="payment-date">${formatDate(payment.date)}</div>
        `;
        
        // Add click event to view payment details
        paymentItem.addEventListener('click', () => loadPaymentDetails(payment.id));
        
        paymentsList.appendChild(paymentItem);
    });
}

function renderGroupTransfers() {
    const transfersList = document.getElementById('transfers-list');
    if (!transfersList) return;
    
    transfersList.innerHTML = '';
    
    // Get transfers
    API.getTransfers(TheBill.currentGroup.name)
        .then(transfers => {
            if (!transfers || transfers.length === 0) {
                transfersList.innerHTML = '<div class="card"><p class="text-center">כל החשבונות מאוזנים. אין צורך בהעברות כספים.</p></div>';
                return;
            }
            
            // Create a card for all transfers
            const transfersCard = document.createElement('div');
            transfersCard.className = 'card';
            
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';
            cardHeader.innerHTML = '<h4 class="card-title">העברות מומלצות</h4>';
            transfersCard.appendChild(cardHeader);
            
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            
            // Add each transfer as an item in the card
            transfers.forEach(transfer => {
                const transferItem = document.createElement('div');
                transferItem.className = 'transfer-item';
                transferItem.innerHTML = `
                    <div class="transfer-from">${transfer.from}</div>
                    <div class="transfer-arrow">→</div>
                    <div class="transfer-to">${transfer.to}</div>
                    <div class="transfer-amount">${formatCurrency(transfer.amount)}</div>
                `;
                cardBody.appendChild(transferItem);
            });
            
            transfersCard.appendChild(cardBody);
            transfersList.appendChild(transfersCard);
        })
        .catch(error => {
            console.error("Error rendering transfers:", error);
            showError("שגיאה בטעינת העברות כספים. אנא נסה שנית.");
        });
}

// Format date to localized string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.charAt(0);
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load functions
async function loadGroup(groupName) {
    try {
        // Show loading indicator
        document.getElementById('loading-screen').style.display = 'flex';
        
        // Load group data
        const group = await API.loadGroup(groupName);
        
        // Update UI elements
        document.getElementById('group-name').textContent = groupName;
        
        // Render members and payments
        renderMembers();
        renderPayments();
        
        // Show group screen
        showScreen('group-screen');
        
        // Set the active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector('.tab-btn[data-tab="members"]').classList.add('active');
        document.getElementById('members-tab').classList.add('active');
        
    } catch (error) {
        console.error("Error loading group:", error);
        showError("שגיאה בטעינת הקבוצה");
    } finally {
        // Hide loading indicator
        document.getElementById('loading-screen').style.display = 'none';
    }
}

function loadMemberDetails(fullName) {
    const member = TheBill.members.find(m => `${m.first_name} ${m.last_name}` === fullName);
    if (!member) return;
    
    document.getElementById('member-name').textContent = fullName;
    document.getElementById('member-balance').textContent = formatCurrency(member.balance);
    document.getElementById('member-balance').className = 
        member.balance > 0 ? 'balance positive-balance' : 
        member.balance < 0 ? 'balance negative-balance' : 'balance';
    
    // Get member summary
    API.getMemberSummary(TheBill.currentGroup.name, fullName)
        .then(summary => {
            // Populate who to pay
            const paysToList = document.querySelector('#member-pays-to .transfers');
            paysToList.innerHTML = '';
            
            if (summary.transfers.pays_to.length === 0) {
                paysToList.innerHTML = '<li>אין תשלומים לשלם</li>';
            } else {
                summary.transfers.pays_to.forEach(transfer => {
                    const item = document.createElement('li');
                    item.innerHTML = `${transfer.to}: <strong>${formatCurrency(transfer.amount)}</strong>`;
                    paysToList.appendChild(item);
                });
            }
            
            // Populate who to receive from
            const receivesFromList = document.querySelector('#member-receives-from .transfers');
            receivesFromList.innerHTML = '';
            
            if (summary.transfers.receives_from.length === 0) {
                receivesFromList.innerHTML = '<li>אין תשלומים לקבל</li>';
            } else {
                summary.transfers.receives_from.forEach(transfer => {
                    const item = document.createElement('li');
                    item.innerHTML = `${transfer.from}: <strong>${formatCurrency(transfer.amount)}</strong>`;
                    receivesFromList.appendChild(item);
                });
            }
            
            // Populate payments
            const memberPayments = document.getElementById('member-payments');
            memberPayments.innerHTML = '';
            
            if (summary.related_payments.paid_by_member.length === 0) {
                memberPayments.innerHTML = '<div class="card"><p class="text-center">אין תשלומים</p></div>';
            } else {
                summary.related_payments.paid_by_member.forEach(payment => {
                    const paymentItem = document.createElement('div');
                    paymentItem.className = 'payment-item';
                    paymentItem.innerHTML = `
                        <div class="payment-header">
                            <div class="payment-title">${payment.title}</div>
                            <div class="payment-amount">${formatCurrency(payment.amount)}</div>
                        </div>
                        <div class="payment-date">${formatDate(payment.date)}</div>
                    `;
                    memberPayments.appendChild(paymentItem);
                });
            }
        })
        .catch(error => {
            console.error("Error loading member summary:", error);
            showError("שגיאה בטעינת פרטי החבר");
        });
    
    showScreen('member-screen');
}

function loadPaymentDetails(paymentId) {
    const payment = TheBill.payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    document.getElementById('payment-title').textContent = payment.title;
    document.getElementById('payment-amount').textContent = formatCurrency(payment.amount);
    document.getElementById('payment-payer').textContent = payment.payer_name;
    document.getElementById('payment-date').textContent = formatDate(payment.date);
    document.getElementById('payment-description').textContent = payment.description || 'אין תיאור';
    
    // Get payment breakdown
    API.getPaymentBreakdown(TheBill.currentGroup.name, paymentId)
        .then(breakdown => {
            document.getElementById('original-amount').textContent = formatCurrency(breakdown.original_amount);
            document.getElementById('rounded-amount').textContent = formatCurrency(breakdown.rounded_amount);
            document.getElementById('per-person-amount').textContent = formatCurrency(breakdown.amount_per_person);
            
            // Populate participants
            const participantList = document.getElementById('participant-list');
            participantList.innerHTML = '';
            
            breakdown.participants.forEach(participant => {
                const item = document.createElement('li');
                item.textContent = participant;
                participantList.appendChild(item);
            });
            
            // Populate transfers
            const transfersList = document.getElementById('payment-transfers');
            transfersList.innerHTML = '';
            
            if (breakdown.transfers.length === 0) {
                transfersList.innerHTML = '<li>אין העברות</li>';
            } else {
                breakdown.transfers.forEach(transfer => {
                    const item = document.createElement('li');
                    item.className = 'transfer-item';
                    item.innerHTML = `
                        <div class="transfer-from">${transfer.from}</div>
                        <div class="transfer-arrow">→</div>
                        <div class="transfer-to">${transfer.to}</div>
                        <div class="transfer-amount">${formatCurrency(transfer.amount)}</div>
                    `;
                    transfersList.appendChild(item);
                });
            }
        })
        .catch(error => {
            console.error("Error loading payment breakdown:", error);
        });
    
    showScreen('payment-screen');
}

// Initialize event listeners
function initializeEventListeners() {
    console.log("Initializing event listeners...");

    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Create group button - Make sure this works!
    const createGroupBtn = document.getElementById('create-group-btn');
    if (createGroupBtn) {
        console.log("Found create-group-btn, attaching event listener");
        createGroupBtn.addEventListener('click', function() {
            console.log("Create group button clicked");
            openModal('create-group-modal');
        });
    } else {
        console.error("Could not find create-group-btn element!");
    }

    // Group creation form
    const createGroupForm = document.getElementById('create-group-form');
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Create group form submitted");
            
            const groupName = document.getElementById('group-name-input').value;
            const adminFirstName = document.getElementById('admin-first-name').value;
            const adminLastName = document.getElementById('admin-last-name').value;
            
            try {
                await API.createGroup(groupName, adminFirstName, adminLastName);
                closeModal('create-group-modal');
                showSuccess(`הקבוצה "${groupName}" נוצרה בהצלחה`);
                
                // Reload groups and update UI
                await API.loadGroups();
                renderGroupsList();
                
                // Reset form
                document.getElementById('create-group-form').reset();
            } catch (error) {
                showError(error.message || "שגיאה ביצירת הקבוצה");
            }
        });
    } else {
        console.error("Could not find create-group-form element!");
    }

    // Add member
    document.getElementById('add-member-btn').addEventListener('click', () => {
        openModal('add-member-modal');
    });

    document.getElementById('add-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('first-name-input').value;
        const lastName = document.getElementById('last-name-input').value;
        
        try {
            await API.addMember(TheBill.currentGroup.name, firstName, lastName);
            closeModal('add-member-modal');
            showSuccess(`${firstName} ${lastName} נוסף לקבוצה בהצלחה`);
            
            // Reload current group and update UI
            await API.loadGroup(TheBill.currentGroup.name);
            renderMembers();
            
            // Reset form
            document.getElementById('add-member-form').reset();
        } catch (error) {
            showError(error.message || "שגיאה בהוספת החבר");
        }
    });

    // Add payment
    document.getElementById('add-payment-btn').addEventListener('click', () => {
        // Populate payer select
        const payerSelect = document.getElementById('payment-payer-select');
        payerSelect.innerHTML = '';
        
        // Add options for each member
        TheBill.members.forEach(member => {
            const option = document.createElement('option');
            option.value = `${member.first_name} ${member.last_name}`;
            option.textContent = `${member.first_name} ${member.last_name}`;
            payerSelect.appendChild(option);
        });
        
        // Populate participants checkboxes
        const participantsDiv = document.getElementById('payment-participants');
        participantsDiv.innerHTML = '';
        
        // Add checkbox for each member
        TheBill.members.forEach(member => {
            const memberName = `${member.first_name} ${member.last_name}`;
            
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `participant-${memberName}`;
            checkbox.name = 'participants';
            checkbox.value = memberName;
            checkbox.checked = true; // Default to checked
            
            const label = document.createElement('label');
            label.htmlFor = `participant-${memberName}`;
            label.textContent = memberName;
            
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);
            participantsDiv.appendChild(checkboxItem);
        });
        
        openModal('add-payment-modal');
    });

    document.getElementById('add-payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('payment-title-input').value;
        const amount = parseFloat(document.getElementById('payment-amount-input').value);
        const payerName = document.getElementById('payment-payer-select').value;
        const description = document.getElementById('payment-desc-input').value;
        
        // Get selected participants
        const participants = [];
        document.querySelectorAll('#payment-participants input[type="checkbox"]:checked').forEach(checkbox => {
            participants.push(checkbox.value);
        });
        
        if (participants.length === 0) {
            showError("יש לבחור לפחות משתתף אחד");
            return;
        }
        
        try {
            await API.addPayment(TheBill.currentGroup.name, title, amount, payerName, participants, description);
            closeModal('add-payment-modal');
            showSuccess(`התשלום "${title}" נוסף בהצלחה`);
            
            // Reload current group and update UI
            await API.loadGroup(TheBill.currentGroup.name);
            renderMembers();
            renderPayments();
            
            // Reset form
            document.getElementById('add-payment-form').reset();
        } catch (error) {
            showError(error.message || "שגיאה בהוספת התשלום");
        }
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to selected tab
            tab.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Load specific data for some tabs
            if (tabId === 'balance') {
                renderGroupTransfers();
            }
        });
    });

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(button => {
        button.addEventListener('click', () => {
            const targetScreen = button.getAttribute('data-target') || 'groups-screen';
            showScreen(targetScreen);
        });
    });

    // Export data button
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', async () => {
            const format = prompt("בחר פורמט לייצוא (json או csv):", "json").toLowerCase();
            
            if (format !== 'json' && format !== 'csv') {
                showError("פורמט לא תקין. יש לבחור json או csv");
                return;
            }
            
            try {
                const filepath = await API.exportGroupData(TheBill.currentGroup.name, format);
                showSuccess(`הנתונים יוצאו בהצלחה לקובץ: ${filepath}`);
            } catch (error) {
                showError(error.message || "שגיאה בייצוא הנתונים");
            }
        });
    }
}

// Application initialization
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded, initializing application...");
    
    try {
        // Show loading screen if it exists
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        } else {
            console.warn("Loading screen element not found!");
        }
        
        // Check if eel.js is loaded
        if (typeof eel === 'undefined') {
            throw new Error("eel.js is not loaded. Make sure the backend is running.");
        }
        
        console.log("Loading groups from backend...");
        // Load groups
        await API.loadGroups();
        console.log("Groups loaded:", TheBill.groups);
        renderGroupsList();
        
        // Initialize event listeners
        console.log("Setting up event listeners...");
        initializeEventListeners();
        
        // Apply dark mode preference
        if (typeof applyDarkModePreference === 'function') {
            applyDarkModePreference();
        }
        
        console.log("Application initialized successfully");
        
    } catch (error) {
        console.error("Error initializing app:", error);
        showError("שגיאה באתחול האפליקציה: " + (error.message || ""));
    } finally {
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
});

// Add missing API function
API.getPaymentBreakdown = async (groupName, paymentId) => {
    try {
        const result = await eel.get_payment_breakdown(groupName, paymentId)();
        if (!result.success) throw new Error(result.error || "שגיאה בטעינת פרטי תשלום");
        return result.breakdown;
    } catch (error) {
        console.error("Error getting payment breakdown:", error);
        throw error;
    }
};
