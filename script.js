function getExpenses(text) {
    return text.split('\n').map(line => {
        let parts = line.split('\t');
        return { name: parts[0], paid: parseFloat(parts[1]) || 0 };
    });
}
function balanceExpenses(expenses, tolerance = 2) {
    let people = expenses;
    let total = people.reduce((sum, p) => sum + p.paid, 0);
    let fairShare = total / people.length;

    // Calculate balance per person
    let creditors = [], debtors = [], ignored = [];
    people.forEach(p => {
        let balance = p.paid - fairShare;
        if (balance > tolerance) {
            creditors.push({ name: p.name, balance });
        } else if (balance < -tolerance) {
            debtors.push({ name: p.name, balance });
        } else {
            ignored.push({ name: p.name, balance });
        }
    });

    creditors.sort((a, b) => b.balance - a.balance); // Sort descending
    debtors.sort((a, b) => a.balance - b.balance);   // Sort ascending

    let transactions = [];

    while (creditors.length && debtors.length) {
        let creditor = creditors[0];
        let debtor = debtors[0];
        let amount = Math.min(creditor.balance, -debtor.balance);

        transactions.push(`${debtor.name} pays ${creditor.name} ${amount.toFixed(2)}`);

        creditor.balance -= amount;
        debtor.balance += amount;

        if (Math.abs(creditor.balance) <= tolerance) creditors.shift();
        if (Math.abs(debtor.balance) <= tolerance) debtors.shift();
    }

    return {
        transactions,
        ignored // Return the ignored people too
    };
}

function runExpenseBalancer() {
    let expensesText = document.getElementById('expensesText').value;

    // Strip leading/trailing newlines and spaces
    expensesText = expensesText.trim();

    // Check if the text is empty
    if (!expensesText) {
        alert('Please paste the expenses data.');
        return;
    }

    // Split into lines and remove blank lines
    const lines = expensesText.split('\n').filter(line => line.trim() !== '');

    // Get the tolerance value, set default to 2 if invalid (NaN or empty)
    const toleranceInput = document.getElementById('tolerance').value;
    const tolerance = isNaN(parseFloat(toleranceInput)) || parseFloat(toleranceInput) < 0 ? 2 : parseFloat(toleranceInput);

    const expenses = getExpenses(lines.join('\n'));
    const result = balanceExpenses(expenses, tolerance);

    const resultDiv = document.getElementById('result');
    resultDiv.textContent = result.transactions.join('\n') || 'No transactions needed.';

    // Print ignored people (those within tolerance range)
    const ignoredDiv = document.getElementById('ignored');
    if (result.ignored.length > 0) {
        ignoredDiv.textContent = `Ignored (within tolerance range):\n` + result.ignored.map(p => `${p.name}: ${p.balance.toFixed(2)}`).join('\n');
    } else {
        ignoredDiv.textContent = 'No transactions were ignored.';
    }
}
