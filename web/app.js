// TheBill Application - Frontend JavaScript

// Global application state
const TheBill = {
    groups: [],
    currentGroup: null,
    members: [],
    payments: []
};

// API Interface to communicate with Flask backend
const API = {
    // Groups
    createGroup: async (name, adminFirstName, adminLastName) => {
        try {
            console.log("Creating group:", name, adminFirstName, adminLastName);
            const response = await fetch('/api/create_group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    admin_first_name: adminFirstName,
                    admin_last_name: adminLastName
                }),
            });
            
            const result = await response.json();
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
            const response = await fetch('/api/get_all_groups');
            const result = await response.json();
            
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
        const response = await fetch(`/api/get_group/${encodeURIComponent(groupName)}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        TheBill.currentGroup = result.group;
        TheBill.members = result.group.members;
        TheBill.payments = result.group.payments;
        return result.group;
    },
    
    deleteGroup: async (groupName) => {
        const response = await fetch('/api/delete_group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                group_name: groupName
            }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.success;
    },
    
    editGroupName: async (oldName, newName) => {
        try {
            console.log("Editing group name:", {oldName, newName});
            const response = await fetch('/api/edit_group_name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    old_name: oldName,
                    new_name: newName
                }),
            });
            
            const result = await response.json();
            console.log("Edit group name response:", result);
            if (!result.success) throw new Error(result.error || "שגיאה בעדכון שם הקבוצה");
            
            // Update TheBill.currentGroup
            if (TheBill.currentGroup && TheBill.currentGroup.name === oldName) {
                TheBill.currentGroup.name = newName;
            }
            
            return true;
        } catch (error) {
            console.error("Error in editGroupName:", error);
            throw error;
        }
    },
    
    // Members
    addMember: async (groupName, firstName, lastName) => {
        const response = await fetch('/api/add_member_to_group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                group_name: groupName,
                first_name: firstName,
                last_name: lastName
            }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.member;
    },
    
    editMember: async (groupName, oldFullName, newFirstName, newLastName) => {
        const response = await fetch('/api/edit_member', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                group_name: groupName,
                old_full_name: oldFullName,
                new_first_name: newFirstName,
                new_last_name: newLastName
            }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.member;
    },
    
    removeMember: async (groupName, fullName) => {
        const response = await fetch('/api/remove_member', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                group_name: groupName,
                full_name: fullName
            }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.success;
    },
    
    mergeMembers: async (groupName, fromMember, toMember, combinedName = null) => {
        try {
            console.log("Merging members:", {groupName, fromMember, toMember, combinedName});
            const response = await fetch('/api/merge_members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    group_name: groupName,
                    from_member: fromMember,
                    to_member: toMember,
                    combined_name: combinedName
                }),
            });
            
            const result = await response.json();
            console.log("Merge members response:", result);
            if (!result.success) throw new Error(result.error || "שגיאה באיחוד החברים");
            return true;
        } catch (error) {
            console.error("Error in mergeMembers:", error);
            throw error;
        }
    },
    
    // Payments
    addPayment: async (groupName, title, amount, payerName, participants, description) => {
        const response = await fetch('/api/add_payment_to_group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                group_name: groupName,
                title,
                amount,
                payer_name: payerName,
                participants,
                description
            }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.payment;
    },
    
    editPayment: async (groupName, paymentId, title, amount, payerName, participants, description) => {
        try {
            console.log("Editing payment:", {groupName, paymentId, title, amount, payerName, participants, description});
            const response = await fetch('/api/edit_payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    group_name: groupName,
                    payment_id: paymentId,
                    title,
                    amount,
                    payer_name: payerName,
                    participants,
                    description
                }),
            });
            
            const result = await response.json();
            console.log("Edit payment response:", result);
            if (!result.success) throw new Error(result.error || "שגיאה בעדכון התשלום");
            return result.payment;
        } catch (error) {
            console.error("Error in editPayment:", error);
            throw error;
        }
    },
    
    deletePayment: async (groupName, paymentId) => {
        const response = await fetch('/api/delete_payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                group_name: groupName,
                payment_id: paymentId
            }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.success;
    },
    
    getPaymentBreakdown: async (groupName, paymentId) => {
        try {
            const response = await fetch('/api/get_payment_breakdown', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    group_name: groupName,
                    payment_id: paymentId
                }),
            });
            
            const result = await response.json();
            if (!result.success) throw new Error(result.error || "שגיאה בטעינת פרטי תשלום");
            return result.breakdown;
        } catch (error) {
            console.error("Error getting payment breakdown:", error);
            throw error;
        }
    },
    
    // Transfers and Balances
    getTransfers: async (groupName) => {
        const response = await fetch(`/api/get_group_transfers/${encodeURIComponent(groupName)}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.transfers;
    },
    
    getMemberSummary: async (groupName, memberFullName) => {
        const response = await fetch('/api/get_member_summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                group_name: groupName,
                member_full_name: memberFullName
            }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.summary;
    },
    
    exportGroupData: async (groupName, format) => {
        const response = await fetch('/api/export_group_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                group_name: groupName,
                format
            }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.filepath;
    },
    
    // Permissions
    setPermissions: async (groupName, memberFullName, canAddPayments) => {
        try {
            console.log("Setting permissions:", {groupName, memberFullName, canAddPayments});
            const response = await fetch('/api/set_permissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    group_name: groupName,
                    member_full_name: memberFullName,
                    can_add_payments: canAddPayments
                }),
            });
            
            const result = await response.json();
            console.log("Set permissions response:", result);
            if (!result.success) throw new Error(result.error || "שגיאה בהגדרת הרשאות");
            return true;
        } catch (error) {
            console.error("Error in setPermissions:", error);
            throw error;
        }
    },
    
    // Households
    createHousehold: async (groupName, memberFullNames, name = '') => {
        try {
            console.log("Creating household:", {groupName, memberFullNames, name});
            const response = await fetch('/api/create_household', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    group_name: groupName,
                    member_full_names: memberFullNames,
                    name: name
                }),
            });
            
            const result = await response.json();
            console.log("Create household response:", result);
            if (!result.success) throw new Error(result.error || "שגיאה ביצירת תא משפחתי");
            return result.household;
        } catch (error) {
            console.error("Error in createHousehold:", error);
            throw error;
        }
    },
    
    deleteHousehold: async (groupName, householdId) => {
        try {
            console.log("Deleting household:", {groupName, householdId});
            const response = await fetch('/api/delete_household', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    group_name: groupName,
                    household_id: householdId
                }),
            });
            
            const result = await response.json();
            console.log("Delete household response:", result);
            if (!result.success) throw new Error(result.error || "שגיאה במחיקת תא משפחתי");
            return true;
        } catch (error) {
            console.error("Error in deleteHousehold:", error);
            throw error;
        }
    },
    
    getHouseholds: async (groupName) => {
        try {
            console.log("Getting households for group:", groupName);
            const response = await fetch(`/api/get_households/${encodeURIComponent(groupName)}`);
            const result = await response.json();
            
            console.log("Get households response:", result);
            if (!result.success) throw new Error(result.error || "שגיאה בטעינת תאים משפחתיים");
            return result.households || [];
        } catch (error) {
            console.error("Error in getHouseholds:", error);
            return [];
        }
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
        
        // Add confetti effect
        createConfetti();
        
        // Hide after 5 seconds
        setTimeout(() => {
            successContainer.style.display = 'none';
        }, 5000);
    } else {
        alert("הצלחה: " + message);
    }
}

// Create confetti effect
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#fa709a', '#fee140'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const left = Math.random() * window.innerWidth;
        const animationDuration = Math.random() * 3 + 2;
        const rotation = Math.random() * 360;
        
        confetti.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${left}px;
            top: -20px;
            z-index: 10000;
            pointer-events: none;
            opacity: 1;
            transform: rotate(${rotation}deg);
            animation: confettiFall ${animationDuration}s ease-out forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), animationDuration * 1000);
    }
}

// Add confetti animation
if (!document.getElementById('confetti-style')) {
    const confettiStyle = document.createElement('style');
    confettiStyle.id = 'confetti-style';
    confettiStyle.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(${window.innerHeight + 100}px) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(confettiStyle);
}

// Revert showScreen to the original implementation
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
    
    TheBill.groups.forEach((group, index) => {
        const groupItem = document.createElement('div');
        groupItem.className = 'group-item';
        groupItem.style.animationDelay = `${index * 0.1}s`;
        groupItem.style.animation = 'fadeInUp 0.5s ease-out forwards';
        groupItem.innerHTML = `
            <div class="group-item-info">
                <h4 class="group-name">${group.name}</h4>
                <div class="group-members">${group.members.length} חברים</div>
            </div>
        `;
        
        // Add click event to open group
        groupItem.addEventListener('click', () => {
            groupItem.style.transform = 'scale(0.95)';
            setTimeout(() => loadGroup(group.name), 150);
        });
        
        // Add 3D tilt effect on mouse move
        groupItem.addEventListener('mousemove', (e) => {
            const rect = groupItem.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            groupItem.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(-5px)`;
        });
        
        groupItem.addEventListener('mouseleave', () => {
            groupItem.style.transform = '';
        });
        
        groupsList.appendChild(groupItem);
    });
}

// Add fadeInUp animation
if (!document.getElementById('fade-in-up-style')) {
    const fadeInUpStyle = document.createElement('style');
    fadeInUpStyle.id = 'fade-in-up-style';
    fadeInUpStyle.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(fadeInUpStyle);
}

// Update tab counts
function updateTabCounts() {
    // Update members count
    const membersCount = document.getElementById('members-count');
    if (membersCount) {
        membersCount.textContent = TheBill.members ? TheBill.members.length : 0;
    }
    
    // Update payments count
    const paymentsCount = document.getElementById('payments-count');
    if (paymentsCount) {
        paymentsCount.textContent = TheBill.payments ? TheBill.payments.length : 0;
    }
}

// Update the renderMembers function to add drag-and-drop functionality
async function renderMembers() {
    const membersList = document.getElementById('members-list');
    if (!membersList || !TheBill.members) return;
    
    membersList.innerHTML = '';
    
    if (TheBill.members.length === 0) {
        membersList.innerHTML = '<div class="card"><p class="text-center">אין חברים בקבוצה זו</p></div>';
        return;
    }
    
    // Get active households
    let households = [];
    try {
        households = await API.getHouseholds(TheBill.currentGroup.name);
    } catch (error) {
        console.error("Error loading households:", error);
    }
    
    // Track which members are in households
    const householdMembers = new Set();
    households.forEach(household => {
        household.member_full_names.forEach(name => householdMembers.add(name));
    });
    
    // Render households first
    households.forEach(household => {
        const householdDiv = document.createElement('div');
        householdDiv.className = 'household-container';
        
        // Calculate total balance for household
        let totalBalance = 0;
        household.member_full_names.forEach(memberName => {
            const member = TheBill.members.find(m => `${m.first_name} ${m.last_name}` === memberName);
            if (member) {
                totalBalance += member.balance || 0;
            }
        });
        
        const balanceClass = totalBalance > 0 ? 'positive-balance' : 
                            totalBalance < 0 ? 'negative-balance' : '';
        
        householdDiv.innerHTML = `
            <div class="household-header">
                <div class="household-title">
                    <span class="household-icon">🏠</span>
                    <span>${household.name}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="household-balance ${balanceClass}">${formatCurrency(totalBalance)}</div>
                    <button class="household-delete-btn" onclick="deleteHousehold('${household.id}')" title="פרק תא משפחתי">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="household-members-grid">
                ${household.member_full_names.map(memberName => {
                    const member = TheBill.members.find(m => `${m.first_name} ${m.last_name}` === memberName);
                    const memberBalance = member ? member.balance : 0;
                    const memberBalanceClass = memberBalance > 0 ? 'positive-balance' : 
                                              memberBalance < 0 ? 'negative-balance' : '';
                    return `
                        <div class="household-member-card">
                            <span>${getInitials(memberName)}</span>
                            <span>${memberName}</span>
                            <small style="opacity: 0.8;">(${formatCurrency(memberBalance)})</small>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        membersList.appendChild(householdDiv);
    });
    
    // Render individual members (not in households)
    TheBill.members.forEach(member => {
        const fullName = `${member.first_name} ${member.last_name}`;
        
        // Skip if member is in a household
        if (householdMembers.has(fullName)) {
            return;
        }
        
        const initials = getInitials(fullName);
        const balanceClass = member.balance > 0 ? 'positive-balance' : 
                            member.balance < 0 ? 'negative-balance' : '';
        
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.setAttribute('draggable', 'true');
        memberItem.dataset.member = fullName;
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
        
        // Add drag events for member merging
        memberItem.addEventListener('dragstart', handleDragStart);
        memberItem.addEventListener('dragend', handleDragEnd);
        memberItem.addEventListener('dragover', handleDragOver);
        memberItem.addEventListener('dragenter', handleDragEnter);
        memberItem.addEventListener('dragleave', handleDragLeave);
        memberItem.addEventListener('drop', handleDrop);
        
        membersList.appendChild(memberItem);
    });
    
    // Add hint if there are no households yet and more than 1 member
    if (households.length === 0 && TheBill.members.length >= 2) {
        const hint = document.createElement('div');
        hint.className = 'household-hint';
        hint.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <strong>טיפ:</strong> גרור חבר אל חבר אחר כדי ליצור תא משפחתי וליחד את החובות שלהם
        `;
        membersList.appendChild(hint);
    }
    
    // Update tab counts
    updateTabCounts();
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

async function renderGroupTransfers() {
    const transfersList = document.getElementById('transfers-list');
    if (!transfersList) return;
    
    transfersList.innerHTML = '';
    
    try {
        // Get transfers and households
        const transfers = await API.getTransfers(TheBill.currentGroup.name);
        const households = await API.getHouseholds(TheBill.currentGroup.name);
        
        // Create a map of household IDs to household names
        const householdMap = new Map();
        households.forEach(household => {
            householdMap.set(household.id, household.name);
        });
        
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
            // Check if from/to are households
            const fromIsHousehold = householdMap.has(transfer.from_id);
            const toIsHousehold = householdMap.has(transfer.to_id);
            
            const fromIcon = fromIsHousehold ? '🏠 ' : '';
            const toIcon = toIsHousehold ? '🏠 ' : '';
            
            const transferItem = document.createElement('div');
            transferItem.className = 'transfer-item';
            transferItem.innerHTML = `
                <div class="transfer-from">${fromIcon}${transfer.from}</div>
                <div class="transfer-arrow">→</div>
                <div class="transfer-to">${toIcon}${transfer.to}</div>
                <div class="transfer-amount">${formatCurrency(transfer.amount)}</div>
            `;
            cardBody.appendChild(transferItem);
        });
        
        transfersCard.appendChild(cardBody);
        transfersList.appendChild(transfersCard);
    } catch (error) {
        console.error("Error rendering transfers:", error);
        showError("שגיאה בטעינת העברות כספים. אנא נסה שנית.");
    }
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
        
        // Update tab counts
        updateTabCounts();
        
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
    
    // Store the payment ID in the title element for later reference
    const titleElement = document.getElementById('payment-title');
    titleElement.textContent = payment.title;
    titleElement.setAttribute('data-payment-id', paymentId);
    
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

    // Back buttons - Revert to simple navigation
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
    
    // Export member summaries button
    const exportSummaryBtn = document.getElementById('export-summary-btn');
    if (exportSummaryBtn) {
        exportSummaryBtn.addEventListener('click', async () => {
            try {
                if (!TheBill.currentGroup || !TheBill.members || TheBill.members.length === 0) {
                    showError("אין נתונים להצגה");
                    return;
                }
                
                const summaryText = await generateMembersSummary();
                showSummaryModal(summaryText);
                
            } catch (error) {
                console.error("Error generating summary:", error);
                showError("שגיאה בייצוא סיכום תשלומים");
            }
        });
    }

    // Edit payment functionality
    document.getElementById('edit-payment-btn')?.addEventListener('click', () => {
        console.log("Edit payment button clicked");
        const paymentId = document.getElementById('payment-title').getAttribute('data-payment-id');
        const payment = TheBill.payments.find(p => p.id === paymentId);
        
        if (!payment) {
            showError("לא נמצאו פרטי תשלום");
            return;
        }
        
        // Set form values
        document.getElementById('edit-payment-id').value = payment.id;
        document.getElementById('edit-payment-title').value = payment.title;
        document.getElementById('edit-payment-amount').value = payment.amount;
        document.getElementById('edit-payment-desc').value = payment.description || '';
        
        // Populate payer dropdown
        const payerSelect = document.getElementById('edit-payment-payer');
        payerSelect.innerHTML = '';
        
        TheBill.members.forEach(member => {
            const fullName = `${member.first_name} ${member.last_name}`;
            const option = document.createElement('option');
            option.value = fullName;
            option.textContent = fullName;
            option.selected = (fullName === payment.payer_name);
            payerSelect.appendChild(option);
        });
        
        // Populate participants checkboxes
        const participantsDiv = document.getElementById('edit-payment-participants');
        participantsDiv.innerHTML = '';
        
        TheBill.members.forEach(member => {
            const fullName = `${member.first_name} ${member.last_name}`;
            
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `edit-participant-${fullName}`;
            checkbox.name = 'participants';
            checkbox.value = fullName;
            checkbox.checked = payment.participants.includes(fullName);
            
            const label = document.createElement('label');
            label.htmlFor = `edit-participant-${fullName}`;
            label.textContent = fullName;
            
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);
            participantsDiv.appendChild(checkboxItem);
        });
        
        openModal('edit-payment-modal');
    });
    
    // Delete payment functionality
    document.getElementById('delete-payment-btn')?.addEventListener('click', async () => {
        console.log("Delete payment button clicked");
        const paymentId = document.getElementById('payment-title').getAttribute('data-payment-id');
        const payment = TheBill.payments.find(p => p.id === paymentId);
        
        if (!payment) {
            showError("לא נמצאו פרטי תשלום");
            return;
        }
        
        if (confirm(`האם אתה בטוח שברצונך למחוק את התשלום "${payment.title}"?`)) {
            try {
                await API.deletePayment(TheBill.currentGroup.name, paymentId);
                showSuccess("התשלום נמחק בהצלחה");
                
                // Reload group data and return to group screen
                await API.loadGroup(TheBill.currentGroup.name);
                renderPayments();
                renderMembers();
                showScreen('group-screen');
            } catch (error) {
                showError(error.message || "שגיאה במחיקת התשלום");
            }
        }
    });
    
    // Edit payment form submission
    document.getElementById('edit-payment-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Edit payment form submitted");
        
        const paymentId = document.getElementById('edit-payment-id').value;
        const title = document.getElementById('edit-payment-title').value;
        const amount = parseFloat(document.getElementById('edit-payment-amount').value);
        const payerName = document.getElementById('edit-payment-payer').value;
        const description = document.getElementById('edit-payment-desc').value;
        
        // Get selected participants
        const participants = [];
        document.querySelectorAll('#edit-payment-participants input[type="checkbox"]:checked').forEach(checkbox => {
            participants.push(checkbox.value);
        });
        
        if (participants.length === 0) {
            showError("יש לבחור לפחות משתתף אחד");
            return;
        }
        
        try {
            await API.editPayment(
                TheBill.currentGroup.name, 
                paymentId, 
                title, 
                amount, 
                payerName, 
                participants, 
                description
            );
            
            closeModal('edit-payment-modal');
            showSuccess(`התשלום "${title}" עודכן בהצלחה`);
            
            // Reload current group and update UI
            await API.loadGroup(TheBill.currentGroup.name);
            
            // If we're on the payment screen, refresh the payment details
            if (document.getElementById('payment-screen').classList.contains('active')) {
                loadPaymentDetails(paymentId);
            } else {
                renderMembers();
                renderPayments();
            }
        } catch (error) {
            showError(error.message || "שגיאה בעדכון התשלום");
        }
    });
    
    // Edit member functionality
    document.getElementById('edit-member-btn')?.addEventListener('click', () => {
        console.log("Edit member button clicked");
        const memberFullName = document.getElementById('member-name').textContent;
        const member = TheBill.members.find(m => 
            `${m.first_name} ${m.last_name}` === memberFullName);
        
        if (!member) {
            showError("לא נמצאו פרטי חבר");
            return;
        }
        
        // Set form values
        document.getElementById('edit-member-old-name').value = memberFullName;
        document.getElementById('edit-first-name').value = member.first_name;
        document.getElementById('edit-last-name').value = member.last_name;
        
        // Set permissions
        const canAddPayments = TheBill.currentGroup.permissions[memberFullName] !== false;
        document.getElementById('edit-member-permissions').value = canAddPayments ? 'true' : 'false';
        
        openModal('edit-member-modal');
    });
    
    // Delete member functionality
    document.getElementById('remove-member-btn')?.addEventListener('click', async () => {
        console.log("Remove member button clicked");
        const memberFullName = document.getElementById('member-name').textContent;
        
        if (!memberFullName) {
            showError("לא נמצאו פרטי חבר");
            return;
        }
        
        if (confirm(`האם אתה בטוח שברצונך להסיר את ${memberFullName} מהקבוצה?`)) {
            try {
                await API.removeMember(TheBill.currentGroup.name, memberFullName);
                showSuccess(`${memberFullName} הוסר מהקבוצה בהצלחה`);
                
                // Reload group data and return to group screen
                await API.loadGroup(TheBill.currentGroup.name);
                renderMembers();
                showScreen('group-screen');
            } catch (error) {
                showError(error.message || "שגיאה בהסרת החבר");
            }
        }
    });
    
    // Edit member form submission
    document.getElementById('edit-member-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Edit member form submitted");
        
        const oldFullName = document.getElementById('edit-member-old-name').value;
        const newFirstName = document.getElementById('edit-first-name').value;
        const newLastName = document.getElementById('edit-last-name').value;
        const canAddPayments = document.getElementById('edit-member-permissions').value === 'true';
        
        try {
            // Update member details
            await API.editMember(TheBill.currentGroup.name, oldFullName, newFirstName, newLastName);
            
            // Update permissions
            const newFullName = `${newFirstName} ${newLastName}`;
            await API.setPermissions(TheBill.currentGroup.name, newFullName, canAddPayments);
            
            closeModal('edit-member-modal');
            showSuccess("פרטי החבר עודכנו בהצלחה");
            
            // Reload current group and update UI
            await API.loadGroup(TheBill.currentGroup.name);
            
            // If we're on the member screen, refresh the member details
            if (document.getElementById('member-screen').classList.contains('active')) {
                loadMemberDetails(`${newFirstName} ${newLastName}`);
            } else {
                renderMembers();
            }
        } catch (error) {
            showError(error.message || "שגיאה בעדכון פרטי החבר");
        }
    });

    // Edit group button
    document.getElementById('edit-group-btn')?.addEventListener('click', () => {
        if (!TheBill.currentGroup) return;
        
        // Set current group name
        document.getElementById('edit-group-name').value = TheBill.currentGroup.name;
        
        // Open edit modal
        openModal('edit-group-modal');
    });
    
    // Edit group form submission
    document.getElementById('edit-group-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const oldGroupName = TheBill.currentGroup.name;
        const newGroupName = document.getElementById('edit-group-name').value.trim();
        
        if (!newGroupName) {
            showError("שם הקבוצה אינו יכול להיות ריק");
            return;
        }
        
        try {
            await API.editGroupName(oldGroupName, newGroupName);
            closeModal('edit-group-modal');
            showSuccess(`שם הקבוצה שונה ל-"${newGroupName}"`);
            
            // Update UI
            document.getElementById('group-name').textContent = newGroupName;
            
            // Reload groups list for sidebar
            await API.loadGroups();
        } catch (error) {
            showError(error.message || "שגיאה בעדכון שם הקבוצה");
        }
    });
    
    // Delete group button
    document.getElementById('delete-group-btn')?.addEventListener('click', () => {
        if (!TheBill.currentGroup) return;
        
        // Set group name in confirmation dialog
        document.getElementById('delete-group-name').textContent = TheBill.currentGroup.name;
        
        // Open delete modal
        openModal('delete-group-modal');
    });
    
    // Confirm delete group button
    document.getElementById('confirm-delete-group-btn')?.addEventListener('click', async () => {
        if (!TheBill.currentGroup) return;
        
        try {
            await API.deleteGroup(TheBill.currentGroup.name);
            closeModal('delete-group-modal');
            showSuccess(`הקבוצה "${TheBill.currentGroup.name}" נמחקה בהצלחה`);
            
            // Return to groups screen and reload groups
            showScreen('groups-screen', true); // Reset history
            await API.loadGroups();
            renderGroupsList();
        } catch (error) {
            showError(error.message || "שגיאה במחיקת הקבוצה");
        }
    });

    // Close modal button (fix for cancel button in merge modal)
    document.querySelectorAll('.close-modal-btn').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Help button
    document.getElementById('help-btn')?.addEventListener('click', () => {
        openModal('help-modal');
    });
}

// Generate detailed text summaries for all members
async function generateMembersSummary() {
    if (!TheBill.currentGroup || !TheBill.members || TheBill.members.length === 0) {
        throw new Error("אין נתונים להצגה");
    }
    
    const groupName = TheBill.currentGroup.name;
    let allMembersSummary = `📊 סיכום תשלומים לקבוצה: ${groupName} 📊\n`;
    allMembersSummary += `${new Date().toLocaleDateString('he-IL')}\n\n`;
    
    // Get all transfers and households
    const transfers = await API.getTransfers(groupName);
    const households = await API.getHouseholds(groupName);
    
    // Track which members are in households
    const householdMembers = new Set();
    const householdMap = new Map(); // household.id -> household
    households.forEach(household => {
        householdMap.set(household.id, household);
        household.member_full_names.forEach(name => householdMembers.add(name));
    });
    
    // Calculate group totals
    let totalPaid = 0;
    let totalDue = 0;
    let totalToReceive = 0;
    
    // Process each member for group totals
    for (const member of TheBill.members) {
        const fullName = `${member.first_name} ${member.last_name}`;
        const memberSummary = await API.getMemberSummary(groupName, fullName);
        
        // Get total paid by this member
        let memberPaid = 0;
        if (memberSummary.related_payments.paid_by_member && memberSummary.related_payments.paid_by_member.length > 0) {
            memberPaid = memberSummary.related_payments.paid_by_member.reduce((total, payment) => total + payment.amount, 0);
        }
        totalPaid += memberPaid;
        
        // Track amounts to pay or receive (only count once per household or individual)
        if (!householdMembers.has(fullName)) {
            if (member.balance < 0) {
                totalDue += Math.abs(member.balance);
            } else if (member.balance > 0) {
                totalToReceive += member.balance;
            }
        }
    }
    
    // Add household balances to totals
    households.forEach(household => {
        let householdBalance = 0;
        household.member_full_names.forEach(memberName => {
            const member = TheBill.members.find(m => `${m.first_name} ${m.last_name}` === memberName);
            if (member) {
                householdBalance += member.balance || 0;
            }
        });
        
        if (householdBalance < 0) {
            totalDue += Math.abs(householdBalance);
        } else if (householdBalance > 0) {
            totalToReceive += householdBalance;
        }
    });
    
    // Add overall group summary
    allMembersSummary += `🔸 סה״כ הוצאות בקבוצה: ${formatCurrency(totalPaid)}\n`;
    allMembersSummary += `🔸 סה״כ לתשלום: ${formatCurrency(totalDue)}\n`;
    allMembersSummary += `🔸 סה״כ לקבלה: ${formatCurrency(totalToReceive)}\n\n`;
    allMembersSummary += `--- פירוט לפי חבר ---\n\n`;
    
    // Process households first
    for (const household of households) {
        allMembersSummary += `👤 ${household.name}\n`;
        
        // Calculate total balance for household
        let totalHouseholdBalance = 0;
        let totalHouseholdPaid = 0;
        
        for (const memberName of household.member_full_names) {
            const member = TheBill.members.find(m => `${m.first_name} ${m.last_name}` === memberName);
            if (member) {
                totalHouseholdBalance += member.balance || 0;
                
                // Get member summary to calculate total paid
                const memberSummary = await API.getMemberSummary(groupName, memberName);
                if (memberSummary.related_payments.paid_by_member && memberSummary.related_payments.paid_by_member.length > 0) {
                    const memberPaid = memberSummary.related_payments.paid_by_member.reduce((total, payment) => total + payment.amount, 0);
                    totalHouseholdPaid += memberPaid;
                }
            }
        }
        
        // Add balance information
        if (totalHouseholdBalance > 0) {
            allMembersSummary += `💰 מאזן: ${formatCurrency(totalHouseholdBalance)} (לקבל)\n`;
        } else if (totalHouseholdBalance < 0) {
            allMembersSummary += `💸 מאזן: ${formatCurrency(totalHouseholdBalance)} (לשלם)\n`;
        } else {
            allMembersSummary += `⚖️ מאזן: ${formatCurrency(totalHouseholdBalance)} (מאוזן)\n`;
        }
        
        if (totalHouseholdPaid > 0) {
            allMembersSummary += `📥 סה״כ שולם: ${formatCurrency(totalHouseholdPaid)}\n`;
        }
        
        // Get transfers for this household
        const householdTransfers = transfers.filter(t => 
            t.from_id === household.id || t.to_id === household.id
        );
        
        // Add payment details
        const paysTo = householdTransfers.filter(t => t.from_id === household.id);
        if (paysTo.length > 0) {
            allMembersSummary += `📤 לשלם:\n`;
            let totalToPay = 0;
            paysTo.forEach(transfer => {
                allMembersSummary += `   • ל${transfer.to}: ${formatCurrency(transfer.amount)}\n`;
                totalToPay += transfer.amount;
            });
            allMembersSummary += `   • סה״כ לשלם: ${formatCurrency(totalToPay)}\n`;
        }
        
        const receivesFrom = householdTransfers.filter(t => t.to_id === household.id);
        if (receivesFrom.length > 0) {
            allMembersSummary += `📥 לקבל:\n`;
            let totalToReceive = 0;
            receivesFrom.forEach(transfer => {
                allMembersSummary += `   • מ${transfer.from}: ${formatCurrency(transfer.amount)}\n`;
                totalToReceive += transfer.amount;
            });
            allMembersSummary += `   • סה״כ לקבל: ${formatCurrency(totalToReceive)}\n`;
        }
        
        allMembersSummary += `\n`;
    }
    
    // Process individual members (not in households)
    for (const member of TheBill.members) {
        const fullName = `${member.first_name} ${member.last_name}`;
        
        // Skip if member is in a household
        if (householdMembers.has(fullName)) {
            continue;
        }
        
        const memberSummary = await API.getMemberSummary(groupName, fullName);
        
        allMembersSummary += `👤 ${fullName}\n`;
        
        // Add balance information
        if (member.balance > 0) {
            allMembersSummary += `💰 מאזן: ${formatCurrency(member.balance)} (לקבל)\n`;
        } else if (member.balance < 0) {
            allMembersSummary += `💸 מאזן: ${formatCurrency(member.balance)} (לשלם)\n`;
        } else {
            allMembersSummary += `⚖️ מאזן: ${formatCurrency(member.balance)} (מאוזן)\n`;
        }
        
        // Get total paid by this member
        let memberPaid = 0;
        if (memberSummary.related_payments.paid_by_member && memberSummary.related_payments.paid_by_member.length > 0) {
            memberPaid = memberSummary.related_payments.paid_by_member.reduce((total, payment) => total + payment.amount, 0);
            allMembersSummary += `📥 סה״כ שולם: ${formatCurrency(memberPaid)}\n`;
        }
        
        // Add payment details
        if (memberSummary.transfers.pays_to && memberSummary.transfers.pays_to.length > 0) {
            allMembersSummary += `📤 לשלם:\n`;
            let totalToPay = 0;
            memberSummary.transfers.pays_to.forEach(transfer => {
                allMembersSummary += `   • ל${transfer.to}: ${formatCurrency(transfer.amount)}\n`;
                totalToPay += transfer.amount;
            });
            allMembersSummary += `   • סה״כ לשלם: ${formatCurrency(totalToPay)}\n`;
        }
        
        if (memberSummary.transfers.receives_from && memberSummary.transfers.receives_from.length > 0) {
            allMembersSummary += `📥 לקבל:\n`;
            let totalToReceive = 0;
            memberSummary.transfers.receives_from.forEach(transfer => {
                allMembersSummary += `   • מ${transfer.from}: ${formatCurrency(transfer.amount)}\n`;
                totalToReceive += transfer.amount;
            });
            allMembersSummary += `   • סה״כ לקבל: ${formatCurrency(totalToReceive)}\n`;
        }
        
        allMembersSummary += `\n`;
    }
    
    allMembersSummary += `----------------------------------\n`;
    allMembersSummary += `הופק באמצעות TheBill`;
    
    return allMembersSummary;
}

async function generateHouseholdSummary(household) {
    if (!TheBill.currentGroup || !household) {
        throw new Error("אין נתונים להצגה");
    }
    
    const groupName = TheBill.currentGroup.name;
    let summary = `🏠 סיכום תשלומים לתא משפחתי: ${household.name} 🏠\n`;
    summary += `קבוצה: ${groupName}\n`;
    summary += `${new Date().toLocaleDateString('he-IL')}\n\n`;
    
    summary += `👨‍👩‍👧‍👦 חברי התא:\n`;
    household.member_full_names.forEach(name => {
        summary += `   • ${name}\n`;
    });
    summary += `\n`;
    
    // Calculate total balance for household
    let totalHouseholdBalance = 0;
    let totalHouseholdPaid = 0;
    
    for (const memberName of household.member_full_names) {
        const member = TheBill.members.find(m => `${m.first_name} ${m.last_name}` === memberName);
        if (member) {
            totalHouseholdBalance += member.balance || 0;
            
            // Get member summary to calculate total paid
            const memberSummary = await API.getMemberSummary(groupName, memberName);
            if (memberSummary.related_payments.paid_by_member && memberSummary.related_payments.paid_by_member.length > 0) {
                const memberPaid = memberSummary.related_payments.paid_by_member.reduce((total, payment) => total + payment.amount, 0);
                totalHouseholdPaid += memberPaid;
            }
        }
    }
    
    summary += `💰 מאזן כולל של התא: ${formatCurrency(totalHouseholdBalance)}`;
    if (totalHouseholdBalance > 0) {
        summary += ` (לקבל)\n`;
    } else if (totalHouseholdBalance < 0) {
        summary += ` (לשלם)\n`;
    } else {
        summary += ` (מאוזן)\n`;
    }
    
    summary += `📥 סה״כ שולם על ידי התא: ${formatCurrency(totalHouseholdPaid)}\n\n`;
    
    // Get transfers
    const transfers = await API.getTransfers(groupName);
    
    // Filter transfers relevant to this household
    const householdTransfers = transfers.filter(t => 
        t.from_id === household.id || t.to_id === household.id
    );
    
    if (householdTransfers.length > 0) {
        summary += `--- העברות מומלצות ---\n\n`;
        
        householdTransfers.forEach(transfer => {
            if (transfer.from_id === household.id) {
                summary += `📤 ${household.name} → ${transfer.to}: ${formatCurrency(transfer.amount)}\n`;
            } else if (transfer.to_id === household.id) {
                summary += `📥 ${transfer.from} → ${household.name}: ${formatCurrency(transfer.amount)}\n`;
            }
        });
    } else {
        summary += `✅ התא מאוזן - אין צורך בהעברות כספים\n`;
    }
    
    summary += `\n----------------------------------\n`;
    summary += `פירוט לפי חבר בתא:\n\n`;
    
    // Add individual member details
    for (const memberName of household.member_full_names) {
        const member = TheBill.members.find(m => `${m.first_name} ${m.last_name}` === memberName);
        if (!member) continue;
        
        const memberSummary = await API.getMemberSummary(groupName, memberName);
        
        summary += `👤 ${memberName}\n`;
        summary += `⚖️ מאזן אישי: ${formatCurrency(member.balance)}\n`;
        
        // Get total paid by this member
        if (memberSummary.related_payments.paid_by_member && memberSummary.related_payments.paid_by_member.length > 0) {
            const memberPaid = memberSummary.related_payments.paid_by_member.reduce((total, payment) => total + payment.amount, 0);
            summary += `📥 שולם: ${formatCurrency(memberPaid)}\n`;
            
            summary += `   תשלומים:\n`;
            memberSummary.related_payments.paid_by_member.forEach(payment => {
                summary += `   • ${payment.title}: ${formatCurrency(payment.amount)}\n`;
            });
        }
        
        summary += `\n`;
    }
    
    summary += `----------------------------------\n`;
    summary += `הופק באמצעות TheBill`;
    
    return summary;
}

// Copy text to clipboard
function copyToClipboard(text) {
    // Create temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.select();
    document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textarea);
}

// Show the enhanced summary in modal with copy button
function showSummaryModal(summaryText) {
    // Create modal if it doesn't exist (though we now have it in HTML)
    const summaryModal = document.getElementById('summary-modal');
    const summaryContent = document.getElementById('summary-content');
    
    // Set the summary text
    summaryContent.textContent = summaryText;
    
    // Setup copy button
    const copyButton = document.getElementById('copy-summary-btn');
    copyButton.onclick = () => {
        copyToClipboard(summaryText);
        copyButton.innerHTML = '<i class="fas fa-check"></i> הועתק';
        setTimeout(() => {
            copyButton.innerHTML = '<i class="fas fa-copy"></i> העתק ללוח';
        }, 2000);
        showSuccess("הסיכום הועתק ללוח");
    };
    
    // Display modal
    summaryModal.style.display = 'flex';
}

// Drag and Drop Functions for Member Merging
let draggedMember = null;

function handleDragStart(e) {
    draggedMember = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.member);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Remove drop target highlighting from all members
    document.querySelectorAll('.member-item').forEach(item => {
        item.classList.remove('drop-target');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Allow drop
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    // Only highlight if this is a different member
    if (this !== draggedMember) {
        this.classList.add('drop-target');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drop-target');
}

function handleDrop(e) {
    e.stopPropagation();
    
    // Only proceed if dragged to another member
    if (draggedMember !== this) {
        const fromMember = draggedMember.dataset.member;
        const toMember = this.dataset.member;
        
        // Show household creation modal instead of merge modal
        showCreateHouseholdModal(fromMember, toMember);
    }
    
    return false;
}

function showCreateHouseholdModal(member1, member2) {
    // Populate modal with member info
    document.getElementById('household-member1-name').textContent = member1;
    document.getElementById('household-member2-name').textContent = member2;
    
    // Set avatars
    document.getElementById('household-member1-avatar').textContent = getInitials(member1);
    document.getElementById('household-member2-avatar').textContent = getInitials(member2);
    
    // Clear previous household name
    document.getElementById('household-name-input').value = '';
    
    // Setup confirmation button
    const confirmBtn = document.getElementById('confirm-household-btn');
    confirmBtn.onclick = async () => {
        try {
            const householdName = document.getElementById('household-name-input').value.trim();
            await createHousehold(member1, member2, householdName);
            closeModal('create-household-modal');
            showSuccess(`תא משפחתי נוצר בהצלחה! 🏠`);
        } catch (error) {
            showError(error.message || "שגיאה ביצירת תא משפחתי");
        }
    };
    
    // Open the modal
    openModal('create-household-modal');
}

async function createHousehold(member1, member2, name = '') {
    try {
        if (!TheBill.currentGroup) {
            throw new Error("לא נבחרה קבוצה");
        }
        
        console.log(`Creating household with ${member1} and ${member2}`);
        
        const household = await API.createHousehold(
            TheBill.currentGroup.name,
            [member1, member2],
            name
        );
        
        console.log("Household created:", household);
        
        // Reload group data to reflect the new household
        await loadGroup(TheBill.currentGroup.name);
        
        return household;
    } catch (error) {
        console.error("Error creating household:", error);
        throw error;
    }
}

async function deleteHousehold(householdId) {
    try {
        if (!TheBill.currentGroup) {
            throw new Error("לא נבחרה קבוצה");
        }
        
        console.log(`Deleting household ${householdId}`);
        
        await API.deleteHousehold(TheBill.currentGroup.name, householdId);
        
        console.log("Household deleted successfully");
        
        // Reload group data
        await loadGroup(TheBill.currentGroup.name);
        showSuccess("תא משפחתי הוסר בהצלחה");
        
    } catch (error) {
        console.error("Error deleting household:", error);
        showError(error.message || "שגיאה במחיקת תא משפחתי");
    }
}

function showMergeMembersModal(fromMember, toMember) {
    // Populate modal with member info
    document.getElementById('member-to-merge-from').textContent = fromMember;
    document.getElementById('member-to-merge-to').textContent = toMember;
    
    // Setup confirmation button
    const confirmBtn = document.getElementById('confirm-merge-btn');
    confirmBtn.onclick = async () => {
        try {
            await mergeMembers(fromMember, toMember);
            closeModal('merge-members-modal');
            showSuccess(`${fromMember} אוחד בהצלחה עם ${toMember}`);
        } catch (error) {
            showError(error.message || "שגיאה באיחוד החברים");
        }
    };
    
    // Open the modal
    openModal('merge-members-modal');
}

// Enhanced member merging to combine names and treat as single unit
async function mergeMembers(fromMember, toMember) {
    try {
        if (!TheBill.currentGroup) {
            throw new Error("לא נבחרה קבוצה");
        }
        
        console.log(`Attempting to merge ${fromMember} into ${toMember}`);
        
        // Format the combined name for the API
        const combinedName = `${fromMember} + ${toMember}`;
        
        const result = await API.mergeMembers(TheBill.currentGroup.name, fromMember, toMember, combinedName);
        
        // Reload group data after successful merge
        if (result) {
            await API.loadGroup(TheBill.currentGroup.name);
            renderMembers();
            renderPayments();
            renderGroupTransfers();
        }
        
        return result;
    } catch (error) {
        console.error("Error merging members:", error);
        throw error;
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
